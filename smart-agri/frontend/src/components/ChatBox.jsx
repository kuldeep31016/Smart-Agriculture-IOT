// ChatBox: AI Farmer Chatbot component
// Supports free-form Q&A in English and Hindi

import { useEffect, useRef } from 'react';

export default function ChatBox({ messages, input, onInputChange, onSend, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-[2rem] border border-gray-100/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-5 bg-[#1a472a] border-b border-[#112a1f] shrink-0">
        <div className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/20">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a2 2 0 0 1 2 2c-.01.59.35 1.13.9 1.34l.87.32a2.03 2.03 0 0 0 2.21-.49l.66-.66a2 2 0 0 1 2.83 0l2.83 2.83a2 2 0 0 1 0 2.83l-.66.66a2.03 2.03 0 0 0-.49 2.21l.32.87c.21.55.75.91 1.34.9a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2c-.59-.01-1.13.35-1.34.9l-.32.87a2.03 2.03 0 0 0 .49 2.21l.66.66a2 2 0 0 1 0 2.83l-2.83-2.83a2 2 0 0 1-2.83 0l-.66-.66a2.03 2.03 0 0 0-2.21-.49l-.87.32c-.55.21-.91.75-.9 1.34a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2c.01-.59-.35-1.13-.9-1.34l-.87-.32a2.03 2.03 0 0 0-2.21.49l-.66.66a2 2 0 0 1-2.83 0l-2.83-2.83a2 2 0 0 1 0-2.83l.66-.66a2.03 2.03 0 0 0 .49-2.21l-.32-.87C3.35 15.13 2.81 14.77 2.2 14.78a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2c.59.01 1.13-.35 1.34-.9l.32-.87a2.03 2.03 0 0 0-.49-2.21l-.66-.66a2 2 0 0 1 0-2.83l2.83-2.83a2 2 0 0 1 2.83 0l.66.66a2.03 2.03 0 0 0 2.21.49l.87-.32c.55-.21.91-.75.9-1.34a2 2 0 0 1 2-2h4z" /><circle cx="12" cy="12" r="3" /></svg>
        </div>
        <div>
          <p className="font-bold text-white tracking-tight text-[15px]">AgriSense Intelligence</p>
          <p className="text-[11px] font-semibold text-[#fde047] uppercase tracking-widest mt-0.5 flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#fde047] rounded-full animate-pulse shadow-[0_0_8px_#fde047]"></span> Systems Online</p>
        </div>
        {loading && (
          <div className="ml-auto flex items-center justify-center p-3">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#fafafa]">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-600">Ask your digital consultant</p>
              <p className="text-xs mt-1">e.g. "My soil is too dry, what should I do?"</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-[#f0f7f4] text-[#1a472a] flex items-center justify-center shrink-0 mr-3 mt-1 shadow-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
              </div>
            )}
            <div
              className={`max-w-[78%] px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${msg.role === 'user'
                ? 'bg-[#1a472a] text-white rounded-br-none'
                : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start items-center">
            <div className="w-8 h-8 rounded-full bg-[#f0f7f4] text-[#1a472a] flex items-center justify-center shrink-0 mr-3 shadow-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
            </div>
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-none px-5 py-4">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-50 flex gap-3 pb-6">
        <input
          type="text"
          value={input}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !loading && input.trim() && onSend()}
          placeholder="Type your question here to ask the chatbot..."
          disabled={loading}
          className="flex-1 rounded-full bg-gray-50 border-2 border-gray-200 px-6 py-4 text-[15px] font-medium text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1a472a] focus:bg-white transition-all disabled:opacity-60 shadow-inner"
        />
        <button
          onClick={onSend}
          disabled={loading || !input.trim()}
          className="w-14 h-14 rounded-full bg-[#fde047] text-gray-900 flex items-center justify-center hover:bg-[#1a472a] hover:text-white transition-all disabled:opacity-50 disabled:hover:bg-[#fde047] disabled:hover:text-gray-900 shadow-sm"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-0.5"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
        </button>
      </div>
    </div>
  );
}
