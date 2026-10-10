# SmartStay AI Chatbot - LangGraph Workflow

## Overview

AI-powered chatbot for Cloudy Hill Cottage using LangGraph for multi-turn conversations.

## Architecture

```
[User Input]
     |
     v
+-------------------+     +-------------------+     +-------------------+
| Sentiment Analysis| --> | Intent Detection  | --> |  Handler Nodes    |
| (Emotion detect)  |     | (Route messages)  |     |  - Negotiation    |
+-------------------+     +-------------------+     |  - Complaint      |
                                                    |  - Recommendation |
                                                    |  - General Info   |
                                                    +-------------------+
                                                           |
                                                           v
                                                    [Response Output]
```

## Technology Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express, MongoDB |
| AI Service | Python, FastAPI, LangGraph, LangChain |
| LLM | Ollama (llama2) |
| Vector DB | ChromaDB |
| Embeddings | HuggingFace (MiniLM-L6-v2) |

## AI Agents

### 1. Sentiment Analyzer
- Detects guest emotional state
- Categories: positive, neutral, negative, angry
- Triggers crisis mode for severe issues

### 2. Negotiator Agent  
- Game Theory based pricing
- Occupancy-aware discounts
- Multi-turn negotiation with state

### 3. Knowledge Graph (GraphRAG)
- Local recommendations
- Restaurants, activities, services
- Distance and preference-based queries

## Theoretical Foundations

1. **Game Theory** - Dynamic pricing negotiation
2. **Affective Computing** - Emotion-aware responses
3. **HCI Principles** - Adaptive UI feedback
4. **RAG** - Knowledge retrieval from documents

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/chat | POST | Main chat with LangGraph |
| /api/negotiate | POST | Direct price negotiation |
| /api/sentiment | POST | Sentiment analysis |
| /api/recommend | POST | GraphRAG recommendations |
| /api/occupancy | GET | Current occupancy data |

## Setup

1. Install Ollama and pull llama2
2. Run: python api_server.py (port 8000)
3. Start Node.js backend (port 3000)
4. Start React frontend (port 5173)

## Files

- api_server.py - FastAPI server
- langgraph_workflow.py - State machine
- negotiator_agent.py - Pricing agent
- sentiment_agent.py - Emotion detection
- graphrag_engine.py - Knowledge graph
