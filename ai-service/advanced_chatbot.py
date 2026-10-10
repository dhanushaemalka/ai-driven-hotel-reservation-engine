"""
Advanced Hotel Chatbot with:
1. Negotiator Agent (Dynamic Pricing)
2. Sentiment-Adaptive Crisis Manager
3. GraphRAG (Knowledge Graph for recommendations)
"""

import os
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.llms import Ollama
from langchain_core.prompts import ChatPromptTemplate

from negotiator_agent import NegotiatorAgent
from sentiment_agent import SentimentAnalyzer
from graphrag_engine import KnowledgeGraph, format_graph_context

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_PATH = os.path.join(BASE_DIR, "chroma")

# System prompts for different modes
DEFAULT_SYSTEM_PROMPT = """You are a friendly, professional concierge at Grand Vista Hotel. Answer the guest's question naturally and conversationally.

Hotel Information:
{context}

Guest's Question: {question}

Your response (speak naturally as hotel staff, don't mention "context" or "based on"):"""


class AdvancedHotelChatbot:
    def __init__(self):
        # Initialize embeddings and database
        self.embedding_function = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        self.db = Chroma(persist_directory=CHROMA_PATH, embedding_function=self.embedding_function)
        
        # Initialize LLM
        self.model = Ollama(model="llama2")
        
        # Initialize agents
        self.negotiator = NegotiatorAgent(self.db)
        self.sentiment_analyzer = SentimentAnalyzer(self.db)
        self.knowledge_graph = KnowledgeGraph()
        
        print("\n" + "="*70)
        print("  GRAND VISTA HOTEL - ADVANCED CHATBOT ASSISTANT")
        print("  Features: Dynamic Pricing • Sentiment Intelligence • GraphRAG")
        print("="*70)
        print("\nWelcome! I'm your intelligent hotel concierge.")
        print("I can help with:")
        print("  • Room pricing & negotiations")
        print("  • Resolving complaints & issues")
        print("  • Personalized recommendations (restaurants, activities)")
        print("\nType 'quit' to exit.\n")
    
    def detect_intent(self, user_input: str) -> str:
        """Detect what the user is trying to do"""
        user_lower = user_input.lower()
        
        # Negotiation intent
        if any(word in user_lower for word in ["price", "cost", "expensive", "negotiate", "discount", "$", "how much"]):
            if any(word in user_lower for word in ["room", "suite", "standard", "deluxe", "presidential"]):
                return "negotiation"
        
        # Complaint intent
        if self.sentiment_analyzer.is_complaint(user_input):
            return "complaint"
        
        # Recommendation intent
        if any(word in user_lower for word in ["restaurant", "dinner", "lunch", "eat", "food", "itinerary", "where to go", "recommend", "activity"]):
            if any(word in user_lower for word in ["near", "close", "nearby", "romantic", "vegan"]):
                return "recommendation"
        
        return "general_info"
    
    def handle_negotiation(self, user_input: str) -> str:
        """Handle room price negotiation"""
        
        # Extract room type and price
        extracted = self.negotiator.extract_room_type_and_price(user_input)
        
        if not extracted or extracted[1] is None:
            return "I'd be happy to help negotiate room pricing! Please tell me which room type you're interested in and your target price. For example: 'The Presidential Suite is too expensive at $500. Can you do $400?'"
        
        room_type, guest_offer = extracted
        
        # Get negotiation context
        occupancy_rate = self.negotiator.get_occupancy_rate()
        occupancy_tier = self.negotiator.get_occupancy_tier(occupancy_rate)
        base_price = self.negotiator.base_prices.get(room_type, 150)
        min_price = self.negotiator.minimum_prices.get(room_type, 120)
        
        # Negotiate
        negotiation_result = self.negotiator.negotiate_price(room_type, guest_offer)
        
        # Create context for LLM
        negotiation_context = {
            "room_type": room_type,
            "base_price": base_price,
            "minimum_price": min_price,
            "occupancy_tier": occupancy_tier,
            "occupancy_rate": occupancy_rate,
            "decision": negotiation_result["decision"],
            "guest_offer": guest_offer
        }
        
        # Generate dynamic system prompt
        system_prompt = self.negotiator.generate_system_prompt(negotiation_context)
        
        # Retrieve pricing policy from RAG
        policy_results = self.db.similarity_search("pricing policy discounts minimum", k=2)
        policy_context = "\n\n".join([doc.page_content for doc in policy_results]) if policy_results else "Pricing policies available."
        
        # Create full prompt
        prompt = f"""{system_prompt}

NEGOTIATION DECISION: {negotiation_result['decision'].upper()}
Guest's Offer: ${guest_offer}
Room Type: {room_type}

{negotiation_result['message']}
"""
        
        if negotiation_result.get("add_ons"):
            prompt += f"\nValue-adds offered: {', '.join(negotiation_result['add_ons'])}"
        
        # Get LLM response
        print("\n🏨 Assistant: ", end="", flush=True)
        response = self.model.invoke(prompt)
        return response
    
    def handle_complaint(self, user_input: str) -> str:
        """Handle guest complaints with emotional intelligence"""
        
        # Analyze sentiment and issue
        sentiment, sentiment_score = self.sentiment_analyzer.analyze_sentiment(user_input)
        is_complaint = self.sentiment_analyzer.is_complaint(user_input)
        severity = self.sentiment_analyzer.detect_issue_severity(user_input)
        
        # Get context-specific system prompt
        system_prompt = self.sentiment_analyzer.generate_system_prompt(sentiment, is_complaint, severity)
        
        # Get relevant documents from RAG
        search_query = self.sentiment_analyzer.get_rag_search_context(sentiment, is_complaint, severity)
        policy_results = self.db.similarity_search(search_query, k=3)
        policy_context = "\n\n".join([doc.page_content for doc in policy_results]) if policy_results else ""
        
        # Create prompt
        prompt = f"""{system_prompt}

GUEST CONTEXT:
- Emotional State: {sentiment.upper()} (score: {sentiment_score:.1f})
- Issue Severity: {severity.upper()}
- Guest Statement: "{user_input}"

AVAILABLE POLICIES:
{policy_context}

Your response (be empathetic, solution-focused, and genuine):"""
        
        # Get LLM response
        print("\n🏨 Assistant: ", end="", flush=True)
        response = self.model.invoke(prompt)
        return response
    
    def handle_recommendation(self, user_input: str) -> str:
        """Handle recommendations using GraphRAG"""
        
        user_lower = user_input.lower()
        
        # Extract preferences
        preferences = {
            "cuisine": [],
            "romantic": "romantic" in user_lower or "date" in user_lower,
            "max_distance_km": 2.0,
            "must_be_open": True
        }
        
        # Extract cuisine preferences
        cuisine_keywords = {
            "vegan": ["vegan", "vegetarian"],
            "japanese": ["japanese", "sushi"],
            "italian": ["italian", "pasta"],
            "chinese": ["chinese"],
            "organic": ["organic", "farm"]
        }
        
        for cuisine_type, keywords in cuisine_keywords.items():
            if any(k in user_lower for k in keywords):
                preferences["cuisine"].append(cuisine_type)
        
        # Query knowledge graph
        recommendations = self.knowledge_graph.query_itinerary(preferences)
        
        # Format graph context
        graph_context = format_graph_context(recommendations, preferences)
        
        # Get LLM to craft personalized recommendation
        prompt = f"""You are a knowledgeable concierge recommending experiences.

Guest Request: "{user_input}"

Based on our knowledge of local venues and their relationships to the hotel:

{graph_context}

Provide a warm, personalized recommendation mentioning:
1. Your top choice and why it matches their request
2. The distance and ambiance
3. Reservation details if you can offer them
4. Alternative options if interested
5. Any special arrangements (transportation, dress code)

Make it feel like a personal recommendation from a friend."""
        
        # Get LLM response
        print("\n🏨 Assistant: ", end="", flush=True)
        response = self.model.invoke(prompt)
        return response
    
    def handle_general_info(self, user_input: str) -> str:
        """Handle general hotel information queries"""
        
        # Standard RAG retrieval
        results = self.db.similarity_search(user_input, k=3)
        
        if not results:
            return "I couldn't find specific information about that. Please contact our front desk at +1 (212) 555-0100 for assistance."
        
        context_text = "\n\n".join([doc.page_content for doc in results])
        
        # Create prompt
        prompt = f"""{DEFAULT_SYSTEM_PROMPT.format(context=context_text, question=user_input)}"""
        
        # Get LLM response
        print("\n🏨 Assistant: ", end="", flush=True)
        response = self.model.invoke(prompt)
        return response
    
    def run(self):
        """Main chatbot loop"""
        
        while True:
            try:
                user_input = input("\n👤 You: ").strip()
                
                if not user_input:
                    continue
                
                if user_input.lower() in ['quit', 'exit', 'bye', 'goodbye']:
                    print("\n🏨 Assistant: Thank you for choosing Grand Vista Hotel! Have a wonderful stay!")
                    break
                
                # Detect intent and route to appropriate handler
                intent = self.detect_intent(user_input)
                
                if intent == "negotiation":
                    response = self.handle_negotiation(user_input)
                elif intent == "complaint":
                    response = self.handle_complaint(user_input)
                elif intent == "recommendation":
                    response = self.handle_recommendation(user_input)
                else:
                    response = self.handle_general_info(user_input)
                
                print(response)
                
            except KeyboardInterrupt:
                print("\n\n🏨 Assistant: Thank you for using our service! Goodbye!")
                break
            except Exception as e:
                print(f"\n⚠️  Error: {str(e)}")
                print("Please try again or contact the front desk.")


if __name__ == "__main__":
    chatbot = AdvancedHotelChatbot()
    chatbot.run()
