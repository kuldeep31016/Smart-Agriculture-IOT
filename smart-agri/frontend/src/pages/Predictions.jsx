// Deep Learning Module — LSTM Neural Network for IoT Sensor Prediction

import { useCallback, useEffect, useMemo, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import { toast } from 'react-hot-toast';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { getReadings } from '../services/firebase';
import { getSensorData } from '../services/api';

const WINDOW_SIZE = 10;
const PREDICTION_STEPS = 6;
const MIN_REQUIRED_READINGS = 20;
const MODEL_STORAGE_KEY = 'localstorage://agrisense-lstm';
const MODEL_STATS_KEY = 'agrisense-lstm-stats';

// Normalize data between 0 and 1
const normalizeData = (data, min, max) => {
  const span = max - min;
  if (!Number.isFinite(span) || span === 0) return data.map(() => 0.5);
  return data.map((v) => (v - min) / span);
};

const denormalizeData = (data, min, max) => {
  const span = max - min;
  if (!Number.isFinite(span) || span === 0) return data.map(() => min);
  return data.map((v) => v * span + min);
};

// Build LSTM model
const buildModel = (inputShape) => {
  const model = tf.sequential();

  // Input shape: [WINDOW_SIZE, 3] => 10 time-steps, 3 sensor features
  model.add(
    tf.layers.lstm({
      units: 64,
      inputShape,
      returnSequences: true,
    }),
  );

  model.add(tf.layers.dropout({ rate: 0.2 }));

  model.add(
    tf.layers.lstm({
      units: 32,
      returnSequences: false,
    }),
  );

  model.add(tf.layers.dropout({ rate: 0.2 }));
  model.add(tf.layers.dense({ units: 16, activation: 'relu' }));

  // Output vector: [temperature, humidity, moisture]
  model.add(tf.layers.dense({ units: 3 }));

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'meanSquaredError',
    metrics: ['mae'],
  });

  return model;
};

// Prepare sequences for LSTM (window size = 10)
const createSequences = (data) => {
  const X = [];
  const y = [];

  for (let i = 0; i < data.length - WINDOW_SIZE; i += 1) {
    X.push(data.slice(i, i + WINDOW_SIZE));
    y.push(data[i + WINDOW_SIZE]);
  }

  return { X, y };
};

// Train model
const trainModel = async (readings, onEpochEnd) => {
  // Extract values
  const temps = readings.map((r) => Number(r.temperature ?? 0));
  const humids = readings.map((r) => Number(r.humidity ?? 0));
  const moistures = readings.map((r) => Number(r.moisture ?? r.soil ?? 0));

  // Get min/max for normalization
  const stats = {
    temp: { min: Math.min(...temps), max: Math.max(...temps) },
    humid: { min: Math.min(...humids), max: Math.max(...humids) },
    moisture: { min: Math.min(...moistures), max: Math.max(...moistures) },
  };

  // Normalize each feature to [0, 1]
  const tempNorm = normalizeData(temps, stats.temp.min, stats.temp.max);
  const humidNorm = normalizeData(humids, stats.humid.min, stats.humid.max);
  const moistureNorm = normalizeData(moistures, stats.moisture.min, stats.moisture.max);

  const normalizedData = readings.map((_, idx) => [tempNorm[idx], humidNorm[idx], moistureNorm[idx]]);

  // Sequence creation for supervised learning
  const { X, y } = createSequences(normalizedData);

  const xTensor = tf.tensor3d(X);
  const yTensor = tf.tensor2d(y);

  const model = buildModel([WINDOW_SIZE, 3]);

  await model.fit(xTensor, yTensor, {
    epochs: 50,
    batchSize: 16,
    validationSplit: 0.2,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        onEpochEnd(epoch, logs.loss.toFixed(4));
      },
    },
  });

  // Save model
  await model.save(MODEL_STORAGE_KEY);

  // Avoid tensor leaks
  xTensor.dispose();
  yTensor.dispose();

  return { model, stats };
};

