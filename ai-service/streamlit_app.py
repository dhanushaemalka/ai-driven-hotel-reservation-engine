"""
Grand Vista Hotel - Emotion-Adaptive Chatbot UI
Built with Streamlit & Affective Computing
Sentiment-driven UI changes (colors, fonts, emojis, layout)
"""

import streamlit as st
import os
from datetime import datetime
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.llms import Ollama
from langchain_core.prompts import ChatPromptTemplate

from negotiator_agent import NegotiatorAgent
from sentiment_agent import SentimentAnalyzer
from graphrag_engine import KnowledgeGraph, format_graph_context

# Page configuration
st.set_page_config(
    page_title="Grand Vista Hotel - AI Concierge",
    page_icon="🏨",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize session state
if "messages" not in st.session_state:
    st.session_state.messages = []

if "current_sentiment" not in st.session_state:
    st.session_state.current_sentiment = "neutral"

if "sentiment_score" not in st.session_state:
    st.session_state.sentiment_score = 0.0

if "db_initialized" not in st.session_state:
    st.session_state.db_initialized = False
    st.session_state.db = None
    st.session_state.model = None
    st.session_state.negotiator = None
    st.session_state.sentiment_analyzer = None
    st.session_state.knowledge_graph = None


# ============================================================================
# EMOTION-ADAPTIVE THEMING ENGINE
# ============================================================================

class EmotionTheme:
    """Manages UI theme based on detected emotion"""
    
    THEMES = {
        "happy": {
            "primary_color": "#2ECC71",      # Bright green
            "secondary_color": "#F39C12",    # Orange
            "background": "#F0FFF4",         # Light green
            "text_color": "#1A1A1A",
            "emoji": "😊",
            "font_size": "1.1em",
            "font_style": "normal",
            "avatar_state": "smiling",
            "urgency": "low",
            "mode": "concierge"
        },
        "neutral": {
            "primary_color": "#3498DB",      # Blue
            "secondary_color": "#9B59B6",    # Purple
            "background": "#F8F9FA",         # Light gray
            "text_color": "#2C3E50",
            "emoji": "👤",
            "font_size": "1.0em",
            "font_style": "normal",
            "avatar_state": "neutral",
            "urgency": "normal",
            "mode": "concierge"
        },
        "negative": {
            "primary_color": "#E74C3C",      # Red
            "secondary_color": "#E67E22",    # Orange-red
            "background": "#FFF5F5",         # Light red
            "text_color": "#C0392B",
            "emoji": "😔",
            "font_size": "1.05em",
            "font_style": "italic",
            "avatar_state": "concerned",
            "urgency": "medium",
            "mode": "support"
        },
        "angry": {
            "primary_color": "#C0392B",      # Dark red
            "secondary_color": "#8B0000",    # Blood red
            "background": "#2C3E50",         # Dark blue-gray (CRISIS MODE)
            "text_color": "#ECF0F1",         # Light gray text
            "emoji": "😠",
            "font_size": "1.0em",
            "font_style": "bold",
            "avatar_state": "alarmed",
            "urgency": "high",
            "mode": "crisis_manager",
            "border": "2px solid #C0392B"
        }
    }
    
    @staticmethod
    def get_theme(sentiment: str, score: float) -> dict:
        """Get theme based on sentiment"""
        return EmotionTheme.THEMES.get(sentiment, EmotionTheme.THEMES["neutral"])
    
    @staticmethod
    def get_avatar_emoji(sentiment: str) -> str:
        """Get avatar emoji based on sentiment"""
        avatars = {
            "happy": "😊",
            "neutral": "🤖",
            "negative": "😟",
            "angry": "🚨"
        }
        return avatars.get(sentiment, "🤖")
    
    @staticmethod
    def get_greeting(sentiment: str) -> str:
        """Get context-appropriate greeting"""
        greetings = {
            "happy": "I love your energy! How can I make your stay even better?",
            "neutral": "Welcome to Grand Vista Hotel. How may I assist you today?",
            "negative": "I hear you're having trouble. Let me help fix this for you.",
            "angry": "I sincerely apologize for the inconvenience. Your concern is my priority."
        }
        return greetings.get(sentiment, greetings["neutral"])


# ============================================================================
# CUSTOM CSS STYLING
# ============================================================================

def inject_custom_css(theme: dict):
    """Inject emotion-adaptive CSS"""
    
    css = f"""
    <style>
        /* Main theme colors */
        :root {{
            --primary-color: {theme['primary_color']};
            --secondary-color: {theme['secondary_color']};
            --background-color: {theme['background']};
            --text-color: {theme['text_color']};
        }}
        
        /* Background */
        .stApp {{
            background-color: {theme['background']};
            color: {theme['text_color']};
            transition: all 0.3s ease;
        }}
        
        /* Main container */
        .main {{
            background-color: {theme['background']};
            padding: 2rem;
        }}
        
        /* Headers */
        h1, h2, h3 {{
            color: {theme['primary_color']};
            font-size: {theme['font_size']};
            font-weight: bold;
        }}
        
        /* Chat messages */
        .chat-message {{
            padding: 1.5rem;
            border-radius: 0.5rem;
            margin: 1rem 0;
            animation: slideIn 0.3s ease;
        }}
        
        .chat-message.user {{
            background-color: {theme['primary_color']};
            color: white;
            margin-left: 2rem;
            border-radius: 1rem 0.2rem 1rem 1rem;
        }}
        
        .chat-message.assistant {{
            background-color: rgba({EmotionTheme.hex_to_rgb(theme['primary_color'])}, 0.1);
            border-left: 4px solid {theme['primary_color']};
            border-radius: 0.2rem 1rem 1rem 1rem;
        }}
        
        @keyframes slideIn {{
            from {{
                opacity: 0;
                transform: translateY(10px);
            }}
            to {{
                opacity: 1;
                transform: translateY(0);
            }}
        }}
        
        /* Sentiment badge */
        .sentiment-badge {{
            display: inline-block;
            padding: 0.5rem 1rem;
            background-color: {theme['primary_color']};
            color: white;
            border-radius: 1rem;
            font-weight: bold;
            margin: 0.5rem 0;
            font-size: 0.9em;
        }}
        
        /* Crisis mode warning */
        .crisis-warning {{
            padding: 1rem;
            background-color: {theme['secondary_color']};
            border: {theme.get('border', '2px solid ' + theme['secondary_color'])};
            border-radius: 0.5rem;
            color: white;
            font-weight: bold;
            margin: 1rem 0;
            animation: pulse 1.5s infinite;
        }}
        
        @keyframes pulse {{
            0%, 100% {{ opacity: 1; }}
            50% {{ opacity: 0.7; }}
        }}
        
        /* Input area */
        .stTextInput > div > div > input {{
            border: 2px solid {theme['primary_color']};
            background-color: white;
            color: {theme['text_color']};
            font-size: {theme['font_size']};
        }}
        
        .stButton > button {{
            background-color: {theme['primary_color']};
            color: white;
            border: none;
            border-radius: 0.5rem;
            font-weight: bold;
            transition: all 0.3s ease;
        }}
        
        .stButton > button:hover {{
            background-color: {theme['secondary_color']};
            transform: scale(1.05);
        }}
        
        /* Card styling */
        .info-card {{
            background-color: white;
            padding: 1.5rem;
            border-radius: 0.5rem;
            border-left: 4px solid {theme['primary_color']};
            margin: 1rem 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        
        /* Avatar */
        .avatar {{
            font-size: 3em;
            text-align: center;
            margin: 1rem 0;
        }}
    </style>
    """
    
    st.markdown(css, unsafe_allow_html=True)


# Helper function for hex to RGB conversion
def hex_to_rgb(hex_color: str) -> str:
    """Convert hex color to RGB"""
    hex_color = hex_color.lstrip('#')
    return ','.join(str(int(hex_color[i:i+2], 16)) for i in (0, 2, 4))

EmotionTheme.hex_to_rgb = staticmethod(hex_to_rgb)


# ============================================================================
# BACKEND INITIALIZATION
# ============================================================================

@st.cache_resource
def initialize_backend():
    """Initialize RAG system and agents"""
    
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    CHROMA_PATH = os.path.join(BASE_DIR, "chroma")
    
    # Initialize embeddings and database
    embedding_function = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embedding_function)
    
    # Initialize LLM
    model = Ollama(model="llama2")
    
    # Initialize agents
    negotiator = NegotiatorAgent(db)
    sentiment_analyzer = SentimentAnalyzer(db)
    knowledge_graph = KnowledgeGraph()
    
    return {
        "db": db,
        "model": model,
        "negotiator": negotiator,
        "sentiment_analyzer": sentiment_analyzer,
        "knowledge_graph": knowledge_graph
    }


