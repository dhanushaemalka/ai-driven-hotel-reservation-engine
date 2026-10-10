"""
LangGraph Workflow for Cloudy Hill Cottage Chatbot
State machine with multi-turn conversation support, sentiment-aware routing,
and persistent negotiation state.

Theoretical Foundations:
- Graph-based State Machines: Explicit control flow with conditional routing
- Affective Computing: Emotion-aware responses and crisis detection
- Game Theory: Multi-turn negotiation with strategy tracking
- Human-Computer Interaction (HCI): Adaptive UI feedback via sentiment signals
"""

from typing import TypedDict, Literal, Annotated, Optional, List, Dict, Any
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
import operator
import re

# Import existing agents
from negotiator_agent import NegotiatorAgent
from sentiment_agent import SentimentAnalyzer
from graphrag_engine import KnowledgeGraph, format_graph_context


# ============================================================================
# STATE DEFINITION
# ============================================================================

class Message(TypedDict):
    """Single message in conversation"""
    role: str  # "user" or "assistant"
    content: str
    sentiment: Optional[str]
    timestamp: Optional[str]


class NegotiationState(TypedDict):
    """Tracks multi-turn negotiation progress"""
    round: int
    room_type: Optional[str]
    initial_offer: Optional[float]
    current_offer: Optional[float]
    counter_offers: List[Dict]
    final_price: Optional[float]
    add_ons: List[str]
    status: str  # "active", "accepted", "rejected", "abandoned"


class ConversationState(TypedDict):
    """
    Main state object that flows through the graph.
    This is the 'memory' of the conversation.
    """
    # === Input ===
    messages: Annotated[List[Message], operator.add]  # Conversation history
    user_input: str
    user_id: Optional[str]
    loyalty_status: str
    session_id: Optional[str]
    
    # === Sentiment Analysis Results ===
    sentiment: str  # "positive", "negative", "neutral", "angry"
    sentiment_score: float
    is_complaint: bool
    severity: str  # "critical", "severe", "moderate", "minor"
    
    # === Intent Detection ===
    intent: str  # "negotiation", "complaint", "recommendation", "booking", "general_info"
    
    # === Negotiation State (persists across turns!) ===
    negotiation: NegotiationState
    
    # === Output ===
    response: str
    is_crisis_mode: bool
    needs_human_escalation: bool
    response_metadata: Dict[str, Any]


# ============================================================================
# GLOBAL INSTANCES (injected at runtime)
# ============================================================================

# These will be set by the API server
db = None
model = None
negotiator: Optional[NegotiatorAgent] = None
sentiment_analyzer: Optional[SentimentAnalyzer] = None
knowledge_graph: Optional[KnowledgeGraph] = None


def initialize_workflow_agents(
    vector_db,
    llm,
    neg_agent: NegotiatorAgent,
    sent_analyzer: SentimentAnalyzer,
    kg: KnowledgeGraph
):
    """Initialize agents for the workflow - called by api_server.py"""
    global db, model, negotiator, sentiment_analyzer, knowledge_graph
    db = vector_db
    model = llm
    negotiator = neg_agent
    sentiment_analyzer = sent_analyzer
    knowledge_graph = kg


# ============================================================================
# NODE FUNCTIONS
# ============================================================================

def analyze_sentiment_node(state: ConversationState) -> Dict:
    """
    Node 1: Analyze sentiment of user input
    This runs FIRST on every message to understand emotional context
    """
    user_input = state["user_input"]
    
    if sentiment_analyzer is None:
        return {
            "sentiment": "neutral",
            "sentiment_score": 0.0,
            "is_complaint": False,
            "severity": "minor"
        }
    
    # Analyze sentiment
    sentiment, score = sentiment_analyzer.analyze_sentiment(user_input)
    is_complaint = sentiment_analyzer.is_complaint(user_input)
    severity = sentiment_analyzer.detect_issue_severity(user_input)
    
    # Determine if crisis mode
    is_crisis = (
        sentiment == "angry" or 
        (is_complaint and severity in ["critical", "severe"])
    )
    
    return {
        "sentiment": sentiment,
        "sentiment_score": score,
        "is_complaint": is_complaint,
        "severity": severity,
        "is_crisis_mode": is_crisis
    }


