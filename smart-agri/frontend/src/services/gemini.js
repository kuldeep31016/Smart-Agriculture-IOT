// Gemini AI — AI / Deep Learning Layer
// Problem Statement 7: Deep Learning component
// Prefer backend proxy so the API key stays server-side and model fallback stays centralized.

import { callGeminiViaBackend } from './api';

// System-level persona — injected into every request so Gemini always behaves consistently
const SYSTEM_INSTRUCTION =
  'You are AgriSense AI, a professional agricultural advisor for Indian farmers. ' +
  'Respond in a clear, formal, and informative tone — like a knowledgeable consultant. ' +
  'Do not use excessive emojis. Use plain text with numbered or bullet-point lists where helpful. ' +
  'Keep answers practical, concise, and specific to Indian agriculture. ' +
  'If the user writes in Hindi or uses Hindi words, respond in simple English but acknowledge their language.';

export async function callGemini(prompt) {
  try {
    // Default path: backend proxy. This keeps the API key out of the browser and
    // lets the server retry multiple Gemini models if one is quota-limited.
    return await callGeminiViaBackend(prompt);
  } catch (backendErr) {
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

    // Last-resort local fallback for development if the backend is unavailable.
    if (!geminiKey || geminiKey === 'your_gemini_api_key_here') {
      throw backendErr;
    }

    const response = await fetch(`${geminiUrl}?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }],
        },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          topP: 0.9,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Gemini API error (${response.status})`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from Gemini');
    return text;
  }
}
