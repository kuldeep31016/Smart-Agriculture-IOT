// Alerts Page — historical anomaly detection across all sensor readings
// IoT + Cloud Layer: fetches readings from Firebase via backend and runs threshold checks

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AlertCard from '../components/AlertCard';
import { getSensorData } from '../services/api';

// ── Threshold definitions (same as Dashboard) ─────────────────────────────────
function checkReading(reading) {
  const alerts = [];
  const { temperature: t, humidity: h, moisture: m, timestamp } = reading;
  const moisture = m ?? reading.soil;

  if (t > 38)   alerts.push({ type: 'critical', sensor: 'Temperature', value: t,        unit: '°C', message: 'High Temperature Alert',      action: 'Provide shade, increase ventilation', timestamp });
  if (t < 10)   alerts.push({ type: 'critical', sensor: 'Temperature', value: t,        unit: '°C', message: 'Low Temperature Alert',       action: 'Cover crops, prevent frost damage',   timestamp });
  if (h > 90)   alerts.push({ type: 'warning',  sensor: 'Humidity',    value: h,        unit: '%',  message: 'High Humidity — Fungal Risk',  action: 'Improve air circulation, apply fungicide if needed', timestamp });
  if (h < 20)   alerts.push({ type: 'warning',  sensor: 'Humidity',    value: h,        unit: '%',  message: 'Low Humidity Alert',           action: 'Irrigate and use mulching to retain moisture', timestamp });
  if (moisture !== undefined && moisture < 25) alerts.push({ type: 'critical', sensor: 'Soil Moisture', value: moisture, unit: '%', message: 'Dry Soil — Irrigate Now!', action: 'Irrigate immediately, check drip lines', timestamp });
  if (moisture !== undefined && moisture > 85) alerts.push({ type: 'warning',  sensor: 'Soil Moisture', value: moisture, unit: '%', message: 'Waterlogged Soil Alert',   action: 'Stop irrigation, improve drainage', timestamp });

  return alerts;
}

const FILTERS = ['All', 'Critical', 'Warning'];

export default function Alerts() {
  const [allAlerts, setAllAlerts] = useState([]);
  const [filter, setFilter]       = useState('All');
  const [loading, setLoading]     = useState(true);
  const navigate                  = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await getSensorData(100); // fetch last 100 readings for alert history
        if (Array.isArray(data)) {
          const alerts = data.flatMap(r => checkReading(r));
          setAllAlerts(alerts);
        }
      } catch {
        toast.error('Could not load sensor data for alerts');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = allAlerts.filter(a =>
    filter === 'All' || a.type === filter.toLowerCase()
  );

  const criticalCount = allAlerts.filter(a => a.type === 'critical').length;
  const warningCount  = allAlerts.filter(a => a.type === 'warning').length;

  const handleAskAI = (alert) => {
    // Navigate to AI assistant and pre-fill chat with alert context
    navigate('/ai-assistant', {
      state: { prefillChat: `${alert.message}: ${alert.sensor} is ${alert.value}${alert.unit}. What should I do?` },
    });
  };

  return (
    <section className="max-w-5xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <header>
        <h1 className="text-3xl font-extrabold text-agri-primary">⚠️ Smart Alerts</h1>
        <p className="text-gray-500 mt-1">Anomaly detection across last 100 sensor readings</p>
      </header>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-agri-frost shadow-sm p-5 text-center">
          <p className="text-3xl font-extrabold text-gray-800">{allAlerts.length}</p>
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Total Alerts</p>
        </div>
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-5 text-center">
          <p className="text-3xl font-extrabold text-red-600">{criticalCount}</p>
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Critical</p>
        </div>
        <div className="bg-white rounded-2xl border border-yellow-200 shadow-sm p-5 text-center">
          <p className="text-3xl font-extrabold text-yellow-600">{warningCount}</p>
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Warnings</p>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              filter === f
                ? 'bg-agri-primary text-white'
                : 'bg-white border border-agri-frost text-gray-600 hover:bg-agri-snow'
            }`}
          >
            {f}
            {f !== 'All' && (
              <span className="ml-1.5 text-xs">
                ({f === 'Critical' ? criticalCount : warningCount})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Alert list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
          <p className="text-5xl mb-3">✅</p>
          <p className="font-bold text-green-700">
            {allAlerts.length === 0
              ? 'No sensor data available — run python main.py first'
              : 'No alerts for this filter — all conditions are within safe range'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert, i) => (
            <AlertCard
              key={i}
              {...alert}
              onAskAI={() => handleAskAI(alert)}
            />
          ))}
        </div>
      )}

    </section>
  );
}
