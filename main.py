"""
ESP32 Sensor Reader — DHT11 + Soil Moisture
Reads serial data from ESP32 and displays live sensor readings.

Expected serial format from ESP32 (one of these):
  1. JSON:    {"temperature": 28.5, "humidity": 65.0, "soil": 42}
  2. CSV:     28.5,65.0,42
  3. Labeled: Temp:28.5 Hum:65.0 Soil:42

Usage:
  pip install pyserial rich
  python esp32_sensor_reader.py
  python esp32_sensor_reader.py --port COM3 --baud 115200
"""

import serial
import serial.tools.list_ports
import json
import re
import time
import argparse
import urllib.request
import urllib.error
from datetime import datetime

try:
    from rich.console import Console
    from rich.table import Table
    from rich.live import Live
    from rich.panel import Panel
    from rich.columns import Columns
    from rich.text import Text
    from rich import box
    RICH_AVAILABLE = True
except ImportError:
    RICH_AVAILABLE = False

# ── Config ────────────────────────────────────────────────────────────────────

DEFAULT_BAUD = 115200
LOG_FILE     = "sensor_log.csv"
DEFAULT_API_URL = "http://localhost:5001/api/sensor-data"

# ── Helpers ───────────────────────────────────────────────────────────────────

def list_ports():
    ports = serial.tools.list_ports.comports()
    if not ports:
        print("No COM ports found.")
        return []
    print("\nAvailable COM ports:")
    for p in ports:
        print(f"  {p.device:12s} — {p.description}")
    print()
    return ports


def auto_detect_port():
    """Return the first port that looks like an ESP32/USB-serial adapter."""
    keywords = ["USB", "CP210", "CH340", "UART", "ESP", "Silicon"]
    for p in serial.tools.list_ports.comports():
        if any(k.lower() in p.description.lower() for k in keywords):
            return p.device
    ports = serial.tools.list_ports.comports()
    return ports[0].device if ports else None


def parse_line(line: str):
    """
    Try JSON → CSV → labeled-key patterns.
    Returns dict with any of: temperature, humidity, soil
    """
    line = line.strip()
    if not line:
        return None

    # ── JSON ──────────────────────────────────────────────────────────────────
    try:
        data = json.loads(line)
        result = {}
        for key in ("temperature", "temp", "t"):
            if key in data:
                result["temperature"] = float(data[key]); break
        for key in ("humidity", "hum", "h", "rh"):
            if key in data:
                result["humidity"] = float(data[key]); break
        for key in ("soil", "soil moisture", "moisture", "soil_moisture", "soilMoisture", "moisture_value", "sm", "moist"):
            if key in data:
                result["soil"] = float(data[key]); break
        return result if result else None
    except (json.JSONDecodeError, ValueError):
        pass

    # ── Labeled: Temp:28.5 Hum:65 Soil:42 ────────────────────────────────────
    patterns = {
        "temperature": r"(?:temp(?:erature)?|t)\s*[=:]\s*([-\d.]+)",
        "humidity":    r"(?:hum(?:idity)?|rh|h)\s*[=:]\s*([-\d.]+)",
        "soil":        r"(?:soil(?:[ _]?moisture)?|soilmoisture|moisture(?:_value)?|moist|sm)\s*[=:]\s*([-\d.]+)",
    }
    result = {}
    for field, pat in patterns.items():
        m = re.search(pat, line, re.IGNORECASE)
        if m:
            result[field] = float(m.group(1))
    if result:
        return result

    # ── Plain CSV: 28.5,65.0,42  or  28.5 65.0 42 ────────────────────────────
    parts = re.split(r"[,\s]+", line)
    nums = []
    for p in parts:
        try:
            nums.append(float(p))
        except ValueError:
            pass
    if len(nums) >= 2:
        result = {"temperature": nums[0], "humidity": nums[1]}
        if len(nums) >= 3:
            result["soil"] = nums[2]
        return result

    return None


