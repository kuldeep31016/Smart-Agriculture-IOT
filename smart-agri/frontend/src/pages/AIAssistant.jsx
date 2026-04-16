// AI Assistant Page — 6 sections powered by Google Gemini 2.0 Flash
// Deep Learning Layer: Problem Statement 7
// Sections: Crop Recommendation, Fertilizer, Irrigation, Disease Risk, Data Analysis, Chatbot

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import CropResult from '../components/CropResult';
import ChatBox from '../components/ChatBox';
import { getSensorData } from '../services/api';
import { callGemini } from '../services/gemini';
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
    <div className="bg-white rounded-[1.5rem] shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-gray-100/80 p-5 hover:shadow-lg transition-all duration-500">
      <div className="flex items-center justify-between gap-4 flex-wrap md:flex-nowrap">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#f0f7f4] text-[#1a472a] flex items-center justify-center shrink-0 border border-[#1a472a]/5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
          </div>
          <div>
            <h2 className="text-[1.1rem] font-bold text-gray-900 tracking-tight">
              {title}
            </h2>
            <p className="text-gray-500 text-[11px] font-medium mt-0.5">{description}</p>
          </div>
        </div>
        <button
          onClick={onAction}
          disabled={loading}
          className="px-5 py-2.5 rounded-full bg-[#1a472a] text-white font-semibold text-xs hover:bg-[#112a1f] hover:scale-105 transition-all shadow-sm disabled:opacity-60 shrink-0 w-full md:w-auto flex justify-center"
        >
          {loading
            ? <span className="flex items-center gap-2"><div className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />Analyzing...</span>
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
  const [sensorData, setSensorData] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loadingSensor, setLoadingSensor] = useState(true);

  // Section results
  const [cropResult, setCropResult] = useState('');
  const [fertResult, setFertResult] = useState('');
  const [irrigResult, setIrrigResult] = useState('');
  const [diseaseResult, setDiseaseResult] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');

  // Section loading states
  const [loadCrop, setLoadCrop] = useState(false);
  const [loadFert, setLoadFert] = useState(false);
  const [loadIrrig, setLoadIrrig] = useState(false);
  const [loadDisease, setLoadDisease] = useState(false);
  const [loadAnalysis, setLoadAnalysis] = useState(false);

  // Chatbot
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

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
  const h = sensorData?.humidity ?? '—';
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
    <div className="bg-[#fafafa] min-h-screen">
      <section className="max-w-5xl mx-auto px-6 py-12 space-y-10">

        {/* Header */}
        <header className="pb-6 border-b border-gray-200/60">
          <h1 className="text-4xl md:text-[3rem] font-bold text-gray-900 tracking-tight leading-none mb-3">AI Intelligence</h1>
          <p className="text-gray-500 font-medium text-lg">Powered by advanced deep learning models</p>
        </header>

        {/* Current sensor context bar */}
        <div className={`rounded-3xl border px-8 py-5 flex flex-wrap gap-8 items-center shadow-sm ${loadingSensor ? 'bg-white border-gray-100 animate-pulse' : 'bg-white border-gray-100/80 backdrop-blur-sm'
          }`}>
          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-r border-gray-100 pr-8">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            Live Context
          </div>
          <span className="text-sm font-semibold text-gray-500 flex items-center gap-2"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path></svg> <strong className="text-gray-900 text-lg">{t !== '—' ? `${t}°C` : '—'}</strong></span>
          <span className="text-sm font-semibold text-gray-500 flex items-center gap-2"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg> <strong className="text-gray-900 text-lg">{h !== '—' ? `${h}%` : '—'}</strong></span>
          <span className="text-sm font-semibold text-gray-500 flex items-center gap-2"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M11 20A7 7 0 0 1 4 13V8a2 2 0 0 1 2-2h4a1 1 0 0 1 1 1v1h1v-1a1 1 0 0 1 1-1h4a2 2 0 0 1 2 2v5a7 7 0 0 1-7 7z"></path></svg> <strong className="text-gray-900 text-lg">{m !== '—' ? `${m}%` : '—'}</strong></span>
          {loadingSensor && <span className="text-xs font-semibold text-gray-400 ml-auto">Synchronizing...</span>}
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
        <div id="chatbox-section" className="pt-6">
          <h2 className="text-[1.35rem] font-bold text-gray-900 tracking-tight flex items-center gap-3 mb-6 pl-2">
            <div className="w-8 h-8 rounded-full bg-[#fde047]/20 flex items-center justify-center text-[#eab308]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            </div>
            Interactive Farmer Assistant
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
    </div>
  );
}
