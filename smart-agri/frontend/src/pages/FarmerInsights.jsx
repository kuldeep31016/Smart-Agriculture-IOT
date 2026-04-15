// Smart Farmer Intelligence Module — derives actionable insights from IoT sensor data
// Modules: Sensor Summary, Crop Health, Crop Recommendation, Irrigation, Fertilizer, Weather, Daily Planner
// Data: live sensor readings from backend API + LSTM model inference from localStorage

import { useEffect, useState, useMemo, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { getSensorData } from '../services/api';

// ── LSTM constants — must match Predictions.jsx ───────────────────────────────
const MODEL_STORAGE_KEY = 'localstorage://agrisense-lstm';
const MODEL_STATS_KEY   = 'agrisense-lstm-stats';
const WINDOW_SIZE       = 10;

const norm   = (v, min, max) => (max - min === 0 ? 0.5 : (v - min) / (max - min));
const denorm = (v, min, max) => v * (max - min) + min;

// Load saved LSTM model and run one-step inference (non-blocking, fast)
async function loadModelAndPredict(chronoReadings) {
  try {
    const saved = await tf.io.listModels();
    if (!saved[MODEL_STORAGE_KEY]) return null;
    const statsRaw = localStorage.getItem(MODEL_STATS_KEY);
    if (!statsRaw) return null;
    const stats = JSON.parse(statsRaw);

    const model = await tf.loadLayersModel(MODEL_STORAGE_KEY);

    // Build the input window from most-recent WINDOW_SIZE readings (oldest → newest)
    const recent = chronoReadings.slice(-WINDOW_SIZE);
    const window = recent.map(r => [
      norm(Number(r.temperature ?? 0),          stats.temp.min,      stats.temp.max),
      norm(Number(r.humidity    ?? 0),          stats.humid.min,     stats.humid.max),
      norm(Number(r.moisture ?? r.soil ?? 0),  stats.moisture.min,  stats.moisture.max),
    ]);

    const input = tf.tensor3d([window]);
    const pred  = model.predict(input);
    const raw   = Array.from(pred.dataSync());

    // Clean up to prevent memory leaks
    input.dispose();
    pred.dispose();
    model.dispose();

    return {
      temperature: denorm(raw[0], stats.temp.min,     stats.temp.max),
      humidity:    denorm(raw[1], stats.humid.min,    stats.humid.max),
      moisture:    denorm(raw[2], stats.moisture.min, stats.moisture.max),
    };
  } catch {
    return null; // silently degrade — no crash
  }
}

// ── Module 1: Crop Recommendation ────────────────────────────────────────────
function recommendCrops(temp, humidity, moisture) {
  const crops = [];

  if (temp >= 20 && temp <= 35 && humidity >= 60 && humidity <= 85 && moisture >= 50 && moisture <= 80)
    crops.push({ name: 'Rice', score: 95, icon: '🌾', season: 'Kharif', water: 'High',
      reason: 'Optimal temperature, moisture, and humidity for paddy cultivation' });

  if (temp >= 15 && temp <= 25 && humidity >= 40 && humidity <= 65 && moisture >= 40 && moisture <= 65)
    crops.push({ name: 'Wheat', score: 92, icon: '🌿', season: 'Rabi', water: 'Medium',
      reason: 'Cool temperature and moderate moisture ideal for wheat growth' });

  if (temp >= 21 && temp <= 32 && humidity >= 50 && humidity <= 75 && moisture >= 35 && moisture <= 60)
    crops.push({ name: 'Maize', score: 88, icon: '🌽', season: 'Kharif', water: 'Medium',
      reason: 'Warm climate and moderate soil moisture suit maize requirements' });

  if (temp >= 25 && temp <= 40 && humidity >= 20 && humidity <= 50 && moisture >= 15 && moisture <= 35)
    crops.push({ name: 'Cotton', score: 90, icon: '☁️', season: 'Kharif', water: 'Low',
      reason: 'High temperature and low moisture match cotton growing conditions' });

  if (temp >= 26 && temp <= 38 && humidity >= 60 && humidity <= 90 && moisture >= 65 && moisture <= 85)
    crops.push({ name: 'Sugarcane', score: 87, icon: '🎋', season: 'Annual', water: 'Very High',
      reason: 'High moisture and humidity support sugarcane water-intensive needs' });

  if (temp >= 18 && temp <= 30 && humidity >= 45 && humidity <= 70 && moisture >= 45 && moisture <= 70)
    crops.push({ name: 'Vegetables', score: 85, icon: '🥬', season: 'All Season', water: 'Medium',
      reason: 'Mild temperature and balanced moisture suit most vegetable varieties' });

  if (temp >= 15 && temp <= 28 && humidity >= 50 && humidity <= 75 && moisture >= 40 && moisture <= 65)
    crops.push({ name: 'Tomato', score: 83, icon: '🍅', season: 'All Season', water: 'Medium',
      reason: 'Temperature and humidity within optimal tomato growing range' });

  if (temp >= 22 && temp <= 35 && humidity >= 55 && humidity <= 80 && moisture >= 50 && moisture <= 75)
    crops.push({ name: 'Groundnut', score: 82, icon: '🥜', season: 'Kharif', water: 'Medium',
      reason: 'Warm temperature and good soil moisture promote groundnut yields' });

  crops.sort((a, b) => b.score - a.score);
  return crops.length > 0
    ? crops.slice(0, 4)
    : [{ name: 'Vegetables', score: 70, icon: '🥬', season: 'All Season', water: 'Medium',
        reason: 'Versatile crop suitable for a wide range of conditions' }];
}

// ── Module 2: Irrigation Intelligence ────────────────────────────────────────
function getIrrigationAdvice(moisture, temp, predictedMoisture) {
  const advices = [];
  let urgency = 'normal';

  if (moisture < 25) {
    urgency = 'critical';
    advices.push('Soil is very dry right now. Irrigate IMMEDIATELY.');
  } else if (moisture < 40) {
    urgency = 'warning';
    advices.push('Soil moisture is low. Plan irrigation within 2–3 hours.');
  } else if (moisture > 80) {
    advices.push('Soil is waterlogged. Stop irrigation. Ensure proper drainage.');
  } else {
    advices.push('Soil moisture is optimal. No irrigation needed right now.');
  }

  if (predictedMoisture < 30)
    advices.push('Moisture will drop critically in the next interval. Prepare irrigation system now.');

  if (temp > 35)
    advices.push('High temperature detected. Irrigate in early morning (6–8 AM) or evening (6–8 PM) to reduce evaporation.');

  const waterNeeded    = moisture < 50 ? Math.round((50 - moisture) * 0.8) : 0;
  const timeToIrrigate = moisture < 25 ? 'Immediately' : moisture < 40 ? 'Within 3 hours' : 'Not needed';

  return {
    urgency, advices, waterNeeded, timeToIrrigate,
    bestTime: temp > 30 ? 'Early morning or evening' : 'Anytime',
    method:   moisture < 30 ? 'Drip irrigation recommended' : 'Sprinkler or flood irrigation',
  };
}

// ── Module 3: Fertilizer Advisor ──────────────────────────────────────────────
function getFertilizerAdvice(temp, humidity, moisture) {
  const list = [];

  if (moisture > 60 && temp > 25)
    list.push({ name: 'Urea (Nitrogen)', npk: '46-0-0', quantity: '50 kg/acre',
      timing: 'Apply now — good moisture for absorption',
      reason: 'High moisture helps nitrogen absorption efficiently', icon: '🟡' });

  if (moisture < 40)
    list.push({ name: 'DAP (Phosphorus)', npk: '18-46-0', quantity: '40 kg/acre',
      timing: 'Apply after irrigation',
      reason: 'Irrigate first, then apply for better absorption', icon: '🟤' });

  if (humidity > 70 && temp > 28)
    list.push({ name: 'Potash (MOP)', npk: '0-0-60', quantity: '30 kg/acre',
      timing: 'Apply in the evening',
      reason: 'Builds plant immunity against humidity-related diseases', icon: '🔴' });

  list.push({ name: 'Zinc Sulphate', npk: 'Micronutrient', quantity: '10 kg/acre',
    timing: 'Once per season',
    reason: 'Improves overall crop health and yield', icon: '⚪' });

  list.push({ name: 'Vermicompost', npk: 'Organic', quantity: '500 kg/acre',
    timing: 'Before sowing',
    reason: 'Improves soil structure and water retention', icon: '🟢' });

  return list;
}

// ── Module 4: Crop Health Monitor ────────────────────────────────────────────
function getCropHealth(temp, humidity, moisture) {
  const risks = [];
  let health = 100;

  if (humidity > 80 && temp > 25) {
    risks.push({ type: 'Fungal Disease', risk: 'HIGH', color: 'red', icon: '🍄',
      disease: 'Powdery Mildew / Leaf Blight',
      prevention: 'Apply Mancozeb fungicide @ 2.5 g/liter water',
      affectedCrops: 'Wheat, Tomato, Grapes' });
    health -= 30;
  }

  if (humidity > 90) {
    risks.push({ type: 'Bacterial Infection', risk: 'HIGH', color: 'red', icon: '🦠',
      disease: 'Bacterial Leaf Spot',
      prevention: 'Apply Copper Oxychloride @ 3 g/liter',
      affectedCrops: 'Tomato, Pepper, Cotton' });
    health -= 25;
  }

  if (temp > 38) {
    risks.push({ type: 'Heat Stress', risk: 'CRITICAL', color: 'red', icon: '🌡️',
      disease: 'Leaf Scorching / Wilting',
      prevention: 'Irrigate immediately. Use shade nets if possible.',
      affectedCrops: 'All crops' });
    health -= 35;
  }

  if (moisture < 20) {
    risks.push({ type: 'Drought Stress', risk: 'HIGH', color: 'orange', icon: '🏜️',
      disease: 'Wilting and Root Damage',
      prevention: 'Immediate irrigation required',
      affectedCrops: 'All crops' });
    health -= 30;
  }

  if (temp >= 20 && temp <= 32 && humidity >= 50 && humidity <= 75 && moisture >= 40 && moisture <= 70) {
    risks.push({ type: 'Optimal Conditions', risk: 'LOW', color: 'green', icon: '✅',
      disease: 'No major threats detected',
      prevention: 'Continue current practices',
      affectedCrops: 'All crops' });
    health = Math.min(health + 10, 100);
  }

  health = Math.max(health, 0);
  return {
    overallHealth: health,
    risks,
    status: health > 70 ? 'Healthy' : health > 40 ? 'At Risk' : 'Critical',
  };
}

// ── Module 5: Daily Farm Activity Planner ────────────────────────────────────
function getDailyPlan(temp, humidity, moisture) {
  const h = new Date().getHours();
  return [
    {
      time: '6:00 AM – 8:00 AM',
      activity: moisture < 40 ? 'Irrigate fields' : 'Field inspection',
      reason: moisture < 40 ? 'Best time to irrigate — low evaporation' : 'Check crop health in cool morning',
      priority: moisture < 40 ? 'HIGH' : 'NORMAL',
      active: h >= 6 && h < 8,
    },
    {
      time: '10:00 AM – 12:00 PM',
      activity: humidity > 70 ? 'Apply fungicide' : 'Weed management',
      reason: humidity > 70 ? 'High humidity — fungal risk is elevated' : 'Optimal time for weeding',
      priority: humidity > 70 ? 'HIGH' : 'NORMAL',
      active: h >= 10 && h < 12,
    },
    {
      time: '12:00 PM – 4:00 PM',
      activity: 'Avoid field work',
      reason: temp > 35
        ? `Temperature is ${temp.toFixed(1)}°C — too hot for field work`
        : 'Rest period — monitor sensors remotely',
      priority: 'LOW',
      active: h >= 12 && h < 16,
    },
    {
      time: '4:00 PM – 7:00 PM',
      activity: 'Fertilizer application',
      reason: 'Evening is optimal for fertilizer — reduces volatilization',
      priority: 'NORMAL',
      active: h >= 16 && h < 19,
    },
    {
      time: '7:00 PM – 9:00 PM',
      activity: 'Review sensor data',
      reason: 'Check predictions for tomorrow and plan irrigation schedule',
      priority: 'NORMAL',
      active: h >= 19 && h < 21,
    },
  ];
}

// ── Module 6: Weather Condition Analysis ─────────────────────────────────────
function getWeatherAnalysis(temp, humidity, predictedTemp, predictedHumid) {
  let condition, icon, advice;

  if (humidity > 85 && temp < 25) {
    condition = 'Foggy / Cloudy'; icon = '🌫️';
    advice = 'Low visibility conditions. High disease risk. Monitor crops closely.';
  } else if (humidity > 75 && temp > 28) {
    condition = 'Hot & Humid'; icon = '🌧️';
    advice = 'Rain is likely. Avoid fertilizer application today. Check field drainage.';
  } else if (humidity < 30 && temp > 35) {
    condition = 'Hot & Dry'; icon = '☀️';
    advice = 'Drought conditions. Irrigate immediately. Apply mulching to retain moisture.';
  } else if (temp < 15) {
    condition = 'Cold'; icon = '🌨️';
    advice = 'Frost risk. Cover sensitive crops. Avoid irrigation at night.';
  } else {
    condition = 'Pleasant'; icon = '🌤️';
    advice = 'Ideal farming conditions. Good day for all field activities.';
  }

  const tDiff = predictedTemp  - temp;
  const hDiff = predictedHumid - humidity;
  const tempTrend  = tDiff >  0.5 ? 'Rising ↑'  : tDiff  < -0.5 ? 'Falling ↓' : 'Stable →';
  const humidTrend = hDiff >  1.0 ? 'Rising ↑'  : hDiff  < -1.0 ? 'Falling ↓' : 'Stable →';

  return { condition, icon, advice, tempTrend, humidTrend };
}

// ── Module 7: Sensor Intelligence Summary ────────────────────────────────────
function getSensorSummary(temp, humidity, moisture) {
  const score = Math.round((
    (moisture > 35 && moisture < 75 ? 100 : 50) +
    (temp     > 20 && temp     < 35 ? 100 : 50) +
    (humidity > 40 && humidity < 80 ? 100 : 50)
  ) / 3);
  return {
    soilStatus:     moisture  > 60 ? 'Well Irrigated ✅' : moisture  > 35 ? 'Moderate 🟡' : 'Dry 🔴',
    climateStatus:  temp      > 38 ? 'Too Hot 🔴'        : temp      < 15 ? 'Too Cold 🔵' : 'Optimal ✅',
    humidityStatus: humidity  > 85 ? 'Very High ⚠️'       : humidity  < 25 ? 'Very Low ⚠️'  : 'Good ✅',
    overallFarmScore: score,
    todayAdvice: 'Based on your sensor data, today is ' +
      (temp < 35 && moisture > 35
        ? 'a GOOD day for farming activities'
        : 'a challenging day — focus on irrigation and crop protection'),
  };
}

// ── SVG Circular Health Gauge ─────────────────────────────────────────────────
function HealthGauge({ score }) {
  const r    = 48;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score > 70 ? '#22c55e' : score > 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.7s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold leading-none" style={{ color }}>{score}</span>
        <span className="text-xs text-gray-400 font-medium">/ 100</span>
      </div>
    </div>
  );
}

