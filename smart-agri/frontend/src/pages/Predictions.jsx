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

  return (
    <div className={`rounded-2xl border p-5 ${getStatusClass(sensorKey, predictedValue)} shadow-sm`}>
      <p className="text-sm font-semibold uppercase tracking-wide opacity-80">{icon} {title}</p>
      <div className="mt-3 space-y-1">
        <p className="text-sm">Current: <span className="font-bold">{currentValue.toFixed(1)}{unit}</span></p>
        <p className="text-sm">Predicted: <span className="font-bold">{predictedValue.toFixed(1)}{unit}</span></p>
        <p className="text-sm">Trend: <span className="font-bold">{arrow}</span> ({percent}%)</p>
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
    <section className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-agri-primary">🔮 AI Predictions</h1>
        <p className="text-gray-600 mt-1">
          LSTM Deep Learning forecast using Firestore historical sensor data
        </p>
      </header>

      {/* Section A — Model Training */}
      <div className="rounded-2xl bg-[#1a472a] text-white p-6 shadow-xl border border-[#2d6a4f] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-wider text-emerald-200">Section A</p>
            <h2 className="text-xl font-bold">Model Training</h2>
            <p className="text-sm text-emerald-100 mt-1">
              Firestore readings loaded: <span className="font-bold">{loadingData ? '...' : readings.length}</span>
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchHistoricalData}
              disabled={loadingData || isTraining}
              className="px-4 py-2 rounded-lg bg-[#2d6a4f] hover:bg-[#52b788] disabled:opacity-60 font-semibold text-sm"
            >
              Refresh Data
            </button>
            <button
              onClick={handleTrain}
              disabled={isTraining || loadingData || readingsChrono.length < MIN_REQUIRED_READINGS}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 font-semibold text-sm"
            >
              {model ? '🔄 Retrain Model' : 'Train LSTM Model'}
            </button>
          </div>
        </div>

        {readingsChrono.length < MIN_REQUIRED_READINGS && !loadingData && (
          <p className="text-yellow-200 text-sm font-medium">
            Need more data — collect at least 20 readings first
          </p>
        )}

        {isTraining && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Epoch: {epochInfo.epoch}/50</span>
              <span>Loss: {epochInfo.loss}</span>
            </div>
            <div className="w-full h-3 rounded-full bg-black/25 overflow-hidden">
              <div
                className="h-full bg-blue-400 transition-all"
                style={{ width: `${epochInfo.progress}%` }}
              />
            </div>
            <p className="text-xs text-emerald-100">Training in browser with TensorFlow.js...</p>
          </div>
        )}

        {!isTraining && model && (
          <p className="text-emerald-200 font-semibold">
            ✅ Model trained successfully on {readingsChrono.length} data points
          </p>
        )}
      </div>

      {/* Section B — Predictions Display */}
      <div className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-wider text-gray-500">Section B</p>
          <h2 className="text-xl font-bold text-agri-primary">Predictions (Next 6 Time Steps)</h2>
        </div>

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
      <div className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-wider text-gray-500">Section C</p>
          <h2 className="text-xl font-bold text-agri-primary">Prediction Charts</h2>
        </div>

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
      <div className="space-y-3">
        <div>
          <p className="text-sm uppercase tracking-wider text-gray-500">Section D</p>
          <h2 className="text-xl font-bold text-agri-primary">Smart Alerts from Predictions</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5 border border-agri-frost">
          {!predictions.length ? (
            <p className="text-gray-500">Run training to generate prediction-based alerts.</p>
          ) : (
            <ul className="space-y-2">
              {smartAlerts.map((msg) => (
                <li key={msg} className="text-sm font-medium text-gray-700">{msg}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