def detect_intent_node(state: ConversationState) -> Dict:
    """
    Node 2: Detect user intent for routing
    Uses keywords and context to determine what the user wants
    """
    user_input = state["user_input"].lower()
    is_complaint = state.get("is_complaint", False)
    
    # Numeric budget + room/stay language (e.g. "I only have 8000 how can I get a room?")
    # Routes to negotiation without needing an LLM for intent classification
    if re.search(r"\b\d{4,}\b", user_input) and any(
        w in user_input
        for w in (
            "room",
            "suite",
            "stay",
            "book",
            "night",
            "accommodation",
            "cottage",
            "afford",
            "budget",
            "only",
            "pay",
            "lkr",
            "rupees",
        )
    ):
        return {"intent": "negotiation"}
    
    # Check if this is a continuation of negotiation
    negotiation_state = state.get("negotiation", {})
    if negotiation_state.get("status") == "active":
        # Look for price mentions or acceptance/rejection
        if any(word in user_input for word in ["$", "deal", "ok", "fine", "accept", "agree", "yes", "dollars", "lkr"]):
            return {"intent": "negotiation"}
        if any(word in user_input for word in ["no", "too high", "expensive", "forget it", "nevermind"]):
            return {"intent": "negotiation"}
        # Check for numeric offers (e.g., "9000", "how about 9000")
        if re.search(r'\b\d{4,}\b', user_input):
            return {"intent": "negotiation"}
    
    # Check for price offer patterns (even without active negotiation)
    # Patterns like "9000 LKR", "LKR 9000", "how about 9000"
    has_price_offer = bool(re.search(r'\b\d{4,}\s*lkr|\blkr\s*\d{4,}|how about\s*\d+|offer\s*\d+|pay\s*\d+', user_input))
    if has_price_offer:
        return {"intent": "negotiation"}
    
    # Negotiation intent - check for price-related words with room context
    price_words = ["price", "cost", "expensive", "negotiate", "discount", "$", "deal", 
                   "offer", "cheaper", "dollars", "per night", "a night", "budget", 
                   "afford", "how much", "rate", "rates", "lkr", "rupees", "loyalty",
                   "stayed before", "returning", "loyal", "times before"]
    room_words = ["room", "suite", "standard", "deluxe", "family", "cottage", "stay", 
                  "night", "book", "accommodation", "double", "triple"]
    
    has_price_context = any(word in user_input for word in price_words)
    has_room_context = any(word in user_input for word in room_words)
    
    # Also check for patterns like "can I get ... for ..."
    has_offer_pattern = ("for" in user_input and any(c.isdigit() for c in user_input))
    
    if has_price_context and (has_room_context or has_offer_pattern):
        return {"intent": "negotiation"}
    
    # Direct price questions
    if "how much" in user_input or "what's the price" in user_input or "pricing" in user_input:
        return {"intent": "negotiation"}
    
    # Complaint takes priority if flagged
    if is_complaint and state.get("severity") in ["critical", "severe"]:
        return {"intent": "complaint"}
    
    # Recommendation intent
    if any(word in user_input for word in ["restaurant", "dinner", "lunch", "eat", "food", 
                                            "activity", "hike", "visit", "recommend", 
                                            "things to do", "attractions", "where can"]):
        return {"intent": "recommendation"}
    
    # Booking intent
    if any(word in user_input for word in ["book", "reserve", "availability", "check-in", 
                                            "check-out", "available"]):
        return {"intent": "booking"}
    
    # Complaint (lower priority)
    if is_complaint:
        return {"intent": "complaint"}
    
    return {"intent": "general_info"}