// ── Reusable module card ──────────────────────────────────────────────────────
function ModuleCard({ icon, title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-agri-frost p-6 space-y-4">
      <h2 className="text-xl font-bold text-agri-dark flex items-center gap-2">
        <span>{icon}</span> {title}
      </h2>
      {children}
    </div>
  );
}

// ── FarmerInsights page ───────────────────────────────────────────────────────
export default function FarmerInsights() {
  const [sensorData,  setSensorData]  = useState(null);
  const [readings,    setReadings]    = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [lastUpdate,  setLastUpdate]  = useState(null);

  const fetchAndPredict = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await getSensorData(20);
      if (Array.isArray(data) && data.length > 0) {
        setSensorData(data[0]);
        setReadings(data);
        setLastUpdate(new Date());

        // Non-blocking LSTM inference — reverse to oldest→newest for model
        if (data.length >= WINDOW_SIZE) {
          loadModelAndPredict([...data].reverse())
            .then(pred => { if (pred) setPredictions(pred); })
            .catch(() => {});
        }
      }
    } catch {
      // Silent on refresh errors
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAndPredict();
    const id = setInterval(() => fetchAndPredict(true), 10000);
    return () => clearInterval(id);
  }, [fetchAndPredict]);

  // Safe numeric values with sensible defaults while loading
  const temp     = Number(sensorData?.temperature               ?? 28);
  const humidity = Number(sensorData?.humidity                  ?? 60);
  const moisture = Number(sensorData?.moisture ?? sensorData?.soil ?? 50);

  const pTemp     = Number(predictions?.temperature ?? temp);
  const pHumid    = Number(predictions?.humidity    ?? humidity);
  const pMoisture = Number(predictions?.moisture    ?? moisture);

  // All modules memoized so they don't recompute on unrelated re-renders
  const crops      = useMemo(() => recommendCrops(temp, humidity, moisture),          [temp, humidity, moisture]);
  const irrigation = useMemo(() => getIrrigationAdvice(moisture, temp, pMoisture),   [moisture, temp, pMoisture]);
  const fertilizer = useMemo(() => getFertilizerAdvice(temp, humidity, moisture),    [temp, humidity, moisture]);
  const health     = useMemo(() => getCropHealth(temp, humidity, moisture),           [temp, humidity, moisture]);
  const plan       = useMemo(() => getDailyPlan(temp, humidity, moisture),            [temp, humidity, moisture]);
  const weather    = useMemo(() => getWeatherAnalysis(temp, humidity, pTemp, pHumid),[temp, humidity, pTemp, pHumid]);
  const summary    = useMemo(() => getSensorSummary(temp, humidity, moisture),        [temp, humidity, moisture]);
  const predHealth = useMemo(() => getCropHealth(pTemp, pHumid, pMoisture).overallHealth, [pTemp, pHumid, pMoisture]);

  // Moisture mini-chart: last 5 historical + current + predicted
  const moistureChart = useMemo(() => {
    const hist = [...readings].reverse().slice(-5).map((r, i, arr) => ({
      label: i === arr.length - 1 ? 'Now' : `T-${arr.length - 1 - i}`,
      moisture: Number(r.moisture ?? r.soil ?? 0),
    }));
    if (hist.length > 0) {
      // Bridge: add predicted as continuation of the last point
      hist[hist.length - 1].predicted = hist[hist.length - 1].moisture;
    }
    if (predictions) hist.push({ label: '+30m', predicted: pMoisture });
    return hist;
  }, [readings, predictions, pMoisture]);

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <section className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="h-10 w-72 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-44 rounded-2xl bg-gray-100 animate-pulse" />
        ))}
      </section>
    );
  }

  // Urgency styles
  const urgencyBg   = { critical: 'bg-red-50 border-red-300', warning: 'bg-yellow-50 border-yellow-300', normal: 'bg-emerald-50 border-emerald-300' };
  const urgencyText = { critical: 'text-red-700',             warning: 'text-yellow-700',                normal: 'text-emerald-700' };
  const urgencyIcon = { critical: '🔴 CRITICAL',              warning: '🟡 WARNING',                     normal: '✅ NORMAL' };

  return (
    <section className="max-w-5xl mx-auto px-4 py-8 space-y-6">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <header className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-agri-primary">🧑‍🌾 Smart Farmer Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm">
            AI-powered actionable intelligence from your IoT sensor data
          </p>
        </div>
        <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 text-xs font-bold shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Data
        </span>
      </header>

      {/* ── Sensor Context Bar ──────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-agri-frost bg-agri-snow px-5 py-4 space-y-3">
        <div className="flex flex-wrap gap-6 items-center">
          <span className="text-xs font-bold text-agri-dark uppercase tracking-widest w-28">Current</span>
          <span className="text-sm">🌡️ <strong className="text-red-600">{temp.toFixed(1)}°C</strong></span>
          <span className="text-sm">💧 <strong className="text-blue-600">{humidity.toFixed(1)}%</strong></span>
          <span className="text-sm">🌱 <strong className="text-green-600">{moisture.toFixed(1)}%</strong></span>
          {lastUpdate && (
            <span className="text-xs text-gray-400 ml-auto">Updated {lastUpdate.toLocaleTimeString()}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-6 items-center border-t border-agri-frost pt-3">
          <span className="text-xs font-bold text-agri-dark uppercase tracking-widest w-28">
            Predicted (30 min)
          </span>
          <span className="text-sm">🌡️ <strong className="text-red-400">{pTemp.toFixed(1)}°C</strong></span>
          <span className="text-sm">💧 <strong className="text-blue-400">{pHumid.toFixed(1)}%</strong></span>
          <span className="text-sm">🌱 <strong className="text-green-400">{pMoisture.toFixed(1)}%</strong></span>
          {!predictions && (
            <span className="text-xs text-amber-600 ml-2">
              Train the LSTM model on the Predictions page for real forecasts
            </span>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* MODULE 7 — Sensor Intelligence Summary                               */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <ModuleCard icon="📊" title="Sensor Intelligence Summary">
        <div className="flex items-center gap-6 flex-wrap">
          {/* Big farm score */}
          <div className="text-center shrink-0">
            <div className={`text-5xl font-extrabold ${
              summary.overallFarmScore > 70 ? 'text-emerald-600' :
              summary.overallFarmScore > 40 ? 'text-amber-500' : 'text-red-600'
            }`}>
              {summary.overallFarmScore}
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-widest mt-1">Farm Score</div>
          </div>

          <div className="flex-1 min-w-[200px] space-y-3">
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Soil',     value: summary.soilStatus },
                { label: 'Climate',  value: summary.climateStatus },
                { label: 'Humidity', value: summary.humidityStatus },
              ].map(s => (
                <span key={s.label}
                  className="px-3 py-1.5 rounded-full bg-white border border-agri-frost text-xs font-semibold text-agri-dark">
                  {s.value}
                </span>
              ))}
            </div>
            <div className="bg-agri-primary/10 border border-agri-frost rounded-xl px-4 py-2">
              <p className="text-sm font-semibold text-agri-dark">{summary.todayAdvice}</p>
            </div>
          </div>
        </div>

        {/* Current vs Predicted row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Temperature', curr: temp,     pred: pTemp,     unit: '°C', color: 'text-red-600' },
            { label: 'Humidity',    curr: humidity, pred: pHumid,    unit: '%',  color: 'text-blue-600' },
            { label: 'Moisture',    curr: moisture, pred: pMoisture, unit: '%',  color: 'text-green-600' },
          ].map(({ label, curr, pred, unit, color }) => {
            const diff = pred - curr;
            const arrow      = diff >  0.5 ? '↑' : diff < -0.5 ? '↓' : '→';
            const arrowColor = diff >  0.5 ? 'text-red-500' : diff < -0.5 ? 'text-blue-500' : 'text-gray-400';
            return (
              <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                <p className={`text-lg font-bold ${color}`}>{curr.toFixed(1)}{unit}</p>
                <p className={`text-sm font-semibold ${arrowColor}`}>{arrow} {pred.toFixed(1)}{unit}</p>
              </div>
            );
          })}
        </div>
      </ModuleCard>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* MODULE 4 — Crop Health Monitor                                       */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <ModuleCard icon="🌿" title="Crop Health Monitor">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Gauge */}
          <div className="shrink-0 w-full sm:w-auto flex flex-col items-center">
            <HealthGauge score={health.overallHealth} />
            <p className={`text-center text-sm font-bold mt-2 ${
              health.status === 'Healthy' ? 'text-emerald-600' :
              health.status === 'At Risk' ? 'text-amber-600' : 'text-red-600'
            }`}>
              {health.status}
            </p>
          </div>

          {/* Risk cards */}
          <div className="flex-1 w-full space-y-2">
            {health.risks.map((risk, i) => (
              <div key={i} className={`rounded-xl border p-3 ${
                risk.color === 'green'  ? 'bg-emerald-50 border-emerald-200' :
                risk.color === 'orange' ? 'bg-orange-50 border-orange-200'  :
                                          'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                  <span className="text-sm font-bold text-gray-800">{risk.icon} {risk.type}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    risk.risk === 'CRITICAL' ? 'bg-red-600 text-white' :
                    risk.risk === 'HIGH'     ? 'bg-red-200 text-red-800' :
                                              'bg-emerald-200 text-emerald-800'
                  }`}>{risk.risk}</span>
                </div>
                <p className="text-xs text-gray-600">{risk.disease}</p>
                <p className="text-xs text-gray-500 mt-0.5">Prevention: {risk.prevention}</p>
                <p className="text-xs text-gray-400 mt-0.5">Affected: {risk.affectedCrops}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-agri-snow border border-agri-frost rounded-xl px-4 py-2 text-sm text-agri-dark">
          Predicted crop health in 30 min:{' '}
          <strong className={predHealth > 70 ? 'text-emerald-600' : predHealth > 40 ? 'text-amber-600' : 'text-red-600'}>
            {predHealth}%
          </strong>
        </div>
      </ModuleCard>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* MODULE 1 — Crop Recommendation Engine                                */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <ModuleCard icon="🌾" title="Crop Recommendation Engine">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {crops.map(crop => (
            <div key={crop.name} className="rounded-xl border border-agri-frost bg-agri-snow p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{crop.icon}</span>
                  <span className="font-bold text-agri-dark">{crop.name}</span>
                </div>
                <span className="text-lg font-extrabold text-agri-primary">{crop.score}%</span>
              </div>
              {/* Suitability bar */}
              <div className="w-full h-2 rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-agri-primary"
                  style={{ width: `${crop.score}%`, transition: 'width 0.5s ease' }}
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                  {crop.season}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                  💧 {crop.water}
                </span>
              </div>
              <p className="text-xs text-gray-500">{crop.reason}</p>
            </div>
          ))}
        </div>
      </ModuleCard>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* MODULE 2 — Irrigation Intelligence                                   */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <ModuleCard icon="💧" title="Irrigation Intelligence">
        {/* Urgency banner */}
        <div className={`rounded-xl border px-4 py-3 ${urgencyBg[irrigation.urgency]}`}>
          <p className={`font-bold text-sm ${urgencyText[irrigation.urgency]}`}>
            {urgencyIcon[irrigation.urgency]} — {irrigation.advices[0]}
          </p>
        </div>

        {/* Schedule grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'When',         value: irrigation.timeToIrrigate },
            { label: 'Water Needed', value: irrigation.waterNeeded > 0 ? `${irrigation.waterNeeded} L/100m²` : 'None required' },
            { label: 'Best Time',    value: irrigation.bestTime },
            { label: 'Method',       value: irrigation.method },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-widest">{label}</p>
              <p className="text-sm font-semibold text-agri-dark mt-1">{value}</p>
            </div>
          ))}
        </div>

        {/* Secondary advice lines */}
        {irrigation.advices.slice(1).map((a, i) => (
          <p key={i} className="text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">{a}</p>
        ))}

        {/* Moisture trend mini-chart */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            Moisture Trend (green = actual, amber = predicted)
          </p>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={moistureChart} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0faf4" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #52b788' }}
                formatter={v => v != null ? [`${Number(v).toFixed(1)}%`, 'Moisture'] : null}
              />
              <Area type="monotone" dataKey="moisture"  stroke="#22c55e" fill="url(#mg)" strokeWidth={2} dot={false} connectNulls />
              <Area type="monotone" dataKey="predicted" stroke="#f59e0b" fill="url(#pg)" strokeWidth={2} strokeDasharray="5 3" dot={false} connectNulls />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Tip: Drip irrigation saves up to 40% water compared to flood irrigation.
        </p>
      </ModuleCard>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* MODULE 3 — Fertilizer Advisor                                        */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <ModuleCard icon="💊" title="Fertilizer Advisor">
        {moisture > 85 && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-sm text-red-700 font-semibold">
            Do not apply fertilizers when soil moisture exceeds 85% (waterlogged conditions).
          </div>
        )}
        <div className="bg-agri-snow border border-agri-frost rounded-lg px-3 py-2 text-xs text-gray-600">
          Predicted moisture in 30 min: <strong>{pMoisture.toFixed(1)}%</strong> —{' '}
          <span className={pMoisture > 85 ? 'text-red-600 font-semibold' : 'text-emerald-600 font-semibold'}>
            {pMoisture > 85 ? 'Wait before applying fertilizers.' : 'Safe to apply fertilizers.'}
          </span>
        </div>
        <div className="space-y-3">
          {fertilizer.map(f => (
            <div key={f.name} className="rounded-xl border border-agri-frost bg-agri-snow p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{f.icon}</span>
                  <span className="font-bold text-agri-dark text-sm">{f.name}</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 font-semibold font-mono">
                  {f.npk}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
                <span>Quantity: <strong className="text-gray-700">{f.quantity}</strong></span>
                <span>Timing: <strong className="text-gray-700">{f.timing}</strong></span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{f.reason}</p>
            </div>
          ))}
        </div>
      </ModuleCard>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* MODULE 6 — Weather Condition Analysis                                */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <ModuleCard icon="🌤️" title="Weather Condition Analysis">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="flex items-center gap-4 shrink-0">
            <span className="text-6xl leading-none">{weather.icon}</span>
            <div>
              <p className="text-xl font-extrabold text-agri-dark">{weather.condition}</p>
              <p className="text-sm text-gray-500 mt-1 max-w-xs leading-relaxed">{weather.advice}</p>
            </div>
          </div>
          <div className="flex-1 w-full grid grid-cols-2 gap-3">
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-widest">Temp Trend</p>
              <p className="text-lg font-bold text-red-600 mt-1">{weather.tempTrend}</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-widest">Humidity Trend</p>
              <p className="text-lg font-bold text-blue-600 mt-1">{weather.humidTrend}</p>
            </div>
          </div>
        </div>

        {/* 30-min forecast from LSTM */}
        <div className="bg-agri-snow border border-agri-frost rounded-xl px-4 py-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            Next 30 min Forecast
          </p>
          <div className="flex gap-6 flex-wrap text-sm">
            <span>🌡️ <strong className="text-red-500">{pTemp.toFixed(1)}°C</strong></span>
            <span>💧 <strong className="text-blue-500">{pHumid.toFixed(1)}%</strong></span>
            <span>🌱 <strong className="text-green-500">{pMoisture.toFixed(1)}%</strong></span>
          </div>
        </div>
      </ModuleCard>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* MODULE 5 — Daily Farm Activity Planner                               */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <ModuleCard icon="📅" title="Daily Farm Activity Planner">
        <div className="relative pl-6 space-y-0">
          {/* Vertical timeline line */}
          <div className="absolute left-[9px] top-4 bottom-4 w-0.5 bg-agri-frost" />

          {plan.map((item, i) => (
            <div key={i} className="relative flex gap-4 pb-4 last:pb-0">
              {/* Timeline dot */}
              <div className={`absolute -left-[15px] w-4 h-4 rounded-full border-2 shrink-0 mt-2 ${
                item.active
                  ? 'bg-agri-primary border-agri-primary animate-pulse'
                  : 'bg-white border-agri-frost'
              }`} />

              <div className={`flex-1 rounded-xl border p-3 ${
                item.active
                  ? 'border-agri-primary bg-agri-primary/5 shadow-sm'
                  : 'border-agri-frost bg-white'
              }`}>
                <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                  <p className="text-xs font-semibold text-gray-400">{item.time}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    item.priority === 'HIGH'   ? 'bg-red-100 text-red-700' :
                    item.priority === 'NORMAL' ? 'bg-blue-100 text-blue-700' :
                                                 'bg-gray-100 text-gray-500'
                  }`}>{item.priority}</span>
                </div>
                <p className="font-semibold text-agri-dark text-sm">{item.activity}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.reason}</p>
                {item.active && (
                  <span className="inline-block text-xs text-agri-primary font-bold mt-1">
                    Current time slot
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </ModuleCard>

    </section>
  );
}
