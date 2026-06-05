const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const app = express();

// Enable CORS so your React frontend can communicate with this backend
app.use(cors());
app.use(express.json());

// Initialize the Gemini client using the key from your .env file
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// This endpoint matches your frontend ENDPOINTS.bot.chat path
app.post('/api/bot/chat', async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    // Call the Gemini API and give Budi his persona
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are Budi, a highly motivating and knowledgeable fitness AI assistant for the BudiFit app. 
                 The user says: "${message}"`,
    });

    // Format the response to match your SendMessageResponse interface
    const reply = {
      id: Date.now().toString(),
      role: "assistant",
      content: response.text,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json({ reply });

  } catch (error) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Budi backend running on port ${PORT}`);
});