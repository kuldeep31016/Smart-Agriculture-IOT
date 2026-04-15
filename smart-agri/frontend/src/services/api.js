// API service: communicates with AgriSense backend
// IoT Layer: fetches sensor readings collected from ESP32

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

// Fetch last N sensor readings (returns array, newest first)
export async function getSensorData(limit = 20) {
  const res = await fetch(`${BACKEND}/api/sensor-data?limit=${limit}`, {
    cache:   'no-store',
    headers: { 'Cache-Control': 'no-cache' },
  });
  if (!res.ok) throw new Error('Unable to fetch sensor data');
  return res.json(); // always returns an array
}

// Post a sensor reading manually (used by iot_sender.py simulation)
export async function postSensorData(data) {
  const res = await fetch(`${BACKEND}/api/sensor-data`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to send sensor data');
  return res.json();
}

// Call Gemini AI via backend proxy (keeps API key server-side)
export async function callGeminiViaBackend(prompt) {
  const res = await fetch(`${BACKEND}/api/gemini`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ prompt }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'AI request failed');
  }
  const data = await res.json();
  return data.response;
}
