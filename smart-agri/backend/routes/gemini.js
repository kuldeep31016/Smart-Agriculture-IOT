// Deep Learning / AI Layer: Google Gemini 2.0 Flash proxy
// Problem Statement 7: Deep Learning component
// Proxies AI requests from the React frontend to avoid CORS issues
// and keeps the GEMINI_API_KEY on the server side
//
// POST /api/gemini
// Body: { prompt: string }

const express = require('express');
const router  = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
];

async function generateWithModel(model, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const response = await fetch(`${url}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const error = new Error(errData?.error?.message || `Gemini API error (${response.status})`);
    error.status = response.status;
    error.model = model;
    throw error;
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    const error = new Error('Empty response from Gemini');
    error.status = 500;
    error.model = model;
    throw error;
  }

  return text;
}

router.post('/gemini', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'prompt (string) is required in request body' });
    }

    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return res.status(503).json({
        error: 'AI service temporarily unavailable. Configure GEMINI_API_KEY in backend/.env',
      });
    }

    const errors = [];

    for (const model of GEMINI_MODELS) {
      try {
        const text = await generateWithModel(model, prompt);
        return res.json({ response: text, model });
      } catch (error) {
        errors.push({ model: error.model || model, status: error.status || 500, message: error.message });

        // Continue trying other models for quota/rate-limit/service failures.
        if (error.status && error.status < 500 && error.status !== 429) {
          continue;
        }
      }
    }

    return res.status(503).json({
      error: 'Gemini API unavailable for all configured models',
      details: errors,
    });

  } catch (error) {
    console.error('POST /gemini error:', error);
    res.status(500).json({
      error: 'AI service temporarily unavailable. Please try again.',
    });
  }
});

module.exports = router;