def negotiation_node(state: ConversationState) -> Dict:
    """
    Node: Handle price negotiation with STATE PERSISTENCE
    This enables multi-turn negotiations where the bot remembers previous offers
    """
    user_input = state["user_input"]
    loyalty_status = state.get("loyalty_status", "none")
    
    # Get existing negotiation state or initialize
    neg_state = state.get("negotiation", {
        "round": 0,
        "room_type": None,
        "initial_offer": None,
        "current_offer": None,
        "counter_offers": [],
        "final_price": None,
        "add_ons": [],
        "status": "inactive"
    })
    
    # Increment round
    current_round = neg_state.get("round", 0) + 1
    counter_offers = neg_state.get("counter_offers", []).copy()
    
    # Check for abandonment signals
    if any(word in user_input.lower() for word in ["forget it", "nevermind", "cancel", "stop"]):
        return {
            "response": "No problem! If you change your mind about the room, just let me know. Is there anything else I can help you with?",
            "negotiation": {
                **neg_state,
                "status": "abandoned",
                "round": current_round
            },
            "response_metadata": {"negotiation_ended": True, "reason": "user_abandoned"}
        }
    
    # Check for acceptance
    if any(word in user_input.lower() for word in ["ok", "fine", "deal", "accept", "agree", "yes", "book it", "i'll take"]):
        last_offer = counter_offers[-1] if counter_offers else None
        if last_offer and last_offer.get("counter_offer"):
            final_price = last_offer["counter_offer"]
            return {
                "response": f"Wonderful! The {neg_state.get('room_type', 'room')} at LKR {final_price:,.0f}/night is confirmed! Renu and Nalaka are excited to welcome you. Please let us know your check-in date!",
                "negotiation": {
                    **neg_state,
                    "status": "accepted",
                    "final_price": final_price,
                    "round": current_round
                },
                "response_metadata": {"negotiation_ended": True, "final_price": final_price}
            }
    
    # Extract room type and price from user input
    if negotiator is None:
        return {
            "response": "I'm sorry, our pricing system is temporarily unavailable. Please call +94 77 123 4567 for rates.",
            "negotiation": neg_state,
            "response_metadata": {"error": "negotiator_unavailable"}
        }
    
    extracted = negotiator.extract_room_type_and_price(user_input)
    user_lower = user_input.lower()
    
    # Check for long-stay mentions (proactive discount offer)
    nights_match = re.search(r'(\d+)\s*nights?', user_lower)
    num_nights = int(nights_match.group(1)) if nights_match else 1
    
    # Check for price complaint (expensive, high, etc.)
    is_price_complaint = any(word in user_lower for word in ['expensive', 'high', 'costly', 'pricey', 'too much', 'cheaper', 'other places', 'budget'])
    
    # Check for review/recommendation promise (negotiation sweetener)
    has_review_promise = any(phrase in user_lower for phrase in ['review', 'recommend', 'tell my friends', 'bring friends', 'come back', 'return'])
    
    # Check for loyalty/returning customer mentions
    loyalty_keywords = ['stayed before', 'stayed here', 'been here', 'come back', 'returning', 'loyal', 'loyalty', 
                        'regular', 'previous stay', 'last time', 'times before', 'visited before', 'repeat']
    is_loyalty_mention = any(phrase in user_lower for phrase in loyalty_keywords)
    
    # Extract number of previous stays if mentioned
    stays_match = re.search(r'(\d+)\s*times', user_lower)
    num_previous_stays = int(stays_match.group(1)) if stays_match else 0
    
    # Determine loyalty status from context
    if is_loyalty_mention or num_previous_stays > 0:
        if num_previous_stays >= 3:
            loyalty_status = "returning"  # 10% discount
        elif num_previous_stays >= 1 or is_loyalty_mention:
            loyalty_status = "returning"  # 10% discount
    
    # Handle extraction results
    extracted_room = extracted[0] if extracted else None
    extracted_price = extracted[1] if extracted else None
    
    # Use previously discussed room type if not specified in this message
    room_type = extracted_room or neg_state.get("room_type")
    
    if extracted_price is None:
        # No price found - check context
        
        # Loyalty mention - acknowledge and show discounted prices
        if is_loyalty_mention or num_previous_stays > 0:
            discount_percent = 10  # Returning guest discount
            loyalty_msg = f"Welcome back! We truly appreciate your loyalty"
            if num_previous_stays > 0:
                loyalty_msg = f"Wow, {num_previous_stays} stays! You're practically family"
            
            return {
                "response": f"{loyalty_msg} - of course you get a **10% loyalty discount**! 🙏\n\n**Your special returning guest rates:**\n• **Standard Room** - ~~LKR 8,500~~ → **LKR {int(8500 * 0.9):,}/night**\n• **Deluxe Room** - ~~LKR 12,500~~ → **LKR {int(12500 * 0.9):,}/night**\n• **Family Suite** - ~~LKR 18,000~~ → **LKR {int(18000 * 0.9):,}/night**\n• **Honeymoon Suite** - ~~LKR 25,000~~ → **LKR {int(25000 * 0.9):,}/night**\n\nRenu and Nalaka will be so happy to see you again! Which room would you like?",
                "negotiation": {**neg_state, "round": current_round, "status": "active"},
                "loyalty_status": "returning",
                "response_metadata": {"loyalty_detected": True, "discount_applied": discount_percent, "previous_stays": num_previous_stays}
            }
        
        # Price complaint - acknowledge and justify value
        if is_price_complaint:
            return {
                "response": "I completely understand - budget matters! Let me explain why Cloudy Hill Cottage offers great value:\n\n**What's included in our rates:**\n- Complimentary Sri Lankan breakfast\n- Stunning Ella Gap views\n- Free hiking maps & local tips\n- Warm hospitality from Renu & Nalaka\n\n**Our flexible pricing:**\n• **Standard Room** - LKR 8,500/night (we can discuss!)\n• **Deluxe Room** - LKR 12,500/night\n• **Family Suite** - LKR 18,000/night\n\n**Tell me your budget and preferred room, and I'll see what I can do!** We're flexible, especially for longer stays.",
                "negotiation": {**neg_state, "round": current_round, "status": "active"},
                "response_metadata": {"price_complaint_detected": True}
            }
        
        # Long-stay discount logic
        if num_nights >= 5:
            discount_percent = 15 if num_nights >= 7 else 10
            return {
                "response": f"Great news! For a {num_nights}-night stay, we offer a **{discount_percent}% long-stay discount**!\n\nWith the discount:\n• **Standard Room** - LKR {int(8500 * (1 - discount_percent/100)):,}/night\n• **Deluxe Room** - LKR {int(12500 * (1 - discount_percent/100)):,}/night\n• **Family Suite** - LKR {int(18000 * (1 - discount_percent/100)):,}/night\n\nWhich room would you like, and what's your budget?",
                "negotiation": {**neg_state, "round": current_round, "status": "active"},
                "response_metadata": {"long_stay_nights": num_nights, "discount_offered": discount_percent}
            }
        elif num_nights >= 3:
            return {
                "response": f"For a {num_nights}-night stay, we can definitely work out a good rate!\n\nOur rooms:\n• **Standard Room** - from LKR 8,500/night\n• **Deluxe Room** - from LKR 12,500/night\n• **Family Suite** - from LKR 18,000/night\n\nWhich room interests you? I can offer a special rate for your {num_nights}-night stay!",
                "negotiation": {**neg_state, "round": current_round, "status": "active"},
                "response_metadata": {"nights_mentioned": num_nights}
            }
        elif room_type:
            return {
                "response": f"For the {room_type} room, what price per night did you have in mind?",
                "negotiation": {**neg_state, "round": current_round, "status": "active"},
                "response_metadata": {"awaiting": "price_offer"}
            }
        return {
            "response": "I'd be happy to discuss room pricing! We have:\n\n• **Standard Room** - from LKR 8,500/night (mountain view)\n• **Deluxe Room** - from LKR 12,500/night (sunrise view + balcony)\n• **Family Suite** - from LKR 18,000/night (extra space)\n• **Honeymoon Suite** - from LKR 25,000/night (jacuzzi + private garden)\n\nWhich room interests you, and what's your budget in LKR?",
            "negotiation": {**neg_state, "round": current_round, "status": "active"},
            "response_metadata": {"awaiting": "room_and_price"}
        }
    
    # We have a price - use extracted values
    guest_offer = extracted_price
    
    # If no room type yet, ask for it
    if not room_type:
        return {
            "response": f"Thanks for your offer of LKR {guest_offer:,.0f}! Which room type would you like at that rate?\n\n• **Standard Room** - starts at LKR 8,500/night\n• **Deluxe Room** - starts at LKR 12,500/night\n• **Family Suite** - starts at LKR 18,000/night\n\nLet me know and I'll see what I can do!",
            "negotiation": {**neg_state, "round": current_round, "current_offer": guest_offer, "status": "active"},
            "response_metadata": {"awaiting": "room_type", "price_received": guest_offer}
        }
    
    # Update negotiation state
    if neg_state.get("initial_offer") is None:
        neg_state["initial_offer"] = guest_offer
    neg_state["current_offer"] = guest_offer
    neg_state["room_type"] = room_type
    neg_state["status"] = "active"
    
    # Apply review promise as a "referral" bonus if no other loyalty status
    effective_loyalty = loyalty_status
    if has_review_promise and loyalty_status == "none":
        effective_loyalty = "referral"  # 5% bonus for promise to review/recommend
    
    # Get negotiation result from agent
    result = negotiator.negotiate_price(room_type, guest_offer, effective_loyalty)
    
    # Track this round
    counter_offers.append({
        "round": current_round,
        "guest_offer": guest_offer,
        "decision": result["decision"],
        "counter_offer": result.get("counter_price", result.get("final_price")),
        "add_ons": result.get("add_ons", [])
    })
    
    # Generate response using LLM if available
    response_text = result["message"]
    
    if model is not None:
        try:
            system_prompt = negotiator.generate_system_prompt({
                "room_type": room_type,
                "base_price": negotiator.base_prices.get(room_type),
                "minimum_price": negotiator.minimum_prices.get(room_type),
                "occupancy_tier": result.get("occupancy_tier", 1),
                "occupancy_rate": result.get("occupancy_rate", 0.25)
            })
            
            prompt = f"""{system_prompt}

NEGOTIATION ROUND: {current_round}
DECISION: {result['decision'].upper()}
Guest's Current Offer: ${guest_offer}
Room: {room_type}

Negotiation Result: {result['message']}

Respond naturally as if talking to a guest. Be warm and personable. Keep it conversational - 2-3 sentences max."""
            
            response_text = model.invoke(prompt)
        except Exception as e:
            # Fall back to template response
            response_text = result["message"]
    
    # Determine final state
    final_status = "active"
    final_price = None
    add_ons = result.get("add_ons", [])
    
    if result["decision"] == "accept":
        final_status = "accepted"
        final_price = result.get("final_price")
        # Add thanks for review promise if applicable
        if has_review_promise:
            response_text = response_text.rstrip('!.') + " - and we really appreciate you promising to leave a review! 🙏"
    elif result["decision"] == "reject" and current_round >= 3:
        final_status = "rejected"
    
    return {
        "response": response_text,
        "negotiation": {
            "round": current_round,
            "room_type": room_type,
            "initial_offer": neg_state.get("initial_offer"),
            "current_offer": guest_offer,
            "counter_offers": counter_offers,
            "final_price": final_price,
            "add_ons": add_ons,
            "status": final_status
        },
        "response_metadata": {
            "decision": result["decision"],
            "occupancy_rate": result.get("occupancy_rate"),
            "loyalty_applied": loyalty_status != "none"
        }
    }


