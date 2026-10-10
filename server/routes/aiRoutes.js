/**
 * AI Routes - SmartStay AI Integration
 * Routes for chatbot, negotiation, sentiment, and recommendations
 */

import express from 'express';
import {
  chatWithAI,
  negotiatePrice,
  analyzeSentiment,
  getRecommendations,
  getOccupancy,
  checkAIHealth,
} from '../controllers/aiController.js';

const aiRouter = express.Router();

// Chat endpoint - main AI interaction
aiRouter.post('/chat', chatWithAI);

// Price negotiation endpoint
aiRouter.post('/negotiate', negotiatePrice);

// Sentiment analysis endpoint
aiRouter.post('/sentiment', analyzeSentiment);

// Recommendations endpoint (GraphRAG)
aiRouter.post('/recommend', getRecommendations);

// Occupancy status endpoint
aiRouter.get('/occupancy', getOccupancy);

// Health check endpoint
aiRouter.get('/health', checkAIHealth);

export default aiRouter;
