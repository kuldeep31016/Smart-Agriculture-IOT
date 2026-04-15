// Dashboard Page — Live Sensor Monitoring
// IoT + Cloud Layer: auto-fetches latest readings every 10 seconds
// Shows sensor cards with min/max, charts, data table, and anomaly alerts

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import SensorCard from '../components/SensorCard';
import LiveChart  from '../components/LiveChart';
import { getSensorData } from '../services/api';

// ── Sensor threshold definitions ──────────────────────────────────────────────
// Temperature thresholds for alerts
const THRESHOLDS = {
  temperature: { high: 38, low: 10 },
  humidity:    { high: 90, low: 20 },
  moisture:    { high: 85, low: 25 },
};

function getStatus(label, value) {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return { status: 'No Data', statusBg: 'bg-gray-100', statusText: 'text-gray-500' };
  }
  const v = Number(value);
  const t = THRESHOLDS[label.toLowerCase()];
  if (t) {
    if (v > t.high) return { status: 'Critical ↑', statusBg: 'bg-red-100',    statusText: 'text-red-700' };
    if (v < t.low)  return { status: 'Critical ↓', statusBg: 'bg-blue-100',   statusText: 'text-blue-700' };
  }
  if (label === 'Temperature') {
    if (v < 18) return { status: 'Cool',    statusBg: 'bg-sky-100',     statusText: 'text-sky-700' };
    if (v > 32) return { status: 'Hot',     statusBg: 'bg-orange-100',  statusText: 'text-orange-700' };
  }
  if (label === 'Humidity') {
    if (v < 30) return { status: 'Dry',    statusBg: 'bg-yellow-100', statusText: 'text-yellow-700' };
    if (v > 75) return { status: 'Humid',  statusBg: 'bg-sky-100',    statusText: 'text-sky-700' };
  }
  if (label === 'Moisture') {
    if (v < 30) return { status: 'Low',    statusBg: 'bg-orange-100',  statusText: 'text-orange-700' };
    if (v > 80) return { status: 'High',   statusBg: 'bg-emerald-100', statusText: 'text-emerald-700' };
  }
  return { status: 'Optimal', statusBg: 'bg-emerald-100', statusText: 'text-emerald-700' };
}

function detectAnomalies(reading) {
  if (!reading) return [];
  const alerts = [];
  if (reading.temperature > THRESHOLDS.temperature.high) alerts.push(`🌡️ Temperature ${reading.temperature}°C exceeds safe limit (${THRESHOLDS.temperature.high}°C)`);
  if (reading.temperature < THRESHOLDS.temperature.low)  alerts.push(`🌡️ Temperature ${reading.temperature}°C is too low (min ${THRESHOLDS.temperature.low}°C)`);
  if (reading.humidity    > THRESHOLDS.humidity.high)    alerts.push(`💧 Humidity ${reading.humidity}% is too high — fungal risk`);
  if (reading.humidity    < THRESHOLDS.humidity.low)     alerts.push(`💧 Humidity ${reading.humidity}% is too low — drought risk`);
  if (reading.moisture    < THRESHOLDS.moisture.low)     alerts.push(`🌱 Soil Moisture ${reading.moisture}% is critically low — irrigate now!`);
  if (reading.moisture    > THRESHOLDS.moisture.high)    alerts.push(`🌱 Soil Moisture ${reading.moisture}% is too high — waterlogged risk`);
  return alerts;
}