// Predict next N steps recursively using previous prediction as next input
const predictNext = (model, lastWindow, stats, steps = PREDICTION_STEPS) => {
  const predictions = [];
  let currentWindow = [...lastWindow];

  for (let i = 0; i < steps; i += 1) {
    const input = tf.tensor3d([currentWindow]);
    const pred = model.predict(input);
    const predValues = Array.from(pred.dataSync());

    const [temperature] = denormalizeData([predValues[0]], stats.temp.min, stats.temp.max);
    const [humidity] = denormalizeData([predValues[1]], stats.humid.min, stats.humid.max);
    const [moisture] = denormalizeData([predValues[2]], stats.moisture.min, stats.moisture.max);

    predictions.push({
      temperature,
      humidity,
      moisture,
    });

    currentWindow = [...currentWindow.slice(1), predValues];

    input.dispose();
    pred.dispose();
  }

  return predictions;
};

const fmtTime = (ts) => {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return ts;
  }
};

const trendArrow = (diff) => {
  if (diff > 0.001) return '↑';
  if (diff < -0.001) return '↓';
  return '→';
};

const pctChange = (current, predicted) => {
  if (!Number.isFinite(current) || current === 0) return '0.0';
  return (((predicted - current) / current) * 100).toFixed(1);
};

const getStatusClass = (sensor, value) => {
  if (!Number.isFinite(value)) return 'bg-gray-100 text-gray-700 border-gray-200';

  if (sensor === 'temperature') {
    if (value > 38 || value < 10) return 'bg-red-50 text-red-700 border-red-200';
    if (value > 32 || value < 18) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }

  if (sensor === 'humidity') {
    if (value > 90 || value < 20) return 'bg-red-50 text-red-700 border-red-200';
    if (value > 75 || value < 30) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }

  if (value < 25 || value > 85) return 'bg-red-50 text-red-700 border-red-200';
  if (value < 35 || value > 75) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  return 'bg-emerald-50 text-emerald-700 border-emerald-200';
};

function PredictionCard({ icon, title, sensorKey, currentValue, predictedValue, unit }) {
  const delta = predictedValue - currentValue;
  const percent = pctChange(currentValue, predictedValue);
  const arrow = trendArrow(delta);
  const isUp = delta > 0.001;
  const isDown = delta < -0.001;

  let svgIcon = null;
  if (sensorKey === 'temperature') svgIcon = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path></svg>;
  else if (sensorKey === 'humidity') svgIcon = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>;
  else svgIcon = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M11 20A7 7 0 0 1 4 13V8a2 2 0 0 1 2-2h4a1 1 0 0 1 1 1v1h1v-1a1 1 0 0 1 1-1h4a2 2 0 0 1 2 2v5a7 7 0 0 1-7 7z"></path></svg>;

  return (
    <div className={`bg-white rounded-[1.5rem] shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-gray-100/80 p-6 hover:shadow-lg transition-all duration-500 group overflow-hidden relative`}>
      <div className="flex items-center gap-3 mb-5">
        <div className={`p-2.5 rounded-xl bg-gray-50 border border-gray-100 shadow-sm group-hover:scale-110 transition-all duration-300`}>
          {svgIcon || icon}
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 drop-shadow-sm">{title}</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <p className="text-gray-400 text-[11px] font-semibold uppercase tracking-[0.1em]">Actual</p>
          <p className="text-lg font-bold text-gray-700">{currentValue.toFixed(1)}<span className="text-xs ml-0.5">{unit}</span></p>
        </div>

        <div className="flex items-end justify-between border-t border-gray-100/50 pt-4">
          <p className="text-black text-xs font-bold uppercase tracking-[0.1em]">Forecast</p>
          <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{predictedValue.toFixed(1)}<span className="text-base text-gray-400 ml-1">{unit}</span></p>
        </div>

        <div className={`flex items-center justify-between pt-2 ${isUp ? 'text-red-500' : isDown ? 'text-blue-500' : 'text-emerald-500'}`}>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-opacity-80">Trend Direction</span>
          <span className="text-sm font-bold flex items-center gap-1">
            {isUp && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>}
            {isDown && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg>}
            {!isUp && !isDown && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>}
            {percent}%
          </span>
        </div>
      </div>
    </div>
  );
}

