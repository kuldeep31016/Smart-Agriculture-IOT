// ChatBox: AI Farmer Chatbot component
// Supports free-form Q&A in English and Hindi

import { useEffect, useRef } from 'react';

export default function ChatBox({ messages, input, onInputChange, onSend, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-2xl border border-agri-frost shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 bg-agri-primary text-white">
        <span className="text-2xl">🤖</span>
        <div>
          <p className="font-bold leading-none">AgriSense AI Chatbot</p>
          <p className="text-xs text-agri-snow/80 mt-0.5">Ask anything — English or Hindi</p>
        </div>
        {loading && (
          <div className="ml-auto flex items-center gap-2 text-xs text-agri-snow/80">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Thinking...
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm space-y-2">
            <span className="text-4xl">💬</span>
            <p>Ask me anything about your farm!</p>
            <p className="text-xs">e.g. "My soil is too dry, what should I do?"</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'ai' && (
              <span className="text-xl mr-2 shrink-0 mt-1">🤖</span>
            )}
            <div
              className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
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
          <div className="flex justify-start">
            <span className="text-xl mr-2">🤖</span>
            <div className="bg-gray-100 border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-agri-medium rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-agri-medium rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-agri-medium rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 p-3 border-t border-agri-frost bg-agri-white/50">
        <input
          type="text"
          value={input}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !loading && input.trim() && onSend()}
          placeholder="Ask anything about your farm..."
          disabled={loading}
          className="flex-1 rounded-xl border border-agri-frost px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agri-medium bg-white disabled:opacity-60"
        />
        <button
          onClick={onSend}
          disabled={loading || !input.trim()}
          className="px-4 py-2 rounded-xl bg-agri-primary text-white font-semibold text-sm hover:bg-agri-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
}
