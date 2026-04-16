// Dashboard Page — Live Sensor Monitoring
// IoT + Cloud Layer: auto-fetches latest readings every 2 seconds
// Shows sensor cards with min/max, charts, data table, and anomaly alerts

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import SensorCard from '../components/SensorCard';
import LiveChart from '../components/LiveChart';
import { getSensorData } from '../services/api';

// ── Sensor threshold definitions ──────────────────────────────────────────────
// Temperature thresholds for alerts
const THRESHOLDS = {
  temperature: { high: 38, low: 10 },
  humidity: { high: 90, low: 20 },
  moisture: { high: 85, low: 25 },
};

function getStatus(label, value) {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return { status: 'No Data', statusBg: 'bg-gray-100', statusText: 'text-gray-500' };
  }
  const v = Number(value);
  const t = THRESHOLDS[label.toLowerCase()];
  if (t) {
    if (v > t.high) return { status: 'Critical ↑', statusBg: 'bg-red-100', statusText: 'text-red-700' };
    if (v < t.low) return { status: 'Critical ↓', statusBg: 'bg-blue-100', statusText: 'text-blue-700' };
  }
  if (label === 'Temperature') {
    if (v < 18) return { status: 'Cool', statusBg: 'bg-sky-100', statusText: 'text-sky-700' };
    if (v > 32) return { status: 'Hot', statusBg: 'bg-orange-100', statusText: 'text-orange-700' };
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

function detectAnomalies(reading) {
  if (!reading) return [];
  const alerts = [];
  if (reading.temperature > THRESHOLDS.temperature.high) alerts.push(`🌡️ Temperature ${reading.temperature}°C exceeds safe limit (${THRESHOLDS.temperature.high}°C)`);
  if (reading.temperature < THRESHOLDS.temperature.low) alerts.push(`🌡️ Temperature ${reading.temperature}°C is too low (min ${THRESHOLDS.temperature.low}°C)`);
  if (reading.humidity > THRESHOLDS.humidity.high) alerts.push(`💧 Humidity ${reading.humidity}% is too high — fungal risk`);
  if (reading.humidity < THRESHOLDS.humidity.low) alerts.push(`💧 Humidity ${reading.humidity}% is too low — drought risk`);
  if (reading.moisture < THRESHOLDS.moisture.low) alerts.push(`🌱 Soil Moisture ${reading.moisture}% is critically low — irrigate now!`);
  if (reading.moisture > THRESHOLDS.moisture.high) alerts.push(`🌱 Soil Moisture ${reading.moisture}% is too high — waterlogged risk`);
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
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [anomalies, setAnomalies] = useState([]);

  const fetchData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await getSensorData();
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
    const id = setInterval(() => fetchData(true), 2000); // auto-refresh every 2s
    return () => clearInterval(id);
  }, [fetchData]);

  const latest = readings[0] || {};

  // Compute day min/max from all loaded readings
  const tempVals = readings.map(r => r.temperature).filter(Boolean);
  const humVals = readings.map(r => r.humidity).filter(Boolean);
  const moistVals = readings.map(r => r.moisture ?? r.soil).filter(v => v !== undefined);

  const CARDS = [
    {
      label: 'Temperature', value: latest.temperature, unit: '°C', icon: '🌡️',
      borderColor: 'border-red-400',
      min: tempVals.length ? Math.min(...tempVals) : undefined,
      max: tempVals.length ? Math.max(...tempVals) : undefined,
      ...getStatus('Temperature', latest.temperature),
    },
    {
      label: 'Humidity', value: latest.humidity, unit: '%', icon: '💧',
      borderColor: 'border-blue-400',
      min: humVals.length ? Math.min(...humVals) : undefined,
      max: humVals.length ? Math.max(...humVals) : undefined,
      ...getStatus('Humidity', latest.humidity),
    },
    {
      label: 'Moisture', value: latest.moisture ?? latest.soil, unit: '%', icon: '🌱',
      borderColor: 'border-green-400',
      min: moistVals.length ? Math.min(...moistVals) : undefined,
      max: moistVals.length ? Math.max(...moistVals) : undefined,
      ...getStatus('Moisture', latest.moisture ?? latest.soil),
    },
  ];

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <section className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-gray-200/60">
          <div>
            <h1 className="text-4xl md:text-[3rem] font-bold text-gray-900 tracking-tight leading-none mb-3">Live Dashboard</h1>
            <p className="text-gray-500 font-medium text-lg">
              Real-time environmental monitoring
              {lastUpdate && <span className="text-gray-400 ml-2 border-l border-gray-300 pl-2">Updated {lastUpdate.toLocaleTimeString()}</span>}
            </p>
          </div>
          <button
            onClick={() => fetchData()}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#1a472a] text-white font-semibold text-sm hover:bg-[#112a1f] hover:scale-105 transition-all shadow-md disabled:opacity-60"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> Synchronizing...</>
            ) : (
              <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.92-10.26l5.08 5.08" /></svg> Refresh Data</>
            )}
          </button>
        </div>

        {/* ── Anomaly Banner ─────────────────────────────────────────────────── */}
        {anomalies.length > 0 && (
          <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-6 shadow-sm backdrop-blur-sm">
            <p className="font-bold text-red-700 mb-3 flex items-center gap-2 text-lg tracking-tight">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
              Critical System Anomalies Detected
            </p>
            <ul className="space-y-2">
              {anomalies.map((a, i) => (
                <li key={i} className="text-red-700/80 font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>{a}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Sensor Cards ───────────────────────────────────────────────────── */}
        {loading && readings.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-[2rem] shadow-sm p-8 border border-gray-100 animate-pulse min-h-[250px]">
                <div className="h-12 w-12 bg-gray-100 rounded-2xl mb-8" />
                <div className="h-4 bg-gray-100 rounded w-1/3 mb-4" />
                <div className="h-12 bg-gray-100 rounded w-3/4 mb-6" />
                <div className="h-4 bg-gray-50 rounded w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CARDS.map(card => <SensorCard key={card.label} {...card} />)}
          </div>
        )}

        {/* ── Charts ─────────────────────────────────────────────────────────── */}
        <LiveChart data={readings} />

        {/* ── Data Table ─────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-[2rem] shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-gray-100/80 p-8 text-left">
          <h3 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-3 mb-6">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
            Recent Activity Log
          </h3>
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase tracking-widest text-[11px] font-bold">
                <tr>
                  <th className="px-6 py-5 rounded-tl-xl whitespace-nowrap">Seq</th>
                  <th className="px-6 py-5 whitespace-nowrap">Timestamp Local</th>
                  <th className="px-6 py-5 text-red-500 whitespace-nowrap">Temp (°C)</th>
                  <th className="px-6 py-5 text-blue-500 whitespace-nowrap">Humidity (%)</th>
                  <th className="px-6 py-5 rounded-tr-xl text-emerald-500 whitespace-nowrap">Moisture (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-600 font-medium">
                {readings.slice(0, 10).map((r, i) => (
                  <tr key={r.id || i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-5 text-gray-300 font-bold">{String(i + 1).padStart(2, '0')}</td>
                    <td className="px-6 py-5 text-gray-500">{fmt(r.timestamp)}</td>
                    <td className="px-6 py-5 text-red-800 text-base">{r.temperature?.toFixed(1) || '—'}</td>
                    <td className="px-6 py-5 text-blue-800 text-base">{r.humidity?.toFixed(1) || '—'}</td>
                    <td className="px-6 py-5 text-emerald-800 text-base">{(r.moisture ?? r.soil)?.toFixed(1) || '—'}</td>
                  </tr>
                ))}
                {readings.length === 0 && (
                  <tr><td colSpan={5} className="py-12 text-center text-gray-400">No data synchronized.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </section>
    </div>
  );
}