# ============================================================================
# INTENT DETECTION & ROUTING
# ============================================================================

def detect_intent(user_input: str) -> str:
    """Detect user intent"""
    user_lower = user_input.lower()
    
    # Negotiation intent
    if any(word in user_lower for word in ["price", "cost", "expensive", "negotiate", "discount", "$"]):
        if any(word in user_lower for word in ["room", "suite", "standard", "deluxe", "presidential"]):
            return "negotiation"
    
    # Complaint intent
    if st.session_state.sentiment_analyzer.is_complaint(user_input):
        return "complaint"
    
    # Recommendation intent
    if any(word in user_lower for word in ["restaurant", "dinner", "lunch", "eat", "itinerary", "recommend"]):
        if any(word in user_lower for word in ["near", "romantic", "vegan"]):
            return "recommendation"
    
    return "general_info"


# ============================================================================
# RESPONSE HANDLERS
# ============================================================================

def handle_negotiation(user_input: str) -> str:
    """Handle room price negotiation"""
    
    # Extract room type and price
    extracted = st.session_state.negotiator.extract_room_type_and_price(user_input)
    
    if not extracted or extracted[1] is None:
        return "I'd be happy to help with pricing! Please mention which room type and your target price. For example: 'Can the Presidential Suite be $400?'"
    
    room_type, guest_offer = extracted
    
    # Get negotiation context
    negotiation_result = st.session_state.negotiator.negotiate_price(room_type, guest_offer)
    occupancy_rate = st.session_state.negotiator.get_occupancy_rate()
    occupancy_tier = st.session_state.negotiator.get_occupancy_tier(occupancy_rate)
    
    system_prompt = st.session_state.negotiator.generate_system_prompt({
        "room_type": room_type,
        "base_price": st.session_state.negotiator.base_prices.get(room_type),
        "minimum_price": st.session_state.negotiator.minimum_prices.get(room_type),
        "occupancy_tier": occupancy_tier,
        "occupancy_rate": occupancy_rate
    })
    
    prompt = f"""{system_prompt}

NEGOTIATION DECISION: {negotiation_result['decision'].upper()}
Guest's Offer: ${guest_offer}

{negotiation_result['message']}"""
    
    response = st.session_state.model.invoke(prompt)
    return response