def soil_status(value):
    if value is None:
        return "—", "white"
    if value < 30:
        return "Dry", "red"
    if value < 60:
        return "Moist", "green"
    return "Wet", "blue"


def temp_status(value):
    if value is None:
        return "—", "white"
    if value < 10:
        return "Cold", "blue"
    if value < 35:
        return "Normal", "green"
    return "Hot", "red"


def push_to_backend(api_url: str, readings: dict, timeout: float = 2.0):
    """Send current readings to backend API.
    Expected backend body: { temperature, humidity, moisture }
    """
    soil_value = readings.get("soil")
    if soil_value is None:
        soil_value = readings.get("moisture")

    payload = {
        "temperature": readings.get("temperature"),
        "humidity": readings.get("humidity"),
        "moisture": soil_value,
    }

    if None in payload.values():
        return False, "missing fields"

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        api_url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            if 200 <= resp.status < 300:
                return True, "ok"
            return False, f"status {resp.status}"
    except urllib.error.URLError as e:
        return False, str(e)

# ── Display ───────────────────────────────────────────────────────────────────

def make_dashboard(readings: dict, raw: str, count: int, errors: int):
    temp  = readings.get("temperature")
    hum   = readings.get("humidity")
    soil  = readings.get("soil")

    ts_label, tc = temp_status(temp)
    sm_label, sc = soil_status(soil)

    def val(v, unit="", precision=1):
        return f"{v:.{precision}f}{unit}" if v is not None else "—"

    # ── Cards ─────────────────────────────────────────────────────────────────
    temp_card = Panel(
        Text.assemble(
            (val(temp, "°C"), f"bold {tc}"),
            "\n",
            (ts_label, tc),
        ),
        title="[bold]Temperature[/bold]",
        border_style=tc,
        expand=True,
    )

    hum_card = Panel(
        Text.assemble(
            (val(hum, "%"), "bold cyan"),
            "\n",
            ("DHT11 Humidity", "cyan"),
        ),
        title="[bold]Humidity[/bold]",
        border_style="cyan",
        expand=True,
    )

    soil_card = Panel(
        Text.assemble(
            (val(soil, "%", 0), f"bold {sc}"),
            "\n",
            (sm_label, sc),
        ),
        title="[bold]Soil Moisture[/bold]",
        border_style=sc,
        expand=True,
    )

    cards = Columns([temp_card, hum_card, soil_card], expand=True)

    # ── Stats bar ─────────────────────────────────────────────────────────────
    stats = (
        f"[dim]Readings:[/dim] [bold]{count}[/bold]   "
        f"[dim]Errors:[/dim] [bold yellow]{errors}[/bold yellow]   "
        f"[dim]Time:[/dim] [bold]{datetime.now().strftime('%H:%M:%S')}[/bold]"
    )

    raw_panel = Panel(
        f"[dim]{raw or '— waiting for data —'}[/dim]",
        title="Raw serial",
        border_style="dim",
    )

    from rich.layout import Layout
    layout = Layout()
    layout.split_column(
        Layout(Panel(cards, title="[bold]ESP32 Sensor Monitor[/bold]", border_style="white"), size=9),
        Layout(Panel(Text.from_markup(stats), border_style="dim"), size=3),
        Layout(raw_panel, size=3),
    )
    return layout


def simple_display(readings: dict, raw: str, count: int):
    """Fallback when rich is not installed."""
    temp = readings.get("temperature", "—")
    hum  = readings.get("humidity",    "—")
    soil = readings.get("soil",        "—")
    ts   = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] #{count:04d}  Temp: {temp}°C  Hum: {hum}%  Soil: {soil}%  | raw: {raw}")

# ── Main loop ─────────────────────────────────────────────────────────────────

