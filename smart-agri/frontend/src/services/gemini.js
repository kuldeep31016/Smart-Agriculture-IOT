// Gemini 2.0 Flash — AI / Deep Learning Layer
// Problem Statement 7: Deep Learning component
// Direct frontend call using VITE_GEMINI_API_KEY, with backend proxy fallback

import { callGeminiViaBackend } from './api';

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// System-level persona — injected into every request so Gemini always behaves consistently
const SYSTEM_INSTRUCTION =
  'You are AgriSense AI, a professional agricultural advisor for Indian farmers. ' +
  'Respond in a clear, formal, and informative tone — like a knowledgeable consultant. ' +
  'Do not use excessive emojis. Use plain text with numbered or bullet-point lists where helpful. ' +
  'Keep answers practical, concise, and specific to Indian agriculture. ' +
  'If the user writes in Hindi or uses Hindi words, respond in simple English but acknowledge their language.';

export async function callGemini(prompt) {
  // Use frontend key directly if configured
  if (GEMINI_KEY && GEMINI_KEY !== 'your_gemini_api_key_here') {
    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_KEY}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // System instruction keeps persona consistent across all calls
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }],
        },
        contents: [
          { role: 'user', parts: [{ text: prompt }] },
        ],
        generationConfig: {
          temperature:     0.7,
          maxOutputTokens: 1024,
          topP:            0.9,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      // Surface a clean error so callers can decide to fall back
      throw new Error(err?.error?.message || `Gemini API error (${response.status})`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from Gemini');
    return text;
  }

  // No frontend key → route through backend proxy (backend uses GEMINI_API_KEY env var)
  return callGeminiViaBackend(prompt);
}
