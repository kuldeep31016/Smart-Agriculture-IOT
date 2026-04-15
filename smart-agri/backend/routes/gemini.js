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
const GEMINI_URL     = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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

    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature:     0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error:   'Gemini API error',
        details: errData?.error?.message || 'Unknown error',
      });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({ error: 'Empty response from Gemini' });
    }

    res.json({ response: text });

  } catch (error) {
    console.error('POST /gemini error:', error);
    res.status(500).json({
      error: 'AI service temporarily unavailable. Please try again.',
    });
  }
});

module.exports = router;
