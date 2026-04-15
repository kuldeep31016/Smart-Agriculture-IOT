const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function getSensorData() {
  const res = await fetch(`${API_BASE_URL}/api/sensor-data`, {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache' },
  });
  if (!res.ok) throw new Error('Unable to fetch sensor data');
  return res.json();
}

export async function predictCrop(payload) {
  const res = await fetch(`${API_BASE_URL}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Prediction failed');
  return res.json();
}
