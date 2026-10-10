# SmartStay AI Integration Guide

This guide explains how to connect the AI chatbot system with the Hotel Booking System.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
│                     localhost:5173                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Chatbot Component (Emotion-Adaptive UI)                │    │
│  │  - Floating chat widget                                  │    │
│  │  - Sentiment-based theming                               │    │
│  │  - Crisis mode detection                                 │    │
│  └─────────────────────────────────────────────────────────┘    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js/Express)                     │
│                     localhost:3000                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  AI Routes (/api/ai/*)                                   │    │
│  │  - /api/ai/chat      - Main chat endpoint                │    │
│  │  - /api/ai/negotiate - Price negotiation                 │    │
│  │  - /api/ai/sentiment - Sentiment analysis                │    │
│  │  - /api/ai/recommend - GraphRAG recommendations          │    │
│  │  - /api/ai/health    - Health check                      │    │
│  └─────────────────────────────────────────────────────────┘    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI SERVICE (Python/FastAPI)                   │
│                     localhost:8000                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  AI Agents:                                              │    │
│  │  • NegotiatorAgent - Dynamic pricing with game theory    │    │
│  │  • SentimentAnalyzer - Emotion detection & crisis mode   │    │
│  │  • KnowledgeGraph - GraphRAG for recommendations         │    │
│  │  • ChromaDB - Vector database for RAG                    │    │
│  │  • Ollama/LLama2 - Local LLM for responses               │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Prerequisites

1. **Node.js** (v18+) - for backend and frontend
2. **Python** (3.10+) - for AI service
3. **Ollama** - for running LLaMA 2 locally

## Setup Instructions

### Step 1: Install Ollama and LLaMA 2

```bash
# Windows: Download from https://ollama.ai/download
# After installing, pull the model:
ollama pull llama2

# Start Ollama service (runs in background)
ollama serve
```

### Step 2: Set up Python AI Service

```bash
cd D:\RAG\langchain-rag-tutorial

# Create virtual environment (if not exists)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install "unstructured[md]"

# Rebuild the knowledge base (important!)
python rebuild_database.py

# Start the AI API server
python api_server.py
```

The AI service will run on **http://localhost:8000**

### Step 3: Set up Node.js Backend

```bash
cd "D:\Hotel Booking System\Hotel_Booking_System\server"

# Install dependencies
npm install

# Add AI_API_URL to .env (optional, defaults to localhost:8000)
# AI_API_URL=http://localhost:8000

# Start the server
npm run server
```

The backend will run on **http://localhost:3000**

### Step 4: Set up React Frontend

```bash
cd "D:\Hotel Booking System\Hotel_Booking_System\client"

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The frontend will run on **http://localhost:5173**

## API Endpoints

### Chat Endpoint
```
POST /api/ai/chat
Body: {
  "message": "Can I get a deluxe room for $60?",
  "userId": "user_123",
  "loyaltyStatus": "returning",
  "sessionId": "session_abc"
}

Response: {
  "success": true,
  "response": "AI response text...",
  "sentiment": "neutral",
  "sentimentScore": 0.5,
  "intent": "negotiation",
  "isCrisisMode": false,
  "negotiationData": { ... }
}
```

### Negotiate Endpoint
```
POST /api/ai/negotiate
Body: {
  "roomType": "deluxe",
  "guestOffer": 60,
  "loyaltyStatus": "returning"
}
```

### Sentiment Endpoint
```
POST /api/ai/sentiment
Body: {
  "text": "The room was terrible and dirty!"
}
```

### Recommendations Endpoint
```
POST /api/ai/recommend
Body: {
  "query": "romantic dinner",
  "preferences": {
    "romantic": true,
    "cuisine": ["sri_lankan"]
  }
}
```

## Features

### 1. Emotion-Adaptive UI
The chatbot UI changes based on detected guest emotion:
- 😊 **Happy** (Green theme) - Guest is satisfied
- 🤖 **Neutral** (Blue theme) - Standard interaction
- 😟 **Negative** (Amber theme) - Guest has concerns
- 🚨 **Angry/Crisis** (Red/Dark theme) - Priority support mode

### 2. AI Negotiator
Dynamic pricing based on:
- Current occupancy rate
- Guest loyalty status
- Room availability
- Season (low/peak)

### 3. GraphRAG Recommendations
Smart recommendations for:
- Local restaurants
- Hiking trails (Ella Rock, Little Adam's Peak)
- Attractions (Nine Arch Bridge, Ravana Falls)
- On-site experiences (Cooking class)

### 4. Sentiment-Aware Responses
Adapts response style based on:
- Detected emotion
- Issue severity
- Complaint detection

## Knowledge Base

The AI uses these documents in `data/docs/`:
- `hotel_info.md` - Hotel details, rooms, amenities
- `pricing_policy.md` - Pricing rules, discounts
- `compensation_policy.md` - Issue resolution
- `occupancy_current.md` - Current availability
- `experiences.md` - Activities and attractions

To update the knowledge base:
1. Edit the markdown files in `data/docs/`
2. Run `python rebuild_database.py`
3. Restart the AI server

## Troubleshooting

### "AI service unavailable"
- Check if Python API is running: `python api_server.py`
- Check if Ollama is running: `ollama serve`
- Verify port 8000 is not in use

### "LLM not responding"
- Pull the model: `ollama pull llama2`
- Restart Ollama: Stop and run `ollama serve`

### "Chatbot shows offline"
- Check backend health: `curl http://localhost:3000/api/ai/health`
- Check AI health: `curl http://localhost:8000/`

## Team Member Contributions

| Member | Component | AI/ML Contribution |
|--------|-----------|-------------------|
| IT24104118 | User Management | Data Collection & UI |
| IT24100738 | Hotel Management | Storage & Indexing |
| IT23286146 | Room Inventory | Data Preprocessing |
| IT24102954 | Smart Booking | Feature Engineering |
| IT24101566 | Review & Feedback | Inference (Retrieval) |
| IT24103124 | Payment Gateway | Generation (LLM) |