def complaint_node(state: ConversationState) -> Dict:
    """
    Node: Handle complaints with emotional intelligence
    Escalates to human for critical issues
    """
    user_input = state["user_input"]
    sentiment = state.get("sentiment", "neutral")
    severity = state.get("severity", "minor")
    is_crisis = state.get("is_crisis_mode", False)
    
    # Check if needs human escalation
    needs_human = (
        severity == "critical" or 
        (sentiment == "angry" and severity == "severe")
    )
    
    if needs_human:
        return {
            "response": """I sincerely apologize for this situation. This is clearly unacceptable and I want to help resolve this immediately.

I'm connecting you with Nalaka, our host, who will call you within the hour. In the meantime:

📞 **Direct Line**: +94 71 593 4715 (Nalaka)
📞 **Alternative**: +94 77 123 4567

Please know that we take this very seriously and will make this right. Can you share the best number to reach you?""",
            "needs_human_escalation": True,
            "response_metadata": {
                "escalation_reason": severity,
                "sentiment_at_escalation": sentiment
            }
        }
    
    # Generate empathetic response
    if sentiment_analyzer is None or model is None:
        return {
            "response": "I'm sorry to hear about this issue. Please contact Renu or Nalaka directly at +94 77 123 4567 and they'll help resolve this.",
            "needs_human_escalation": False,
            "response_metadata": {"fallback": True}
        }
    
    system_prompt = sentiment_analyzer.generate_system_prompt(sentiment, True, severity)
    
    # Get relevant policies from RAG
    search_query = sentiment_analyzer.get_rag_search_context(sentiment, True, severity)
    policy_context = ""
    
    if db is not None:
        try:
            policy_results = db.similarity_search(search_query, k=3)
            policy_context = "\n\n".join([doc.page_content for doc in policy_results]) if policy_results else ""
        except:
            pass
    
    prompt = f"""{system_prompt}

GUEST CONTEXT:
- Emotional State: {sentiment.upper()}
- Issue Severity: {severity.upper()}
- Guest Statement: "{user_input}"

AVAILABLE POLICIES:
{policy_context}

Respond with empathy and offer concrete solutions. Remember this is Cloudy Hill Cottage in Ella, Sri Lanka, run by Renu & Nalaka. Keep response concise but caring - 3-4 sentences."""

    try:
        response_text = model.invoke(prompt)
    except:
        response_text = f"I'm truly sorry about this. Let me help make this right. Please speak with Renu or Nalaka at +94 77 123 4567 - they'll take care of you personally."
    
    return {
        "response": response_text,
        "needs_human_escalation": False,
        "response_metadata": {
            "complaint_severity": severity,
            "sentiment": sentiment
        }
    }