def handle_complaint(user_input: str) -> str:
    """Handle guest complaints"""
    
    sentiment, score = st.session_state.sentiment_analyzer.analyze_sentiment(user_input)
    is_complaint = st.session_state.sentiment_analyzer.is_complaint(user_input)
    severity = st.session_state.sentiment_analyzer.detect_issue_severity(user_input)
    
    system_prompt = st.session_state.sentiment_analyzer.generate_system_prompt(
        sentiment, is_complaint, severity
    )
    
    search_query = st.session_state.sentiment_analyzer.get_rag_search_context(
        sentiment, is_complaint, severity
    )
    
    policy_results = st.session_state.db.similarity_search(search_query, k=3)
    policy_context = "\n\n".join([doc.page_content for doc in policy_results]) if policy_results else ""
    
    prompt = f"""{system_prompt}

GUEST CONTEXT:
- Emotional State: {sentiment.upper()}
- Issue Severity: {severity.upper()}
- Statement: "{user_input}"

POLICIES:
{policy_context}"""
    
    response = st.session_state.model.invoke(prompt)
    return response


def handle_recommendation(user_input: str) -> str:
    """Handle recommendations using GraphRAG"""
    
    user_lower = user_input.lower()
    
    preferences = {
        "cuisine": [],
        "romantic": "romantic" in user_lower or "date" in user_lower,
        "max_distance_km": 2.0
    }
    
    # Extract cuisines
    cuisine_keywords = {
        "vegan": ["vegan", "vegetarian"],
        "japanese": ["japanese", "sushi"],
        "italian": ["italian", "pasta"]
    }
    
    for cuisine_type, keywords in cuisine_keywords.items():
        if any(k in user_lower for k in keywords):
            preferences["cuisine"].append(cuisine_type)
    
    recommendations = st.session_state.knowledge_graph.query_itinerary(preferences)
    graph_context = format_graph_context(recommendations, preferences)
    
    prompt = f"""You are a knowledgeable concierge. Guest request: "{user_input}"

{graph_context}

Provide a warm, personalized recommendation covering:
1. Your top choice and why it matches
2. Distance and ambiance
3. How to make a reservation
4. Alternative options"""
    
    response = st.session_state.model.invoke(prompt)
    return response