def run(port: str, baud: int, log: bool, api_url: str, no_push: bool):
    print(f"Connecting to {port} @ {baud} baud …")

    try:
        ser = serial.Serial(port, baud, timeout=2)
    except serial.SerialException as e:
        print(f"ERROR: Could not open {port}: {e}")
        return

    time.sleep(2)           # let ESP32 boot / settle
    ser.reset_input_buffer()
    print(f"Connected. Listening for sensor data. Press Ctrl+C to stop.\n")
    if no_push:
        print("Backend forwarding: disabled (--no-push)\n")
    else:
        print(f"Backend forwarding: enabled → {api_url}\n")

    log_file = None
    if log:
        log_file = open(LOG_FILE, "a")
        log_file.write("timestamp,temperature,humidity,soil,raw\n")
        print(f"Logging to {LOG_FILE}\n")

    count  = 0
    errors = 0
    last_readings: dict = {}
    last_raw = ""

    if RICH_AVAILABLE:
        console = Console()
        with Live(make_dashboard(last_readings, last_raw, count, errors),
                  console=console, refresh_per_second=4) as live:
            try:
                while True:
                    try:
                        raw = ser.readline().decode("utf-8", errors="replace").strip()
                    except serial.SerialException as e:
                        console.print(f"[red]Serial error: {e}[/red]")
                        break

                    if not raw:
                        continue

                    last_raw = raw
                    parsed   = parse_line(raw)

                    if parsed:
                        last_readings.update(parsed)
                        count += 1

                        if not no_push:
                            ok, _msg = push_to_backend(api_url, last_readings)
                            if not ok:
                                errors += 1

                        if log_file:
                            ts = datetime.now().isoformat()
                            t  = last_readings.get("temperature", "")
                            h  = last_readings.get("humidity", "")
                            s  = last_readings.get("soil", "")
                            log_file.write(f"{ts},{t},{h},{s},{raw}\n")
                            log_file.flush()
                    else:
                        errors += 1

                    live.update(make_dashboard(last_readings, last_raw, count, errors))
            except KeyboardInterrupt:
                pass
    else:
        # ── Plain text fallback ────────────────────────────────────────────────
        try:
            while True:
                try:
                    raw = ser.readline().decode("utf-8", errors="replace").strip()
                except serial.SerialException as e:
                    print(f"Serial error: {e}")
                    break

                if not raw:
                    continue

                parsed = parse_line(raw)
                if parsed:
                    last_readings.update(parsed)
                    count += 1

                    if not no_push:
                        ok, _msg = push_to_backend(api_url, last_readings)
                        if not ok:
                            errors += 1

                    simple_display(last_readings, raw, count)
                    if log_file:
                        ts = datetime.now().isoformat()
                        t  = last_readings.get("temperature", "")
                        h  = last_readings.get("humidity", "")
                        s  = last_readings.get("soil", "")
                        log_file.write(f"{ts},{t},{h},{s},{raw}\n")
                        log_file.flush()
        except KeyboardInterrupt:
            pass

    ser.close()
    if log_file:
        log_file.close()
    print(f"\nDone. {count} readings captured.")

# ── Entry point ───────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="ESP32 DHT11 + Soil Moisture reader")
    parser.add_argument("--port", "-p", help="COM port (e.g. COM3 or /dev/ttyUSB0)")
    parser.add_argument("--baud", "-b", type=int, default=DEFAULT_BAUD,
                        help=f"Baud rate (default {DEFAULT_BAUD})")
    parser.add_argument("--log",  "-l", action="store_true",
                        help=f"Save readings to {LOG_FILE}")
    parser.add_argument("--list", action="store_true", help="List available COM ports")
    parser.add_argument("--api-url", default=DEFAULT_API_URL,
                        help=f"Backend endpoint for sensor forwarding (default: {DEFAULT_API_URL})")
    parser.add_argument("--no-push", action="store_true",
                        help="Do not send readings to backend API")
    args = parser.parse_args()

    if args.list:
        list_ports()
        return

    port = args.port
    if not port:
        port = auto_detect_port()
        if not port:
            list_ports()
            port = input("Enter COM port: ").strip()

    run(port, args.baud, args.log, args.api_url, args.no_push)


if __name__ == "__main__":
    main()