def recommendation_node(state: ConversationState) -> Dict:
    """
    Node: Handle recommendations using GraphRAG
    Queries the knowledge graph for contextual suggestions
    """
    user_input = state["user_input"]
    user_lower = user_input.lower()
    
    if knowledge_graph is None:
        return {
            "response": "I'd love to help with recommendations! Ella has amazing attractions like Ella Rock, Nine Arch Bridge, and Little Adam's Peak. Ask Renu for her personal favorites!",
            "response_metadata": {"fallback": True}
        }
    
    # Extract preferences from user input
    preferences = {
        "cuisine": [],
        "romantic": "romantic" in user_lower or "date" in user_lower or "honeymoon" in user_lower,
        "max_distance_km": 5.0
    }
    
    # Extract cuisine preferences
    cuisine_keywords = {
        "sri_lankan": ["sri lankan", "local", "traditional", "curry", "rice"],
        "western": ["western", "international", "burger", "pizza", "pasta"],
        "vegetarian": ["vegetarian", "vegan", "veggie"]
    }
    
    for cuisine_type, keywords in cuisine_keywords.items():
        if any(k in user_lower for k in keywords):
            preferences["cuisine"].append(cuisine_type)
    
    # Check for activity type
    if any(word in user_lower for word in ["hike", "hiking", "trek", "walk"]):
        preferences["activity_type"] = "hiking"
    elif any(word in user_lower for word in ["view", "photo", "scenic", "sightseeing"]):
        preferences["activity_type"] = "sightseeing"
    
    # Query knowledge graph
    recommendations = knowledge_graph.query_itinerary(preferences)
    graph_context = format_graph_context(recommendations, preferences)
    
    # Generate natural response with LLM
    if model is None:
        return {
            "response": graph_context,
            "response_metadata": {"source": "graph_only"}
        }
    
    prompt = f"""You are a knowledgeable local guide at Cloudy Hill Cottage in Ella, Sri Lanka.

Guest Request: "{user_input}"

{graph_context}

Provide personalized recommendations. Include:
1. Your top pick and why
2. Distance/how to get there (walking or tuk-tuk)
3. Best time to go
4. One insider tip

Be warm and conversational, like advice from a friend. Keep it concise - no more than 4-5 sentences."""

    try:
        response_text = model.invoke(prompt)
    except:
        response_text = graph_context
    
    return {
        "response": response_text,
        "response_metadata": {
            "source": "graphrag",
            "recommendations_count": len(recommendations)
        }
    }


