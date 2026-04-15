import { useEffect, useMemo, useState } from 'react';
import SensorCard from '../components/SensorCard';
import LiveChart from '../components/LiveChart';
import { getSensorData } from '../services/api';

function normalizeReading(reading) {
  if (!reading || typeof reading !== 'object') return reading;

  return {
    ...reading,
    moisture: reading.moisture ?? reading.soil ?? reading.soil_moisture ?? reading.soilMoisture ?? reading.sm,
  };
}

function sensorStatus(label, value) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return {
      status: 'No Data',
      statusBg: 'bg-gray-100',
      statusText: 'text-gray-500',
    };
  }

  const v = Number(value);
  if (label === 'Temperature') {
    if (v < 18) return { status: 'Cool', statusBg: 'bg-blue-100', statusText: 'text-blue-700' };
    if (v > 32) return { status: 'Hot', statusBg: 'bg-red-100', statusText: 'text-red-700' };
  }
  if (label === 'Humidity') {
    if (v < 30) return { status: 'Dry', statusBg: 'bg-yellow-100', statusText: 'text-yellow-700' };
    if (v > 75) return { status: 'Humid', statusBg: 'bg-sky-100', statusText: 'text-sky-700' };
  }
  if (label === 'Moisture') {
    if (v < 30) return { status: 'Low', statusBg: 'bg-orange-100', statusText: 'text-orange-700' };
    if (v > 80) return { status: 'High', statusBg: 'bg-emerald-100', statusText: 'text-emerald-700' };
  }

  return { status: 'Optimal', statusBg: 'bg-emerald-100', statusText: 'text-emerald-700' };
}

function Dashboard() {
  const [sensorData, setSensorData] = useState([]);

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const data = await getSensorData();

        const normalized = Array.isArray(data)
          ? data.map(normalizeReading)
          : data
            ? [normalizeReading(data)]
            : [];

        if (normalized.length === 0) {
          return;
        }

        if (Array.isArray(data)) {
          setSensorData(normalized.slice(0, 20));
          return;
        }

        const incoming = normalized[0];
        setSensorData((prev) => {
          if (!prev.length) {
            return [incoming];
          }

          const current = prev[0];
          const isSameReading =
            (incoming.id && current.id && incoming.id === current.id) ||
            (incoming.timestamp && current.timestamp && incoming.timestamp === current.timestamp);

          if (isSameReading) {
            return [{ ...current, ...incoming }, ...prev.slice(1)];
          }

          return [incoming, ...prev].slice(0, 20);
        });
      } catch {
        // Preserve last known values if a poll fails.
      }
    };

    fetchSensors();
    const intervalId = setInterval(fetchSensors, 2000);

    return () => clearInterval(intervalId);
  }, []);

  const latest = sensorData[0] || {};

  const cards = useMemo(() => {
    const items = [
      { label: 'Temperature', value: latest.temperature, unit: '°C', icon: '🌡️', borderColor: 'border-red-400' },
      { label: 'Humidity', value: latest.humidity, unit: '%', icon: '💧', borderColor: 'border-blue-400' },
      { label: 'Moisture', value: latest.moisture, unit: '%', icon: '🌱', borderColor: 'border-green-400' },
    ];

    return items.map((item) => ({
      ...item,
      ...sensorStatus(item.label, item.value),
    }));
  }, [latest.humidity, latest.moisture, latest.temperature]);

  return (
    <section className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-agri-primary">Live Sensor Dashboard</h1>
        <p className="text-gray-600 mt-1">Real-time snapshot of field conditions.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cards.map((card) => (
          <SensorCard key={card.label} {...card} />
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <LiveChart data={sensorData.slice(0, 20)} />
      </div>
    </section>
  );
}

export default Dashboard;
