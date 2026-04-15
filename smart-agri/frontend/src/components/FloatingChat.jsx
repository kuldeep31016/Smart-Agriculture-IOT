// FloatingChat — global AI chatbot toggle button (bottom-right corner)
// Available on every page via MainLayout
// Uses Gemini API with automatic fallback to local agriculture Q&A

import { useState, useEffect, useRef } from 'react';
import { callGemini }          from '../services/gemini';
import { getFallbackResponse } from '../services/chatFallback';
import { getSensorData }       from '../services/api';

// Builds the system context prompt with sensor readings
function buildPrompt(t, h, m, userMsg) {
  const ctx = (t && t !== '—')
    ? `Current sensor readings: Temperature=${t}°C, Humidity=${h}%, Soil Moisture=${m}%. `
    : '';
  return (
    `You are AgriSense AI, an expert agriculture assistant for Indian farmers. ${ctx}` +
    `Answer farming questions in simple, clear English. Be practical and concise. ` +
    `Support Hindi questions too. Keep replies under 200 words.\n\nFarmer: ${userMsg}`
  );
}

export default function FloatingChat() {
  const [isOpen,   setIsOpen]   = useState(false);
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [sensor,   setSensor]   = useState({ t: '—', h: '—', m: '—' });
  const [hasUnread, setHasUnread] = useState(false);

  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);

  // Fetch latest sensor reading for context
  useEffect(() => {
    getSensorData(1)
      .then(data => {
        if (Array.isArray(data) && data[0]) {
          const r = data[0];
          setSensor({
            t: r.temperature ?? '—',
            h: r.humidity    ?? '—',
            m: r.moisture ?? r.soil ?? '—',
          });
        }
      })
      .catch(() => {});
  }, []);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      // Try Gemini first
      const reply = await callGemini(buildPrompt(sensor.t, sensor.h, sensor.m, text));
      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    } catch {
      // Gemini unavailable → fallback to local Q&A
      const fallback = getFallbackResponse(text);
      setMessages(prev => [...prev, { role: 'ai', text: fallback }]);
    } finally {
      setLoading(false);
      // Show unread badge if chat is closed
      if (!isOpen) setHasUnread(true);
    }
  };

  return (
    <>
      {/* ── Chat window ──────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-[340px] sm:w-[380px] flex flex-col rounded-2xl shadow-2xl border border-agri-frost overflow-hidden"
          style={{ height: '480px' }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-agri-primary text-white shrink-0">
            <span className="text-2xl">🤖</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm leading-none">AgriSense AI</p>
              <p className="text-xs text-agri-snow/70 mt-0.5 truncate">
                {sensor.t !== '—'
                  ? `🌡️ ${sensor.t}°C · 💧 ${sensor.h}% · 🌱 ${sensor.m}%`
                  : 'Smart Farming Assistant'}
              </p>
            </div>
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors ml-1"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-white">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 text-xs text-center space-y-2 px-4">
                <span className="text-4xl">🌾</span>
                <p className="font-semibold text-gray-500">Ask me anything!</p>
                <div className="space-y-1 w-full">
                  {[
                    'Best crops for winter season?',
                    'My soil moisture is too low',
                    'How much urea for wheat?',
                    'How to prevent fungal diseases?',
                  ].map(q => (
                    <button
                      key={q}
                      onClick={() => { setInput(q); inputRef.current?.focus(); }}
                      className="w-full text-left text-xs px-3 py-1.5 rounded-lg bg-agri-snow border border-agri-frost hover:bg-agri-frost transition-colors text-agri-dark"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-1`}>
                {msg.role === 'ai' && <span className="text-base shrink-0 mb-0.5">🤖</span>}
                <div
                  className={`max-w-[82%] px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-agri-primary text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm border border-gray-200'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-end gap-1">
                <span className="text-base">🤖</span>
                <div className="bg-gray-100 border border-gray-200 rounded-2xl rounded-bl-sm px-3 py-2">
                  <div className="flex gap-1 items-center">
                    {[0, 150, 300].map(d => (
                      <span key={d} className="w-1.5 h-1.5 bg-agri-medium rounded-full animate-bounce"
                        style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 px-3 py-2 border-t border-agri-frost bg-white shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && handleSend()}
              placeholder="Ask about crops, fertilizers..."
              disabled={loading}
              className="flex-1 rounded-xl border border-agri-frost px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-agri-medium disabled:opacity-60"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-3 py-2 rounded-xl bg-agri-primary text-white text-xs font-bold hover:bg-agri-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* ── Toggle button ─────────────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={isOpen ? 'Close AI chat' : 'Open AI chat'}
        className={`fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
          isOpen
            ? 'bg-gray-600 text-white rotate-0'
            : 'bg-agri-primary text-white hover:bg-agri-medium'
        }`}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <span>🤖</span>
        )}

        {/* Unread badge */}
        {hasUnread && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold animate-bounce">
            !
          </span>
        )}
      </button>
    </>
  );
}