def general_info_node(state: ConversationState) -> Dict:
    """
    Node: Handle general queries using RAG
    Retrieves information from the knowledge base
    """
    user_input = state["user_input"]
    sentiment = state.get("sentiment", "neutral")
    
    if db is None:
        return {
            "response": "Feel free to ask Renu or Nalaka directly - they're always happy to help! Reach them at +94 77 123 4567.",
            "response_metadata": {"fallback": True}
        }
    
    # Search RAG database
    try:
        results = db.similarity_search(user_input, k=3)
    except Exception:
        results = []
    
    if not results:
        return {
            "response": "I'm not sure about that specific detail. Renu or Nalaka would know best - give them a ring at +94 77 123 4567 or ask at breakfast!",
            "response_metadata": {"no_results": True}
        }
    
    context_text = "\n\n".join([doc.page_content for doc in results])
    
    if model is None:
        snippet = results[0].page_content.strip()
        if len(snippet) > 500:
            snippet = snippet[:500] + "…"
        return {
            "response": f"Here's what I can share:\n\n{snippet}\n\nFor more detail, ask Renu or Nalaka at +94 77 123 4567.",
            "response_metadata": {"source": "rag", "docs_used": len(results), "llm": False}
        }
    
    # Adjust tone based on sentiment
    tone_instruction = ""
    if sentiment == "positive":
        tone_instruction = "The guest seems happy - match their enthusiasm!"
    elif sentiment in ["negative", "angry"]:
        tone_instruction = "The guest seems frustrated - be extra helpful and understanding."
    
    prompt = f"""You are a friendly staff member at Cloudy Hill Cottage, a cozy homestay in Ella, Sri Lanka run by Renu and Nalaka.

Hotel Information:
{context_text}

Guest Question: {user_input}

{tone_instruction}

Respond naturally and warmly, as if you're chatting with a guest over tea. Don't mention "context" or "information provided". Keep it brief - 2-3 sentences unless they asked for details."""

    try:
        response_text = model.invoke(prompt)
    except Exception:
        response_text = f"Based on what I know: {results[0].page_content[:200]}... Feel free to ask Renu for more details!"
    
    return {
        "response": response_text,
        "response_metadata": {"source": "rag", "docs_used": len(results)}
    }


