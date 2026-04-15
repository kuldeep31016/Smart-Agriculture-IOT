"""
AgriSense IoT Sender — Simulated / Real Sensor Data
Problem Statement 7: IoT Layer

PURPOSE:
  Sends sensor readings to the AgriSense backend every 5 seconds.
  Can run in two modes:
    1. SIMULATED — generates random data for testing UI (default)
    2. REAL      — reads actual DHT11 + soil moisture sensor via GPIO (Raspberry Pi)

USAGE:
  pip install requests
  python iot_sender.py                   # simulated data
  python iot_sender.py --real            # real GPIO sensors (Raspberry Pi only)
  python iot_sender.py --url http://...  # custom backend URL

REAL SENSOR SETUP (Raspberry Pi):
  pip install Adafruit_DHT RPi.GPIO
  Connect DHT11 data pin → GPIO 4
  Connect moisture sensor analog → MCP3008 or ADC module
"""

import requests
import random
import time
import argparse
import sys

BACKEND_URL  = "http://localhost:5001/api/sensor-data"
INTERVAL_SEC = 5

# ── Simulated data generator ──────────────────────────────────────────────────
# Generates realistic fluctuating values for testing

_sim_temp     = 28.0
_sim_humidity = 62.0
_sim_moisture = 50.0

def read_simulated():
    """Slowly drift values to simulate real sensor behavior."""
    global _sim_temp, _sim_humidity, _sim_moisture

    _sim_temp     += random.uniform(-0.8, 0.8)
    _sim_humidity += random.uniform(-1.5, 1.5)
    _sim_moisture += random.uniform(-2.0, 2.0)

    # Clamp to realistic ranges
    _sim_temp     = max(15.0, min(45.0, _sim_temp))
    _sim_humidity = max(10.0, min(99.0, _sim_humidity))
    _sim_moisture = max(0.0,  min(100.0, _sim_moisture))

    return {
        "temperature": round(_sim_temp,     1),
        "humidity":    round(_sim_humidity, 1),
        "moisture":    round(_sim_moisture, 1),
    }


# ── Real sensor reader (Raspberry Pi only) ────────────────────────────────────
def read_real_sensors():
    """
    Read actual DHT11 and soil moisture sensor.
    Requires: pip install Adafruit_DHT RPi.GPIO
    """
    try:
        import Adafruit_DHT

        # IoT: DHT11 sensor on GPIO pin 4
        DHT_SENSOR = Adafruit_DHT.DHT11
        DHT_PIN    = 4

        humidity, temperature = Adafruit_DHT.read_retry(DHT_SENSOR, DHT_PIN)

        if humidity is None or temperature is None:
            print("⚠️  DHT11 read failed — retrying next cycle")
            return None

        # IoT: Soil moisture sensor
        # Replace this with actual ADC read from MCP3008 or similar
        # Example (MCP3008 via SPI):
        #   import spidev
        #   spi = spidev.SpiDev()
        #   spi.open(0, 0)
        #   raw = spi.xfer2([1, (8 + channel) << 4, 0])
        #   moisture_raw = ((raw[1] & 3) << 8) + raw[2]
        #   moisture_pct = round((1 - moisture_raw / 1023) * 100, 1)
        moisture_pct = 55.0  # ← Replace with actual ADC read

        return {
            "temperature": round(float(temperature), 1),
            "humidity":    round(float(humidity),    1),
            "moisture":    round(float(moisture_pct), 1),
        }

    except ImportError:
        print("❌ Adafruit_DHT not installed. Install with: pip install Adafruit_DHT")
        print("   Falling back to simulated data.")
        return read_simulated()


# ── Main loop ─────────────────────────────────────────────────────────────────
def run(backend_url: str, use_real: bool, interval: int):
    mode = "REAL GPIO sensors" if use_real else "SIMULATED data"
    print(f"\n🌾 AgriSense IoT Sender")
    print(f"   Mode:     {mode}")
    print(f"   Backend:  {backend_url}")
    print(f"   Interval: {interval}s")
    print(f"   Press Ctrl+C to stop\n")

    count   = 0
    errors  = 0

    while True:
        data = read_real_sensors() if use_real else read_simulated()

        if data is None:
            time.sleep(interval)
            continue

        count += 1
        try:
            response = requests.post(backend_url, json=data, timeout=5)
            status_icon = "✅" if response.status_code == 201 else "⚠️"
            print(
                f"[#{count:04d}] {status_icon}  "
                f"Temp: {data['temperature']}°C  "
                f"Hum: {data['humidity']}%  "
                f"Soil: {data['moisture']}%  "
                f"→ HTTP {response.status_code}"
            )
        except requests.exceptions.ConnectionError:
            errors += 1
            print(f"[#{count:04d}] ❌  Connection refused — is the backend running on {backend_url}?")
        except requests.exceptions.Timeout:
            errors += 1
            print(f"[#{count:04d}] ⏱️  Request timed out")
        except Exception as e:
            errors += 1
            print(f"[#{count:04d}] ❌  Error: {e}")

        time.sleep(interval)


def main():
    parser = argparse.ArgumentParser(description="AgriSense IoT Sensor Data Sender")
    parser.add_argument("--url",      default=BACKEND_URL,  help="Backend endpoint URL")
    parser.add_argument("--real",     action="store_true",  help="Use real GPIO sensors (Raspberry Pi)")
    parser.add_argument("--interval", type=int, default=5,  help="Send interval in seconds (default: 5)")
    args = parser.parse_args()

    try:
        run(args.url, args.real, args.interval)
    except KeyboardInterrupt:
        print("\n\n✋ Stopped by user.")
        sys.exit(0)


if __name__ == "__main__":
    main()
