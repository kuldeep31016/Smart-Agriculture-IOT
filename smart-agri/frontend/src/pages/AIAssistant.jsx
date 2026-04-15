// AI Assistant Page — 6 sections powered by Google Gemini 2.0 Flash
// Deep Learning Layer: Problem Statement 7
// Sections: Crop Recommendation, Fertilizer, Irrigation, Disease Risk, Data Analysis, Chatbot

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import CropResult from '../components/CropResult';
import ChatBox    from '../components/ChatBox';
import { getSensorData }       from '../services/api';
import { callGemini }          from '../services/gemini';
import { getFallbackResponse } from '../services/chatFallback';

// ── Gemini prompt templates ───────────────────────────────────────────────────
// Each prompt is tuned for Indian agriculture context

const buildCropPrompt = (t, h, m) =>
  `You are an expert agricultural AI. Current sensor readings: Temperature=${t}°C, Humidity=${h}%, Soil Moisture=${m}%. ` +
  `Recommend the top 3 best crops to grow right now. For each crop give: crop name, suitability score out of 10, reason in 1 line, ideal season. ` +
  `Format as a clean structured response with crop names as headings.`;

const buildFertPrompt = (t, h, m) =>
  `You are an agriculture expert. Sensor readings: Temperature=${t}°C, Humidity=${h}%, Soil Moisture=${m}%. ` +
  `Suggest the best fertilizers for optimal crop growth. Include: fertilizer name, NPK ratio, quantity per acre, application method, and best time to apply. ` +
  `Give practical advice for Indian farmers.`;

const buildIrrigPrompt = (t, h, m) =>
  `Agricultural advisor: Soil Moisture is ${m}%, Temperature is ${t}°C, Humidity is ${h}%. ` +
  `Should the farmer irrigate today? How much water in liters per acre? Best time of day to irrigate? Any drip irrigation tips? ` +
  `Give concise practical advice with a clear YES/NO irrigation decision.`;

const buildDiseasePrompt = (t, h, m) =>
  `Plant pathology expert: Temperature=${t}°C, Humidity=${h}%, Moisture=${m}%. ` +
  `What plant diseases or fungal/bacterial attacks are likely under these conditions? ` +
  `List top 3 risks with: disease name, risk level (High/Medium/Low), symptoms to watch for, and prevention measures. ` +
  `Focus on common Indian agricultural diseases.`;

const buildAnalysisPrompt = (readings) =>
  `Agricultural data analyst: Here are the last sensor readings: ${JSON.stringify(readings.slice(0, 20))}. ` +
  `Analyze the trend. Is temperature rising or falling? Is soil drying out? Are conditions getting better or worse for farming? ` +
  `Give a 5-line summary with actionable advice for the farmer.`;

const buildChatPrompt = (t, h, m, userMsg) =>
  `You are AgriSense AI, an expert agriculture assistant for Indian farmers. ` +
  `Current sensor readings: Temperature=${t}°C, Humidity=${h}%, Soil Moisture=${m}%. ` +
  `Answer farming questions in simple English. Be practical and helpful. Support Hindi questions too.\n\nFarmer asks: ${userMsg}`;