def format_response_node(state: ConversationState) -> Dict:
    """
    Final Node: Format the response and add to message history
    """
    def normalize_emote_markers(text: str) -> str:
        """
        Some LLMs output emotion markers like *smile* or *wink*.
        Convert common markers into real emoji, then remove remaining *...* wrappers.
        """
        if not text:
            return text

        # Known marker -> emoji mappings (extend if you see more markers)
        emote_map = {
            "smile": "😊",
            "cozy smile": "🥰",
            "wink": "😉",
            "laugh": "😂",
            "heart": "❤️",
            "thinking": "🤔",
            "cry": "😢",
            "angry": "😠",
        }

        normalized = text
        # 1) Replace known *marker* strings with emoji
        for marker, emoji in emote_map.items():
            normalized = re.sub(
                rf"\*{re.escape(marker)}\*",
                emoji,
                normalized,
                flags=re.IGNORECASE,
            )

        # 2) For anything left like *something*, remove the asterisks
        # (prevents the chat UI from showing literal italics/emote text)
        normalized = re.sub(
            r"\*([A-Za-z][A-Za-z0-9\-\s]{0,30})\*",
            r"\1",
            normalized,
        )

        return normalized

    response = state.get(
        "response",
        "I'm here to help! What can I assist you with?",
    )
    response = normalize_emote_markers(response)
    
    # Create assistant message
    new_message: Message = {
        "role": "assistant",
        "content": response,
        "sentiment": state.get("sentiment"),
        "timestamp": None  # Would be set by the API
    }
    
    return {
        # Important: api_server reads `result["response"]`, so we must write the
        # normalized text back to the workflow state (not only `messages`).
        "response": response,
        "messages": [new_message]
    }


def booking_node(state: ConversationState) -> Dict:
    """
    Node: Handle booking intent
    Routes user to the dedicated booking endpoint for multi-turn booking conversation
    """
    user_input = state["user_input"]
    
    # Generate response directing user to booking flow
    response = f"""🎫 Room Booking Assistant

I'd love to help you book a room at Cloudy Hill Cottage! To ensure I capture all the details perfectly, let me guide you through our booking process.

I'll need to know:
1. Your check-in and check-out dates
2. Room type preference (Standard, Deluxe, Suite, Presidential)
3. Number of guests
4. Your contact details

Ready to get started? Tell me your dates and what you're looking for!"""
    
    return {
        "response": response,
        "response_metadata": {"handler": "booking", "requires_booking_flow": True}
    }


# ============================================================================
# ROUTING FUNCTIONS (Conditional Edges)
# ============================================================================

def route_by_intent(state: ConversationState) -> Literal["negotiation", "complaint", "recommendation", "booking", "general_info"]:
    """
    Router: Determines which handler node to use based on detected intent
    Complaints in crisis mode take priority
    """
    intent = state.get("intent", "general_info")
    is_crisis = state.get("is_crisis_mode", False)
    is_complaint = state.get("is_complaint", False)
    
    # Crisis complaints always go to complaint handler
    if is_crisis and is_complaint:
        return "complaint"
    
    # Map intent to node
    intent_map = {
        "negotiation": "negotiation",
        "complaint": "complaint",
        "recommendation": "recommendation",
        "booking": "booking",
        "general_info": "general_info"
    }
    
    return intent_map.get(intent, "general_info")


# ============================================================================
# BUILD THE GRAPH
# ============================================================================

