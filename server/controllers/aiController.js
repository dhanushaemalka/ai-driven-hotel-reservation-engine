/**
 * AI Controller - Proxy to SmartStay AI Python API (LangGraph v2.0)
 * Handles communication between Node.js backend and Python AI agents
 * 
 * Features:
 * - Multi-turn stateful conversations via LangGraph
 * - Sentiment-aware responses (Affective Computing)
 * - Dynamic price negotiation (Game Theory)
 * - GraphRAG recommendations (Knowledge Graph)
 * - Crisis detection & human escalation (HCI)
 */

const AI_API_URL = process.env.AI_API_URL || 'http://localhost:8000';

/**
 * Chat with AI assistant (LangGraph Workflow)
 * POST /api/ai/chat
 * 
 * The LangGraph workflow handles:
 * 1. Sentiment Analysis → Emotional context detection
 * 2. Intent Detection → Route to appropriate handler
 * 3. Handler Nodes → Negotiation, Complaint, Recommendation, or General Info
 * 4. Response Formatting → Emotion-adaptive output
 */
export const chatWithAI = async (req, res) => {
  try {
    const { message, userId, loyaltyStatus, sessionId } = req.body;

    if (!message) {
      return res.json({ success: false, message: 'Message is required' });
    }

    const response = await fetch(`${AI_API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        user_id: userId,
        loyalty_status: loyaltyStatus || 'none',
        session_id: sessionId, // Enables multi-turn conversation state
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Transform LangGraph response to frontend format
    res.json({
      success: true,
      response: data.response,
      sentiment: data.sentiment,
      sentimentScore: data.sentiment_score,
      intent: data.intent,
      isCrisisMode: data.is_crisis_mode,
      needsHumanEscalation: data.needs_human_escalation || false,
      negotiationData: data.negotiation_data,
      metadata: data.metadata, // Additional context from workflow
    });
  } catch (error) {
    console.error('AI Chat Error:', error.message);
    res.json({
      success: false,
      message: 'AI service is currently unavailable. Please try again later.',
      fallbackResponse: "I apologize, but I'm having trouble connecting right now. Please contact us directly at +94 77 123 4567 or email cloudyhill01@gmail.com for assistance.",
    });
  }
};

/**
 * Get price negotiation
 * POST /api/ai/negotiate
 */
export const negotiatePrice = async (req, res) => {
  try {
    const { roomType, guestOffer, loyaltyStatus } = req.body;

    if (!roomType || !guestOffer) {
      return res.json({ success: false, message: 'Room type and offer are required' });
    }

    const response = await fetch(`${AI_API_URL}/api/negotiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        room_type: roomType,
        guest_offer: guestOffer,
        loyalty_status: loyaltyStatus || 'none',
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API responded with status: ${response.status}`);
    }

    const data = await response.json();

    res.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error('Negotiation Error:', error.message);
    res.json({
      success: false,
      message: 'Negotiation service unavailable',
    });
  }
};

/**
 * Analyze sentiment
 * POST /api/ai/sentiment
 */
export const analyzeSentiment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.json({ success: false, message: 'Text is required' });
    }

    const response = await fetch(`${AI_API_URL}/api/sentiment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`AI API responded with status: ${response.status}`);
    }

    const data = await response.json();

    res.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error('Sentiment Analysis Error:', error.message);
    res.json({
      success: false,
      message: 'Sentiment analysis unavailable',
    });
  }
};

/**
 * Get recommendations
 * POST /api/ai/recommend
 */
export const getRecommendations = async (req, res) => {
  try {
    const { query, preferences } = req.body;

    const response = await fetch(`${AI_API_URL}/api/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query || '',
        preferences: preferences || {},
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API responded with status: ${response.status}`);
    }

    const data = await response.json();

    res.json({
      success: true,
      recommendations: data.recommendations,
    });
  } catch (error) {
    console.error('Recommendations Error:', error.message);
    res.json({
      success: false,
      message: 'Recommendations service unavailable',
    });
  }
};

/**
 * Get current occupancy status
 * GET /api/ai/occupancy
 */
export const getOccupancy = async (req, res) => {
  try {
    const response = await fetch(`${AI_API_URL}/api/occupancy`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`AI API responded with status: ${response.status}`);
    }

    const data = await response.json();

    res.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error('Occupancy Error:', error.message);
    res.json({
      success: false,
      message: 'Occupancy data unavailable',
    });
  }
};

/**
 * Health check for AI service
 * GET /api/ai/health
 */
export const checkAIHealth = async (req, res) => {
  try {
    const response = await fetch(`${AI_API_URL}/`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('AI service not responding');
    }

    const data = await response.json();

    res.json({
      success: true,
      status: 'online',
      aiService: data,
    });
  } catch (error) {
    res.json({
      success: false,
      status: 'offline',
      message: 'AI service is not available. Make sure the Python API is running on port 8000.',
    });
  }
};