// ── Section wrapper component ─────────────────────────────────────────────────
function Section({ icon, title, description, buttonLabel, onAction, loading, result, loadingText, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-agri-frost p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-agri-dark flex items-center gap-2">
            <span>{icon}</span> {title}
          </h2>
          <p className="text-gray-500 text-sm mt-1">{description}</p>
        </div>
        <button
          onClick={onAction}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-agri-primary text-white font-semibold text-sm hover:bg-agri-medium transition-colors disabled:opacity-60 shrink-0"
        >
          {loading
            ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Loading...</span>
            : buttonLabel}
        </button>
      </div>
      {children}
      <CropResult result={result} loading={loading} loadingText={loadingText} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AIAssistant() {
  const [sensorData, setSensorData]       = useState(null);
  const [readings, setReadings]           = useState([]);
  const [loadingSensor, setLoadingSensor] = useState(true);

  // Section results
  const [cropResult,     setCropResult]     = useState('');
  const [fertResult,     setFertResult]     = useState('');
  const [irrigResult,    setIrrigResult]    = useState('');
  const [diseaseResult,  setDiseaseResult]  = useState('');
  const [analysisResult, setAnalysisResult] = useState('');

  // Section loading states
  const [loadCrop,     setLoadCrop]     = useState(false);
  const [loadFert,     setLoadFert]     = useState(false);
  const [loadIrrig,    setLoadIrrig]    = useState(false);
  const [loadDisease,  setLoadDisease]  = useState(false);
  const [loadAnalysis, setLoadAnalysis] = useState(false);

  // Chatbot
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput,    setChatInput]    = useState('');
  const [chatLoading,  setChatLoading]  = useState(false);

  // Fetch latest sensor reading on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await getSensorData(20);
        if (Array.isArray(data) && data.length > 0) {
          setSensorData(data[0]);
          setReadings(data);
        }
      } catch {
        toast.error('Could not load sensor data');
      } finally {
        setLoadingSensor(false);
      }
    })();
  }, []);

  const t = sensorData?.temperature ?? '—';
  const h = sensorData?.humidity    ?? '—';
  const m = sensorData?.moisture ?? sensorData?.soil ?? '—';

  // Generic AI call wrapper
  const callAI = useCallback(async (prompt, setResult, setLoading) => {
    if (t === '—') { toast.error('No sensor data available'); return; }
    setLoading(true);
    try {
      const text = await callGemini(prompt);
      setResult(text);
    } catch (err) {
      toast.error(err.message || 'AI service temporarily unavailable. Please try again.');
      setResult('');
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Chat send handler
  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);
    try {
      const reply = await callGemini(buildChatPrompt(t, h, m, userMsg));
      setChatMessages(prev => [...prev, { role: 'ai', text: reply }]);
    } catch {
      // Gemini unavailable → use local agriculture Q&A fallback
      const fallback = getFallbackResponse(userMsg);
      setChatMessages(prev => [...prev, { role: 'ai', text: fallback }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Pre-fill chat from an alert context
  const askAIAbout = (context) => {
    setChatInput(context);
    document.getElementById('chatbox-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="max-w-5xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <header>
        <h1 className="text-3xl font-extrabold text-agri-primary">🤖 AI Assistant</h1>
        <p className="text-gray-500 mt-1">Powered by Google Gemini 2.0 Flash — Deep Learning for Smart Agriculture</p>
      </header>

      {/* Current sensor context bar */}
      <div className={`rounded-2xl border px-5 py-4 flex flex-wrap gap-6 items-center ${
        loadingSensor ? 'bg-gray-50 border-gray-200 animate-pulse' : 'bg-agri-snow border-agri-frost'
      }`}>
        <span className="text-sm font-bold text-agri-dark uppercase tracking-widest">Current Readings</span>
        <span className="text-sm">🌡️ <strong className="text-red-600">{t !== '—' ? `${t}°C` : '—'}</strong></span>
        <span className="text-sm">💧 <strong className="text-blue-600">{h !== '—' ? `${h}%` : '—'}</strong></span>
        <span className="text-sm">🌱 <strong className="text-green-600">{m !== '—' ? `${m}%` : '—'}</strong></span>
        {loadingSensor && <span className="text-xs text-gray-400 ml-auto">Loading sensor data...</span>}
      </div>

      {/* ── Section A: Crop Recommendation ─────────────────────────────────── */}
      <Section
        icon="🌾" title="Crop Recommendation"
        description="Get top 3 crop suggestions based on current field conditions"
        buttonLabel="🌾 Get Crop Recommendation"
        onAction={() => callAI(buildCropPrompt(t, h, m), setCropResult, setLoadCrop)}
        loading={loadCrop}
        result={cropResult}
        loadingText="Analyzing crop suitability with Gemini AI..."
      />

      {/* ── Section B: Fertilizer Advisor ──────────────────────────────────── */}
      <Section
        icon="💊" title="Fertilizer Advisor"
        description="Get NPK ratios, application quantities, and timing advice for Indian farms"
        buttonLabel="💊 Get Fertilizer Advice"
        onAction={() => callAI(buildFertPrompt(t, h, m), setFertResult, setLoadFert)}
        loading={loadFert}
        result={fertResult}
        loadingText="Calculating fertilizer recommendations..."
      />

      {/* ── Section C: Irrigation Advisor ──────────────────────────────────── */}
      <Section
        icon="💧" title="Irrigation Advisor"
        description="Should you irrigate today? Get water quantity and drip irrigation tips"
        buttonLabel="💧 Irrigation Schedule"
        onAction={() => callAI(buildIrrigPrompt(t, h, m), setIrrigResult, setLoadIrrig)}
        loading={loadIrrig}
        result={irrigResult}
        loadingText="Calculating irrigation schedule..."
      />

      {/* ── Section D: Disease & Risk Alert ────────────────────────────────── */}
      <Section
        icon="🦠" title="Disease & Risk Alert"
        description="Identify top 3 plant disease risks with prevention measures"
        buttonLabel="🦠 Check Disease Risk"
        onAction={() => callAI(buildDiseasePrompt(t, h, m), setDiseaseResult, setLoadDisease)}
        loading={loadDisease}
        result={diseaseResult}
        loadingText="Scanning for disease risks..."
      />

      {/* ── Section E: Sensor Data Analysis ────────────────────────────────── */}
      <Section
        icon="📊" title="Sensor Data Analysis"
        description="AI analysis of last 20 readings — trends, patterns, and actionable insights"
        buttonLabel="📊 Analyze Last 20 Readings"
        onAction={() => callAI(buildAnalysisPrompt(readings), setAnalysisResult, setLoadAnalysis)}
        loading={loadAnalysis}
        result={analysisResult}
        loadingText="Analyzing historical sensor trends..."
      />

      {/* ── Section F: AI Farmer Chatbot ───────────────────────────────────── */}
      <div id="chatbox-section">
        <h2 className="text-xl font-bold text-agri-dark mb-3 flex items-center gap-2">
          <span>💬</span> AI Farmer Chatbot
        </h2>
        <ChatBox
          messages={chatMessages}
          input={chatInput}
          onInputChange={setChatInput}
          onSend={handleChatSend}
          loading={chatLoading}
        />
      </div>

    </section>
  );
}