def create_hotel_workflow() -> StateGraph:
    """
    Create the LangGraph workflow for the hotel chatbot
    
    Graph Structure:
    
    [User Input]
         │
         ▼
    ┌─────────────┐
    │  Sentiment  │
    │  Analysis   │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │   Intent    │
    │  Detection  │
    └──────┬──────┘
           │
           ├───────────────┬───────────────┬───────────────┐
           │               │               │               │
           ▼               ▼               ▼               ▼
    ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐
    │Negotiation│   │ Complaint │   │Recommend. │   │  General  │
    │   Node    │   │   Node    │   │   Node    │   │   Info    │
    └─────┬─────┘   └─────┬─────┘   └─────┬─────┘   └─────┬─────┘
          │               │               │               │
          └───────────────┴───────────────┴───────────────┘
                                   │
                                   ▼
                          ┌─────────────┐
                          │   Format    │
                          │  Response   │
                          └──────┬──────┘
                                 │
                                 ▼
                              [END]
    """
    
    # Create the graph with our state schema
    workflow = StateGraph(ConversationState)
    
    # Add all nodes
    workflow.add_node("analyze_sentiment", analyze_sentiment_node)
    workflow.add_node("detect_intent", detect_intent_node)
    workflow.add_node("negotiation", negotiation_node)
    workflow.add_node("complaint", complaint_node)
    workflow.add_node("recommendation", recommendation_node)
    workflow.add_node("general_info", general_info_node)
    workflow.add_node("booking", booking_node)
    workflow.add_node("format_response", format_response_node)
    
    # Set entry point
    workflow.set_entry_point("analyze_sentiment")
    
    # Sequential flow: sentiment -> intent
    workflow.add_edge("analyze_sentiment", "detect_intent")
    
    # Conditional routing after intent detection
    workflow.add_conditional_edges(
        "detect_intent",
        route_by_intent,
        {
            "negotiation": "negotiation",
            "complaint": "complaint",
            "recommendation": "recommendation",
            "booking": "booking",
            "general_info": "general_info"
        }
    )
    
    # All handler nodes go to format_response
    workflow.add_edge("negotiation", "format_response")
    workflow.add_edge("complaint", "format_response")
    workflow.add_edge("recommendation", "format_response")
    workflow.add_edge("booking", "format_response")
    workflow.add_edge("general_info", "format_response")
    
    # format_response -> END
    workflow.add_edge("format_response", END)
    
    return workflow


def compile_workflow(use_memory: bool = True):
    """
    Compile the workflow with optional memory checkpoint
    
    Args:
        use_memory: If True, enables conversation persistence across turns
    
    Returns:
        Compiled LangGraph workflow
    """
    workflow = create_hotel_workflow()
    
    if use_memory:
        # MemorySaver enables multi-turn conversations
        memory = MemorySaver()
        return workflow.compile(checkpointer=memory)
    else:
        return workflow.compile()


# Create the compiled workflow (with memory by default)
hotel_workflow = compile_workflow(use_memory=True)


# ============================================================================
# CONVENIENCE FUNCTIONS
# ============================================================================

def create_initial_state(
    user_input: str,
    user_id: str = None,
    loyalty_status: str = "none",
    session_id: str = None,
    existing_negotiation: Dict = None
) -> ConversationState:
    """
    Create initial state for a new message
    """
    return {
        "messages": [{"role": "user", "content": user_input, "sentiment": None, "timestamp": None}],
        "user_input": user_input,
        "user_id": user_id,
        "loyalty_status": loyalty_status,
        "session_id": session_id,
        "sentiment": "neutral",
        "sentiment_score": 0.0,
        "is_complaint": False,
        "severity": "minor",
        "intent": "general_info",
        "negotiation": existing_negotiation or {
            "round": 0,
            "room_type": None,
            "initial_offer": None,
            "current_offer": None,
            "counter_offers": [],
            "final_price": None,
            "add_ons": [],
            "status": "inactive"
        },
        "response": "",
        "is_crisis_mode": False,
        "needs_human_escalation": False,
        "response_metadata": {}
    }


async def process_message(
    user_input: str,
    user_id: str = None,
    loyalty_status: str = "none",
    session_id: str = None
) -> Dict:
    """
    Process a single message through the workflow
    
    This is the main entry point for the API server
    """
    # Create config for this conversation
    config = {
        "configurable": {
            "thread_id": session_id or user_id or "default"
        }
    }
    
    # Create initial state
    initial_state = create_initial_state(
        user_input=user_input,
        user_id=user_id,
        loyalty_status=loyalty_status,
        session_id=session_id
    )
    
    # Run the workflow
    try:
        result = hotel_workflow.invoke(initial_state, config)
        
        return {
            "response": result.get("response", "I'm here to help!"),
            "sentiment": result.get("sentiment", "neutral"),
            "sentiment_score": result.get("sentiment_score", 0.0),
            "intent": result.get("intent", "general_info"),
            "is_crisis_mode": result.get("is_crisis_mode", False),
            "needs_human_escalation": result.get("needs_human_escalation", False),
            "negotiation_data": result.get("negotiation"),
            "metadata": result.get("response_metadata", {})
        }
    except Exception as e:
        return {
            "response": f"I apologize, but I encountered an issue. Please contact us directly at +94 77 123 4567.",
            "sentiment": "neutral",
            "sentiment_score": 0.0,
            "intent": "error",
            "is_crisis_mode": False,
            "needs_human_escalation": False,
            "negotiation_data": None,
            "metadata": {"error": str(e)}
        }