def handle_general_info(user_input: str) -> str:
    """Handle general hotel information"""
    
    results = st.session_state.db.similarity_search(user_input, k=3)
    
    if not results:
        return "I couldn't find that information. Please call our front desk at +1 (212) 555-0100."
    
    context_text = "\n\n".join([doc.page_content for doc in results])
    
    prompt = f"""You are a friendly hotel concierge.

Hotel Information:
{context_text}

Guest Question: {user_input}

Respond naturally as hotel staff (don't mention "context" or "information"):"""
    
    response = st.session_state.model.invoke(prompt)
    return response


# ============================================================================
# MAIN STREAMLIT APP
# ============================================================================

def main():
    # Initialize backend
    if not st.session_state.db_initialized:
        with st.spinner("🏨 Loading hotel concierge system..."):
            try:
                backend = initialize_backend()
                st.session_state.db = backend["db"]
                st.session_state.model = backend["model"]
                st.session_state.negotiator = backend["negotiator"]
                st.session_state.sentiment_analyzer = backend["sentiment_analyzer"]
                st.session_state.knowledge_graph = backend["knowledge_graph"]
                st.session_state.db_initialized = True
            except Exception as e:
                st.error(f"Error loading system: {str(e)}")
                st.info("Make sure Ollama is running: `ollama serve`")
                return
    
    # Get current theme based on sentiment
    theme = EmotionTheme.get_theme(st.session_state.current_sentiment, st.session_state.sentiment_score)
    
    # Inject emotion-adaptive CSS
    inject_custom_css(theme)
    
    # Header with emotion-aware design
    avatar = EmotionTheme.get_avatar_emoji(st.session_state.current_sentiment)
    
    col1, col2, col3 = st.columns([1, 2, 1])
    
    with col2:
        st.markdown(f"<div class='avatar'>{avatar}</div>", unsafe_allow_html=True)
        st.markdown(f"<h1 style='text-align: center; color: {theme['primary_color']};'>Grand Vista Hotel</h1>", unsafe_allow_html=True)
        st.markdown(f"<p style='text-align: center; font-size: 1.1em; color: {theme['text_color']};'><b>AI Concierge Assistant</b></p>", unsafe_allow_html=True)
    
    # Sentiment indicator
    if st.session_state.current_sentiment != "neutral":
        status_text = f"{st.session_state.current_sentiment.upper()} (Emotion detected: {st.session_state.sentiment_score:+.1f})"
        
        if st.session_state.current_sentiment == "angry":
            st.markdown(
                f"<div class='crisis-warning'>🚨 CRISIS MODE ACTIVATED - Priority support engaged</div>",
                unsafe_allow_html=True
            )
        
        st.markdown(
            f"<div style='text-align: center; padding: 1rem;'><span class='sentiment-badge'>{avatar} {status_text}</span></div>",
            unsafe_allow_html=True
        )
    
    # Greeting
    greeting = EmotionTheme.get_greeting(st.session_state.current_sentiment)
    st.markdown(
        f"<div class='info-card'><p><b>{greeting}</b></p></div>",
        unsafe_allow_html=True
    )
    
    # Chat display
    st.markdown("---")
    
    chat_container = st.container()
    
    with chat_container:
        for message in st.session_state.messages:
            with st.chat_message(message["role"], avatar=message.get("avatar", "🤖")):
                st.write(message["content"])
    
    # Input area
    st.markdown("---")
    
    col1, col2 = st.columns([5, 1])
    
    with col1:
        user_input = st.text_input(
            "How can I help you today?",
            placeholder="e.g., 'I want to negotiate room pricing' or 'My AC is broken'",
            key="user_input"
        )
    
    with col2:
        send_button = st.button("Send", use_container_width=True)
    
    # Process user input
    if send_button and user_input:
        
        # Add user message
        st.session_state.messages.append({
            "role": "user",
            "content": user_input,
            "avatar": "👤"
        })
        
        # Analyze sentiment
        sentiment, score = st.session_state.sentiment_analyzer.analyze_sentiment(user_input)
        st.session_state.current_sentiment = sentiment
        st.session_state.sentiment_score = score
        
        # Detect intent and get response
        intent = detect_intent(user_input)
        
        with st.spinner(f"{avatar} Processing... "):
            try:
                if intent == "negotiation":
                    response = handle_negotiation(user_input)
                elif intent == "complaint":
                    response = handle_complaint(user_input)
                elif intent == "recommendation":
                    response = handle_recommendation(user_input)
                else:
                    response = handle_general_info(user_input)
                
                # Add assistant response
                st.session_state.messages.append({
                    "role": "assistant",
                    "content": response,
                    "avatar": avatar
                })
                
                st.rerun()
                
            except Exception as e:
                st.error(f"Error processing request: {str(e)}")
                st.info("Please try again or contact our front desk.")
    
    # Sidebar info
    with st.sidebar:
        st.markdown("### 🎯 Chat Features")
        st.markdown("""
        **Emotion-Adaptive UI:**
        - 😊 Happy: Bright, casual design
        - 😔 Negative: Supportive colors
        - 😠 Angry: Crisis mode activated
        
        **AI Capabilities:**
        - 💰 Dynamic price negotiation
        - 📊 Real-time occupancy tracking
        - 🗺️ Smart recommendations (GraphRAG)
        - 😊 Sentiment-aware responses
        """)
        
        st.markdown("---")
        
        st.markdown("### 📊 Current Status")
        col1, col2 = st.columns(2)
        
        with col1:
            st.metric("Messages", len(st.session_state.messages))
        
        with col2:
            emoji = EmotionTheme.get_avatar_emoji(st.session_state.current_sentiment)
            st.metric("Mood", emoji)
        
        st.markdown("---")
        
        st.markdown("### ℹ️ About")
        st.markdown("""
        **Grand Vista Hotel AI Concierge**
        
        Advanced features:
        - Negotiator Bot
        - Crisis Manager
        - GraphRAG Recommendations
        
        Built with LangChain + Ollama + Streamlit
        """)
        
        if st.button("Clear Chat History"):
            st.session_state.messages = []
            st.session_state.current_sentiment = "neutral"
            st.rerun()


if __name__ == "__main__":
    main()