function fmt(ts) {
  try {
    return new Date(ts).toLocaleString('en-IN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return ts; }
}

export default function Dashboard() {
  const [readings, setReadings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [anomalies, setAnomalies]   = useState([]);

  const fetchData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await getSensorData(20);
      if (Array.isArray(data) && data.length > 0) {
        setReadings(data);
        setLastUpdate(new Date());
        setAnomalies(detectAnomalies(data[0]));
      }
    } catch (err) {
      if (!silent) toast.error('Could not reach backend — is the server running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(() => fetchData(true), 10000); // auto-refresh every 10s
    return () => clearInterval(id);
  }, [fetchData]);

  const latest = readings[0] || {};

  // Compute day min/max from all loaded readings
  const tempVals     = readings.map(r => r.temperature).filter(Boolean);
  const humVals      = readings.map(r => r.humidity).filter(Boolean);
  const moistVals    = readings.map(r => r.moisture ?? r.soil).filter(v => v !== undefined);

  const CARDS = [
    {
      label: 'Temperature', value: latest.temperature, unit: '°C', icon: '🌡️',
      borderColor: 'border-red-400',
      min: tempVals.length  ? Math.min(...tempVals)  : undefined,
      max: tempVals.length  ? Math.max(...tempVals)  : undefined,
      ...getStatus('Temperature', latest.temperature),
    },
    {
      label: 'Humidity',    value: latest.humidity,    unit: '%',  icon: '💧',
      borderColor: 'border-blue-400',
      min: humVals.length   ? Math.min(...humVals)   : undefined,
      max: humVals.length   ? Math.max(...humVals)   : undefined,
      ...getStatus('Humidity', latest.humidity),
    },
    {
      label: 'Moisture',    value: latest.moisture ?? latest.soil, unit: '%', icon: '🌱',
      borderColor: 'border-green-400',
      min: moistVals.length ? Math.min(...moistVals) : undefined,
      max: moistVals.length ? Math.max(...moistVals) : undefined,
      ...getStatus('Moisture', latest.moisture ?? latest.soil),
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-8 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-agri-primary">Live Sensor Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Auto-refreshes every 10 s
            {lastUpdate && <span> · Last update: {lastUpdate.toLocaleTimeString()}</span>}
          </p>
        </div>
        <button
          onClick={() => fetchData()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-agri-primary text-white font-semibold text-sm hover:bg-agri-medium transition-colors disabled:opacity-60"
        >
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Refreshing</>
          ) : (
            <><span>🔄</span> Refresh Now</>
          )}
        </button>
      </div>

      {/* ── Anomaly Banner ─────────────────────────────────────────────────── */}
      {anomalies.length > 0 && (
        <div className="rounded-2xl bg-red-50 border border-red-300 p-4">
          <p className="font-bold text-red-700 mb-2 flex items-center gap-2">
            <span>🚨</span> Sensor Anomalies Detected
          </p>
          <ul className="space-y-1">
            {anomalies.map((a, i) => (
              <li key={i} className="text-red-600 text-sm">{a}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Sensor Cards ───────────────────────────────────────────────────── */}
      {loading && readings.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-gray-200 animate-pulse">
              <div className="h-8 w-8 bg-gray-200 rounded-full mb-4" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-10 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CARDS.map(card => <SensorCard key={card.label} {...card} />)}
        </div>
      )}

      {/* ── Charts ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <LiveChart data={readings} />
      </div>

      {/* ── Data Table ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-base font-bold text-agri-primary mb-4">📋 Last 10 Readings</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 uppercase text-xs border-b border-gray-100">
                <th className="pb-3 pr-4">#</th>
                <th className="pb-3 pr-4">Timestamp</th>
                <th className="pb-3 pr-4">Temp (°C)</th>
                <th className="pb-3 pr-4">Humidity (%)</th>
                <th className="pb-3">Moisture (%)</th>
              </tr>
            </thead>
            <tbody>
              {readings.slice(0, 10).map((r, i) => (
                <tr key={r.id || i} className="border-b border-gray-50 hover:bg-agri-white/50">
                  <td className="py-2 pr-4 text-gray-400">{i + 1}</td>
                  <td className="py-2 pr-4 text-gray-500">{fmt(r.timestamp)}</td>
                  <td className="py-2 pr-4 font-semibold text-red-600">{r.temperature?.toFixed(1)}</td>
                  <td className="py-2 pr-4 font-semibold text-blue-600">{r.humidity?.toFixed(1)}</td>
                  <td className="py-2 font-semibold text-green-600">{(r.moisture ?? r.soil)?.toFixed(1)}</td>
                </tr>
              ))}
              {readings.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">No data yet — run python main.py</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </section>
  );
}