function SensorForecastChart({ title, unit, color, sensorKey, actualSeries, predictedSeries }) {
  const actualData = actualSeries.slice(-20).map((row) => ({
    label: fmtTime(row.timestamp),
    actual: Number(row[sensorKey] ?? 0),
    predicted: null,
  }));

  const predictedData = predictedSeries.map((row) => ({
    label: fmtTime(row.timestamp),
    actual: null,
    predicted: Number(row[sensorKey] ?? 0),
  }));

  const data = [...actualData, ...predictedData];

  return (
    <div className="bg-white rounded-2xl shadow-md p-5">
      <h3 className="font-bold text-agri-primary mb-3">{title}</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d8f3dc" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#f0faf4',
              border: '1px solid #52b788',
              borderRadius: '10px',
              fontSize: '13px',
            }}
            formatter={(v) => (v == null ? ['—', unit] : [`${Number(v).toFixed(2)}${unit}`, unit])}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line type="monotone" dataKey="actual" name="Actual (last 20)" stroke={color} strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="predicted" name="Predicted (next 6)" stroke={color} strokeWidth={2.5} strokeDasharray="6 4" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Predictions() {
  const [readings, setReadings] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [model, setModel] = useState(null);
  const [stats, setStats] = useState(null);

  const [isTraining, setIsTraining] = useState(false);
  const [epochInfo, setEpochInfo] = useState({ epoch: 0, loss: '0.0000', progress: 0 });

  const [predictions, setPredictions] = useState([]);

  const readingsChrono = useMemo(() => [...readings].reverse(), [readings]); // oldest -> newest
  const latest = readingsChrono[readingsChrono.length - 1];

  const normalizeReadings = useCallback((data = []) => (
    data
      .filter((r) => Number.isFinite(Number(r.temperature)) && Number.isFinite(Number(r.humidity)))
      .map((r) => ({
        ...r,
        moisture: Number(r.moisture ?? r.soil ?? 0),
      }))
  ), []);

  const fetchHistoricalData = useCallback(async () => {
    try {
      setLoadingData(true);
      // Primary source: direct Firestore web SDK
      try {
        const firestoreData = await getReadings(100); // newest first
        const cleaned = normalizeReadings(firestoreData);
        if (cleaned.length > 0) {
          setReadings(cleaned);
          return;
        }
      } catch (firestoreErr) {
        console.warn('Firestore direct fetch failed, trying backend fallback:', firestoreErr?.message || firestoreErr);
      }

      // Fallback source: backend API (which reads from Firestore using Admin SDK)
      const backendData = await getSensorData(100); // newest first
      const cleanedFallback = normalizeReadings(backendData);
      setReadings(cleanedFallback);
      toast.success('Loaded readings via backend cloud API');
    } catch (error) {
      console.error(error);
      setReadings([]);
      toast.error('Could not fetch sensor readings from Firestore or backend API');
    } finally {
      setLoadingData(false);
    }
  }, [normalizeReadings]);

  const runPredictions = useCallback((activeModel, activeStats, sourceReadings) => {
    if (!activeModel || !activeStats || sourceReadings.length < WINDOW_SIZE) {
      setPredictions([]);
      return;
    }

    const temps = sourceReadings.map((r) => Number(r.temperature ?? 0));
    const humids = sourceReadings.map((r) => Number(r.humidity ?? 0));
    const moistures = sourceReadings.map((r) => Number(r.moisture ?? r.soil ?? 0));

    const tempNorm = normalizeData(temps, activeStats.temp.min, activeStats.temp.max);
    const humidNorm = normalizeData(humids, activeStats.humid.min, activeStats.humid.max);
    const moistureNorm = normalizeData(moistures, activeStats.moisture.min, activeStats.moisture.max);

    const normalized = sourceReadings.map((_, idx) => [tempNorm[idx], humidNorm[idx], moistureNorm[idx]]);
    const lastWindow = normalized.slice(-WINDOW_SIZE);

    const next = predictNext(activeModel, lastWindow, activeStats, PREDICTION_STEPS);

    const lastTs = sourceReadings[sourceReadings.length - 1]?.timestamp
      ? new Date(sourceReadings[sourceReadings.length - 1].timestamp).getTime()
      : Date.now();

    const withTime = next.map((p, index) => ({
      ...p,
      timestamp: new Date(lastTs + (index + 1) * 5000).toISOString(), // 5-second sampling interval
      step: index + 1,
    }));

    setPredictions(withTime);
  }, []);

  const loadSavedModel = useCallback(async () => {
    try {
      const saved = await tf.io.listModels();
      if (!saved[MODEL_STORAGE_KEY]) return;

      const loadedModel = await tf.loadLayersModel(MODEL_STORAGE_KEY);
      const savedStatsRaw = localStorage.getItem(MODEL_STATS_KEY);
      if (!savedStatsRaw) return;

      const parsedStats = JSON.parse(savedStatsRaw);
      setModel(loadedModel);
      setStats(parsedStats);

      toast.success('Saved LSTM model loaded from localStorage');
    } catch (error) {
      console.warn('No saved model found or failed to load:', error.message);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      await tf.ready();
      if (!mounted) return;
      await fetchHistoricalData();
      await loadSavedModel();
    })();

    return () => {
      mounted = false;
    };
  }, [fetchHistoricalData, loadSavedModel]);

  useEffect(() => {
    if (model && stats && readingsChrono.length >= WINDOW_SIZE) {
      runPredictions(model, stats, readingsChrono);
    }
  }, [model, stats, readingsChrono, runPredictions]);

  const handleTrain = async () => {
    if (readingsChrono.length < MIN_REQUIRED_READINGS) {
      toast.error('Need more data — collect at least 20 readings first');
      return;
    }

    setIsTraining(true);
    setEpochInfo({ epoch: 0, loss: '0.0000', progress: 0 });

    try {
      const result = await trainModel(readingsChrono, (epoch, loss) => {
        const currentEpoch = epoch + 1;
        const progress = Math.round((currentEpoch / 50) * 100);
        setEpochInfo({ epoch: currentEpoch, loss, progress });
      });

      setModel(result.model);
      setStats(result.stats);
      localStorage.setItem(MODEL_STATS_KEY, JSON.stringify(result.stats));

      runPredictions(result.model, result.stats, readingsChrono);

      toast.success(`Model trained successfully on ${readingsChrono.length} data points`);
    } catch (error) {
      console.error(error);
      toast.error('Model training failed');
    } finally {
      setIsTraining(false);
    }
  };

  const latestPrediction = predictions[predictions.length - 1];

  const smartAlerts = useMemo(() => {
    if (!predictions.length) return [];

    const alerts = [];
    const willDry = predictions.some((p) => p.moisture < 25);
    const heatStress = predictions.some((p) => p.temperature > 38);
    const fungalRisk = predictions.some((p) => p.humidity > 90);

    if (willDry) alerts.push('⚠️ Soil will dry out soon — Start irrigation');
    if (heatStress) alerts.push('🔴 Heat stress predicted — Protect crops');
    if (fungalRisk) alerts.push('🟡 Fungal risk in next 30 min — Apply fungicide');

    if (!alerts.length) alerts.push('✅ Conditions will remain optimal for next 30 minutes');

    return alerts;
  }, [predictions]);

  return (
    <div className="bg-[#fafafa] min-h-screen pb-12">
      <section className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        <header className="pb-6 border-b border-gray-200/60">
          <h1 className="text-4xl md:text-[3rem] font-bold text-gray-900 tracking-tight leading-none mb-3">
            AI Predictions
          </h1>
          <p className="text-gray-500 font-medium text-lg">
            Deep Learning forecasting via historical Firebase telemetry
          </p>
        </header>

        {/* Section A — Model Training */}
        <div className="rounded-[2rem] bg-white border border-gray-100/80 p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-[#f0f7f4] text-[#1a472a] flex items-center justify-center shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Model Training</h2>
                <p className="text-sm font-medium text-gray-500 mt-1">
                  Telemetry sequences loaded: <span className="font-bold text-gray-900">{loadingData ? '...' : readings.length}</span>
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={fetchHistoricalData}
                disabled={loadingData || isTraining}
                className="px-6 py-3 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-60 font-semibold text-sm transition-all shadow-sm flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2.34 11.5a10 10 0 1 1 2.38 7.5L2.5 22" /></svg>
                Refresh
              </button>
              <button
                onClick={handleTrain}
                disabled={isTraining || loadingData || readingsChrono.length < MIN_REQUIRED_READINGS}
                className="px-6 py-3 rounded-full bg-[#1a472a] hover:bg-[#112a1f] hover:scale-105 transition-all text-white disabled:opacity-60 font-semibold text-sm shadow-md flex items-center gap-2"
              >
                {model ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.92-10.26l5.08 5.08" /></svg> Retrain Model</> : 'Initialize Engine'}
              </button>
            </div>
          </div>

          {readingsChrono.length < MIN_REQUIRED_READINGS && !loadingData && (
            <p className="text-yellow-200 text-sm font-medium">
              Need more data — collect at least 20 readings first
            </p>
          )}

          {isTraining && (
            <div className="space-y-3 bg-gray-50 p-5 rounded-2xl border border-gray-100 shadow-inner">
              <div className="flex justify-between text-sm font-bold text-gray-700">
                <span className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div> Epoch {epochInfo.epoch}/50</span>
                <span className="font-mono">LOSS: {epochInfo.loss}</span>
              </div>
              <div className="w-full h-4 rounded-full bg-gray-200 overflow-hidden shadow-inner">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${epochInfo.progress}%` }}
                />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Processing TF.js Tensors...</p>
            </div>
          )}

          {!isTraining && model && (
            <div className="flex items-center gap-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <p className="text-emerald-800 font-semibold text-sm">
                In-browser neural network trained synchronously on <span className="font-extrabold">{readingsChrono.length}</span> sequential records.
              </p>
            </div>
          )}
        </div>

        {/* Section B — Predictions Display */}
        <div className="space-y-6 pt-4">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            Forecast Horizon (T+6)
          </h2>

          {!model || !latest || !latestPrediction ? (
            <div className="bg-white rounded-2xl shadow-md p-6 text-gray-500">
              Train or load the model to see forecasts for Temperature, Humidity, and Moisture.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PredictionCard
                icon="🌡️"
                title="Temperature Forecast (next 30 min)"
                sensorKey="temperature"
                currentValue={Number(latest.temperature ?? 0)}
                predictedValue={Number(latestPrediction.temperature ?? 0)}
                unit="°C"
              />
              <PredictionCard
                icon="💧"
                title="Humidity Forecast (next 30 min)"
                sensorKey="humidity"
                currentValue={Number(latest.humidity ?? 0)}
                predictedValue={Number(latestPrediction.humidity ?? 0)}
                unit="%"
              />
              <PredictionCard
                icon="🌱"
                title="Moisture Forecast (next 30 min)"
                sensorKey="moisture"
                currentValue={Number(latest.moisture ?? latest.soil ?? 0)}
                predictedValue={Number(latestPrediction.moisture ?? 0)}
                unit="%"
              />
            </div>
          )}
        </div>

        {/* Section C — Prediction Charts */}
        <div className="space-y-6 pt-4">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M3 3v18h18" /><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" /></svg>
            Statistical Divergence
          </h2>

          {!predictions.length ? (
            <div className="bg-white rounded-2xl shadow-md p-6 text-gray-500">
              No predictions available yet. Train/retrain the model first.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              <SensorForecastChart
                title="🌡️ Temperature — Actual vs Predicted"
                unit="°C"
                color="#ef4444"
                sensorKey="temperature"
                actualSeries={readingsChrono}
                predictedSeries={predictions}
              />
              <SensorForecastChart
                title="💧 Humidity — Actual vs Predicted"
                unit="%"
                color="#3b82f6"
                sensorKey="humidity"
                actualSeries={readingsChrono}
                predictedSeries={predictions}
              />
              <SensorForecastChart
                title="🌱 Moisture — Actual vs Predicted"
                unit="%"
                color="#22c55e"
                sensorKey="moisture"
                actualSeries={readingsChrono}
                predictedSeries={predictions}
              />
            </div>
          )}
        </div>

        {/* Section D — Smart Alerts */}
        <div className="space-y-6 pt-4">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            Automated Insights
          </h2>

          <div className="bg-white rounded-[1.5rem] shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-gray-100/80 p-6">
            {!predictions.length ? (
              <p className="text-gray-400 font-medium">Awaiting neural network initialization to process insights.</p>
            ) : (
              <ul className="space-y-3">
                {smartAlerts.map((msg) => (
                  <li key={msg} className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span> {msg}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
