<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&height=220&color=0:0ea5e9,100:22c55e&text=Cloudy%20Hill%20Cottage&fontSize=44&fontAlignY=40&desc=Smart%20Hotel%20Booking%20System&descAlignY=58&animation=fadeIn" alt="Cloudy Hill Cottage Banner" />

<h1>Cloudy Hill Cottage - Smart Hotel Booking System</h1>

<p>
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=18&pause=1200&color=0EA5E9&center=true&vCenter=true&width=750&lines=AI-powered+hotel+booking+platform;Sentiment-aware+customer+experience;Dynamic+negotiation+and+GraphRAG+recommendations" alt="Typing Header" />
</p>

<p>
    <img src="https://img.shields.io/badge/Version-1.0.0-0ea5e9?style=for-the-badge" alt="Version" />
    <img src="https://img.shields.io/badge/Stack-MERN%20%2B%20AI-16a34a?style=for-the-badge" alt="Stack" />
    <img src="https://img.shields.io/badge/License-MIT-f97316?style=for-the-badge" alt="License" />
</p>

<p>
    <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Hotel.png" alt="Hotel" width="34" height="34" />
    <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Robot.png" alt="Robot" width="34" height="34" />
    <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Compass.png" alt="Compass" width="34" height="34" />
    <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Receipt.png" alt="Receipt" width="34" height="34" />
</p>

</div>

> A collaborative, AI-powered hotel booking platform with intelligent chatbot workflows, dynamic pricing negotiation, and sentiment-aware customer service.

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [System Architecture](#-system-architecture)
3. [Core Features & CRUD Operations](#-core-features--crud-operations)
4. [AI Integration & Problem Solving](#-ai-integration--problem-solving)
5. [Theoretical Foundations](#-theoretical-foundations)
6. [Novelty & Innovation](#-novelty--innovation)
7. [Technology Stack](#-technology-stack)
8. [Installation & Setup](#-installation--setup)
9. [API Documentation](#-api-documentation)
10. [Team Distribution](#-team-distribution)

---

## 🎯 Project Overview

Cloudy Hill Cottage is a comprehensive hotel booking system designed for a boutique homestay in Ella, Sri Lanka. The system goes beyond traditional booking platforms by integrating:

- **Intelligent AI Chatbot** with sentiment analysis and emotional intelligence
- **Dynamic Price Negotiation** powered by Game Theory principles
- **GraphRAG Recommendations** for personalized local experiences
- **Real-time Crisis Management** for guest complaints

### Problem Statement

Traditional hotel booking systems face several challenges:
1. **Impersonal Customer Service** - Generic responses that don't adapt to guest emotions
2. **Fixed Pricing Models** - No flexibility for price negotiation based on demand
3. **Information Overload** - Guests struggle to find relevant local recommendations
4. **Delayed Complaint Resolution** - Manual escalation processes cause frustration

### Our Solution

We developed an AI-powered system that:
- Detects guest sentiment in real-time and adapts responses accordingly
- Implements dynamic pricing with negotiation capabilities
- Uses Knowledge Graphs for contextual recommendations
- Automatically escalates critical issues with appropriate compensation

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React + Vite)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │  Pages   │ │Components│ │ Context  │ │    AI Chatbot    │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER (Node.js + Express)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │  Routes  │ │Controllers│ │  Models  │ │   AI Proxy       │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │
└──────────┬──────────────────────────────────────┬───────────────┘
           │                                      │
           ▼                                      ▼
┌──────────────────┐                  ┌───────────────────────────┐
│    MongoDB       │                  │   AI SERVICE (Python)     │
│  ┌────────────┐  │                  │  ┌─────────────────────┐  │
│  │   Users    │  │                  │  │  Sentiment Agent    │  │
│  │   Rooms    │  │                  │  │  Negotiator Agent   │  │
│  │  Bookings  │  │                  │  │  GraphRAG Engine    │  │
│  │  Reviews   │  │                  │  │  RAG + ChromaDB     │  │
│  │  Payments  │  │                  │  │  Ollama LLM         │  │
│  │Experiences │  │                  │  └─────────────────────┘  │
│  └────────────┘  │                  └───────────────────────────┘
└──────────────────┘
```

---

## 📦 Core Features & CRUD Operations

### Component Overview (6 Main Components)

This is a **single-property booking system** for Cloudy Hill Cottage with two user roles:
- **Admin**: Full access to manage rooms, bookings, reviews, payments, and experiences
- **Guest**: Can browse, book rooms, make payments, and submit reviews

| # | Component | Description | Team Member |
|---|-----------|-------------|-------------|
| 1 | **User Management** | Authentication, profiles, role management (Admin/Guest) | Member 1 |
| 2 | **Room Management** | Room inventory, images, amenities for Cloudy Hill Cottage | Member 2 |
| 3 | **Booking Management** | Reservations, availability, guest scheduling | Member 3 |
| 4 | **Review Management** | Guest feedback, ratings, admin responses | Member 4 |
| 5 | **Payment Management** | Transactions, refunds, receipts | Member 5 |
| 6 | **Experience Management** | Activities, packages (cooking class, hikes, etc.) | Member 6 |

---

### 1. User Management (`/api/user`)

Handles user authentication via Clerk and user data management.

| Operation | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| **Create** | POST | `/api/clerk` | Webhook: Create user on Clerk registration |
| **Read** | GET | `/api/user` | Get current user's data |
| **Read** | GET | `/api/user/:id` | Get user by ID |
| **Read** | GET | `/api/user/all` | Get all users (admin only) |
| **Update** | PUT | `/api/user/:id` | Update user profile |
| **Delete** | DELETE | `/api/user/:id` | Delete user account (admin only) |

**Key Functions:**
```javascript
// userController.js
getUserData()              // Get current authenticated user (role, searches)
getUserById(id)            // Fetch specific user
getAllUsers()              // Admin: list all users
updateUser(id, data)       // Modify user profile (admin can change roles)
deleteUser(id)             // Remove user account (admin only)
storeRecentSearch()        // Track search history for recommendations
```

**User Roles:**
- `guest` (default) - Can browse, book, review, pay
- `admin` - Full system access including room/experience management

---

### 2. Room Management (`/api/rooms`)

Manages room inventory for Cloudy Hill Cottage with image upload via Cloudinary.

| Operation | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| **Create** | POST | `/api/rooms` | Add new room with images (admin) |
| **Read** | GET | `/api/rooms` | Get available rooms (public) |
| **Read** | GET | `/api/rooms/all` | Get all rooms (public) |
| **Read** | GET | `/api/rooms/admin` | Get rooms for admin dashboard |
| **Read** | GET | `/api/rooms/:id` | Get room details (public) |
| **Update** | PUT | `/api/rooms/:id` | Update room details (admin) |
| **Update** | POST | `/api/rooms/toggle-availability` | Toggle availability (admin) |
| **Delete** | DELETE | `/api/rooms/:id` | Delete room (admin) |

**Key Functions:**
```javascript
// roomController.js
createRoom()              // Add room with Cloudinary image upload (admin)
getRooms()                // Get all available rooms for guests
getAllRooms()             // Get all rooms including unavailable
getAdminRooms()           // Get rooms for admin dashboard
getRoomById(id)           // Get specific room details
updateRoom(id)            // Modify room with optional new images (admin)
deleteRoom(id)            // Remove room from inventory (admin)
toggleRoomAvailability()  // Quick toggle for room availability (admin)
```

**Room Schema:**
```javascript
{
  roomType: String,        // "Standard Room", "Deluxe Room", etc.
  roomNumber: String,      // "R101", unique identifier
  description: String,
  pricePerNight: Number,   // In LKR
  capacity: Number,        // Max guests
  amenities: Array,        // ["Free WiFi", "Mountain View", etc.]
  images: [String],        // Cloudinary URLs
  isAvailable: Boolean
}
```

---

### 3. Booking Management (`/api/bookings`)

Handles guest reservations with availability checking.

| Operation | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| **Create** | POST | `/api/bookings/book` | Create new booking (guest) |
| **Read** | POST | `/api/bookings/check-availability` | Check room availability |
| **Read** | GET | `/api/bookings` | Get all bookings (admin) |
| **Read** | GET | `/api/bookings/user` | Get user's bookings (guest) |
| **Read** | GET | `/api/bookings/dashboard` | Get dashboard data (admin) |
| **Read** | GET | `/api/bookings/:id` | Get booking details |
| **Update** | PUT | `/api/bookings/:id` | Update booking |
| **Update** | PUT | `/api/bookings/:id/cancel` | Cancel booking |
| **Update** | PUT | `/api/bookings/:id/confirm` | Confirm booking (admin) |
| **Delete** | DELETE | `/api/bookings/:id` | Delete booking (admin) |

**Key Functions:**
```javascript
// bookingController.js
checkAvailabilityAPI()   // Check if room is available for dates
createBooking()          // Create booking with price calculation
getAllBookings()         // Admin: view all bookings
getUserBookings()        // Get authenticated user's bookings
getDashboardBookings()   // Admin dashboard with revenue stats
getBookingById(id)       // Get specific booking with authorization
updateBooking(id)        // Modify dates, guests, status
cancelBooking(id)        // Set status to 'cancelled'
confirmBooking(id)       // Admin confirms pending booking
deleteBooking(id)        // Permanently remove booking (admin)
```

**Availability Algorithm:**
```javascript
const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {
  // Find overlapping bookings (excluding cancelled/completed)
  const bookings = await Booking.find({
    room,
    checkInDate: { $lte: checkOutDate },
    checkOutDate: { $gte: checkInDate },
    status: { $nin: ["cancelled", "completed"] }
  });
  return bookings.length === 0; // Available if no overlaps
};
```

---

### 4. Review Management (`/api/reviews`)

Manages guest feedback with rating aggregation for Cloudy Hill Cottage.

| Operation | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| **Create** | POST | `/api/reviews` | Submit review after checkout (guest) |
| **Read** | GET | `/api/reviews` | Get all approved reviews (public) |
| **Read** | GET | `/api/reviews/cottage` | Get cottage reviews with stats |
| **Read** | GET | `/api/reviews/room/:id` | Get room reviews |
| **Read** | GET | `/api/reviews/user` | Get user's reviews (guest) |
| **Read** | GET | `/api/reviews/:id` | Get review details |
| **Update** | PUT | `/api/reviews/:id` | Update review (guest) |
| **Update** | PUT | `/api/reviews/:id/respond` | Admin responds to review |
| **Update** | POST | `/api/reviews/:id/helpful` | Mark review as helpful |
| **Delete** | DELETE | `/api/reviews/:id` | Delete review (guest/admin) |

**Key Functions:**
```javascript
// reviewController.js
createReview()         // Submit review (only after checkout date)
getAllReviews()        // Get approved reviews with cottage stats
getCottageReviews()    // Get reviews with aggregated ratings
getRoomReviews(id)     // Get room-specific reviews
getUserReviews()       // Get authenticated user's reviews
getReviewById(id)      // Get specific review
updateReview(id)       // Modify review (guest - own reviews only)
respondToReview(id)    // Admin adds response
markReviewHelpful()    // Increment helpful votes
deleteReview(id)       // Remove review (guest/admin)
```

**Review Schema Highlights:**
- Multiple rating categories (cleanliness, service, location, value, food)
- Admin response capability
- Helpful votes system
- Moderation status (isApproved)

---

### 5. Payment Management (`/api/payments`)

Handles transactions with refund capabilities.

| Operation | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| **Create** | POST | `/api/payments` | Create payment record (guest/admin) |
| **Read** | GET | `/api/payments` | Get all payments (admin) |
| **Read** | GET | `/api/payments/user` | Get user's payments (guest) |
| **Read** | GET | `/api/payments/dashboard` | Get payment stats (admin) |
| **Read** | GET | `/api/payments/booking/:id` | Get payment for booking |
| **Read** | GET | `/api/payments/:id` | Get payment details |
| **Update** | PUT | `/api/payments/:id` | Update payment (admin) |
| **Update** | PUT | `/api/payments/:id/confirm` | Confirm cash payment (admin) |
| **Update** | PUT | `/api/payments/:id/refund` | Process refund (admin) |
| **Delete** | DELETE | `/api/payments/:id` | Delete pending payment (admin) |

**Key Functions:**
```javascript
// paymentController.js
createPayment()          // Record payment (auto-complete for non-cash)
getAllPayments()         // Admin: view all transactions
getUserPayments()        // Get authenticated user's payments
getDashboardPayments()   // Admin dashboard with revenue stats
getPaymentByBooking()    // Get payment for specific booking
getPaymentById(id)       // Get transaction details
updatePayment(id)        // Modify payment info (admin)
confirmPayment(id)       // Admin confirms cash payment received
refundPayment(id)        // Process refund with reason (admin)
deletePayment(id)        // Remove pending/cancelled payment (admin)
```

---

### 6. Experience Management (`/api/experiences`)

Manages activities and packages at Cloudy Hill Cottage (cooking classes, hikes, adventures).

| Operation | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| **Create** | POST | `/api/experiences` | Add new experience (admin) |
| **Read** | GET | `/api/experiences` | Get active experiences (public) |
| **Read** | GET | `/api/experiences/admin/all` | Get all experiences (admin) |
| **Read** | GET | `/api/experiences/category/:cat` | Get by category |
| **Read** | GET | `/api/experiences/:id` | Get experience details |
| **Update** | PUT | `/api/experiences/:id` | Update experience (admin) |
| **Update** | PUT | `/api/experiences/:id/toggle` | Toggle active status (admin) |
| **Update** | PUT | `/api/experiences/:id/rating` | Update rating (admin) |
| **Delete** | DELETE | `/api/experiences/:id` | Delete experience (admin) |

**Key Functions:**
```javascript
// experienceController.js
createExperience()          // Add new activity/package (admin)
getAllExperiences()         // Admin: get all including inactive
getActiveExperiences()      // Get active experiences for guests
getExperiencesByCategory()  // Filter by category (cooking, adventure, etc.)
getExperienceById(id)       // Get specific experience details
updateExperience(id)        // Modify experience details (admin)
toggleExperienceStatus()    // Activate/deactivate experience (admin)
updateExperienceRating()    // Update rating after reviews (admin)
deleteExperience(id)        // Remove experience (admin)
```

**Experience Schema:**
```javascript
{
  name: String,              // "Traditional Cooking Class"
  description: String,       // Full description
  shortDescription: String,  // Max 200 chars for cards
  category: String,          // "cooking", "adventure", "nature", etc.
  duration: String,          // "3 hours", "Full day"
  price: Number,             // In LKR
  priceIncludes: [String],   // What's included
  maxParticipants: Number,   // Group size limit
  difficulty: String,        // "easy", "moderate", "challenging"
  highlights: [String],      // Key features
  whatToBring: [String],     // Guest preparation
  schedule: {
    startTime: String,       // "6:00 AM"
    endTime: String,         // "9:00 AM"
    availableDays: [String]  // ["Monday", "Wednesday", "Friday"]
  },
  images: [String],          // Cloudinary URLs
  isActive: Boolean,
  rating: Number,
  totalReviews: Number
}
```

**Experience Categories:**
- `cooking` - Traditional Sri Lankan cooking classes
- `adventure` - Hiking, trekking experiences
- `nature` - Bird watching, sunrise tours
- `cultural` - Local village visits
- `wellness` - Yoga, meditation sessions
- `photography` - Scenic photography tours

---

## 🤖 AI Integration & Problem Solving

### AI System Components (Powered by LangGraph)

The AI system uses **LangGraph** to orchestrate multiple specialized agents in a stateful workflow. LangGraph enables:
- **Conditional branching** based on detected intent
- **State persistence** across conversation turns
- **Cyclic flows** for multi-round negotiations

```
┌─────────────────────────────────────────────────────────────────┐
│              SmartStay AI System (LangGraph Workflow)           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   LANGGRAPH ORCHESTRATOR                  │  │
│  │  (langgraph_workflow.py - StateGraph with conditionals)  │  │
│  └──────────────────────────────────────────────────────────┘  │
│           │                       │                             │
│           ▼                       ▼                             │
│  ┌─────────────────┐     ┌─────────────────┐                   │
│  │   RAG Engine    │     │   Knowledge     │                   │
│  │   (ChromaDB)    │────▶│     Graph       │                   │
│  │                 │     │   (GraphRAG)    │                   │
│  └────────┬────────┘     └────────┬────────┘                   │
│           │                       │                             │
│           ▼                       ▼                             │
│  ┌─────────────────────────────────────────┐                   │
│  │              Ollama LLM (Llama2)         │                   │
│  │         Natural Language Processing      │                   │
│  └─────────────────────────────────────────┘                   │
│           │                       │                             │
│           ▼                       ▼                             │
│  ┌─────────────────┐     ┌─────────────────┐                   │
│  │   Sentiment     │     │   Negotiator    │                   │
│  │    Analyzer     │     │     Agent       │                   │
│  │   (NLP/Rules)   │     │  (Game Theory)  │                   │
│  └─────────────────┘     └─────────────────┘                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key LangGraph Implementation:** `ai-service/langgraph_workflow.py`

### 1. Sentiment Analysis Agent

**Problem Solved:** Traditional chatbots provide uniform responses regardless of guest emotional state, leading to escalated frustrations.

**Solution:** Real-time sentiment detection that adapts response tone and offers appropriate compensation.

```python
class SentimentAnalyzer:
    def analyze_sentiment(self, text: str) -> Tuple[str, float]:
        """
        Analyzes text and returns sentiment classification
        
        Returns:
        - sentiment: "positive", "negative", "neutral", "angry"
        - score: -2.0 to +2.0
        """
        
        # 1. Check negation phrases first
        for phrase in self.negation_phrases:
            if phrase in text_lower:
                score -= 1.5  # Strong negative signal
        
        # 2. Count sentiment keywords
        for word, value in self.negative_words.items():
            if word in text_lower:
                score += value
        
        # 3. Detect intensity markers (!, !!)
        if "!" in text and score < 0:
            score *= 1.3  # Amplify negative emotions
        
        # 4. Classify sentiment
        if score >= 1:    return ("positive", score)
        elif score <= -1.5: return ("angry", score)
        elif score < -0.5:  return ("negative", score)
        else:               return ("neutral", score)
```

**Sentiment-Adaptive Response Strategy:**

| Sentiment | Response Strategy | Compensation Level |
|-----------|-------------------|-------------------|
| 😊 Positive | Enthusiastic, encourage reviews | None |
| 🤖 Neutral | Professional, informative | None |
| 😟 Negative | Empathetic, offer solutions | Level 1-2 |
| 🚨 Angry/Crisis | De-escalate, immediate action | Level 3-4 |

### 2. Negotiation Agent (Game Theory)

**Problem Solved:** Fixed pricing doesn't maximize revenue during low occupancy or accommodate budget-conscious guests.

**Solution:** Dynamic pricing negotiation using Game Theory principles.

```python
class NegotiatorAgent:
    def negotiate_price(self, room_type, guest_offer, loyalty_status):
        """
        Game Theory-based price negotiation
        
        Strategy: Stackelberg Game Model
        - Hotel (Leader): Sets price bounds based on occupancy
        - Guest (Follower): Makes offer within perceived range
        """
        
        # Get current market conditions
        occupancy_rate = self.get_occupancy_rate()
        occupancy_tier = self.get_occupancy_tier(occupancy_rate)
        
        # Calculate minimum acceptable price
        base_price = self.base_prices[room_type]
        min_price = self.minimum_prices[room_type]
        
        # Adjust based on occupancy (dynamic floor)
        if occupancy_tier == 1:      # Critical Low (<25%)
            dynamic_min = min_price * 0.85  # More flexible
        elif occupancy_tier == 2:    # Low (25-50%)
            dynamic_min = min_price * 0.95
        elif occupancy_tier == 3:    # Good (50-80%)
            dynamic_min = min_price
        else:                        # Full (>80%)
            dynamic_min = base_price  # No negotiation
        
        # Apply loyalty bonuses
        if loyalty_status == "gold":
            dynamic_min *= 0.90  # 10% additional discount
        
        # Decision logic
        if guest_offer >= base_price:
            return {"decision": "accept", "final_price": guest_offer}
        elif guest_offer >= dynamic_min:
            counter = (guest_offer + base_price) / 2
            return {"decision": "counter", "counter_offer": counter}
        else:
            return {"decision": "reject", "minimum": dynamic_min}
```

### 3. GraphRAG Recommendation Engine

**Problem Solved:** Text-based search fails to understand relationships between entities (e.g., "romantic dinner near hiking trail").

**Solution:** Knowledge Graph + RAG for contextual, relationship-aware recommendations.

```python
class KnowledgeGraph:
    def __init__(self):
        self.graph = nx.DiGraph()
        self._initialize_graph()
    
    def _initialize_graph(self):
        """Build knowledge graph with entities and relationships"""
        
        # Add entities
        self.graph.add_node("Ella Rock", type="attraction", 
                          difficulty="moderate", duration="3-4 hours")
        self.graph.add_node("Nine Arch Bridge", type="attraction",
                          best_time="6:00 AM", distance_km=6)
        self.graph.add_node("Cooking Class", type="activity",
                          includes=["3 curries", "yellow rice", "sambal"])
        
        # Add relationships
        self.graph.add_edge("Cloudy Hill Cottage", "Ella Rock",
                          relation="provides_directions", distance_km=6)
        self.graph.add_edge("Cooking Class", "Jackfruit Curry",
                          relation="teaches")
        self.graph.add_edge("Sunrise View", "Balcony",
                          relation="visible_from")
    
    def query_itinerary(self, preferences: dict) -> List[dict]:
        """
        Query graph for personalized recommendations
        
        Uses:
        - Shortest path algorithms for distance optimization
        - Node attribute filtering for preference matching
        - Relationship traversal for contextual suggestions
        """
        recommendations = []
        
        if preferences.get("romantic"):
            # Find paths that include romantic-tagged nodes
            romantic_nodes = [n for n, d in self.graph.nodes(data=True)
                           if d.get("romantic", False)]
            # Build itinerary connecting romantic spots
            ...
        
        return recommendations
```

### 4. RAG (Retrieval-Augmented Generation)

**Problem Solved:** LLMs have limited knowledge and may hallucinate hotel-specific information.

**Solution:** Ground LLM responses in verified hotel documentation.

```python
# Document Processing Pipeline
def build_knowledge_base():
    """
    1. Load documents (hotel info, policies, FAQs)
    2. Split into chunks (500 chars, 50 overlap)
    3. Generate embeddings (HuggingFace all-MiniLM-L6-v2)
    4. Store in ChromaDB vector database
    """
    
    documents = DirectoryLoader("./data/docs", glob="**/*.md").load()
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    chunks = text_splitter.split_documents(documents)
    
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    
    db = Chroma.from_documents(chunks, embeddings, 
                               persist_directory="./chroma")
    return db

# Query Pipeline
def answer_query(user_question: str):
    """
    1. Embed user question
    2. Find similar document chunks
    3. Include context in LLM prompt
    4. Generate grounded response
    """
    
    relevant_docs = db.similarity_search(user_question, k=3)
    context = "\n\n".join([doc.page_content for doc in relevant_docs])
    
    prompt = f"""Based on this hotel information:
    {context}
    
    Answer the guest's question: {user_question}
    """
    
    return llm.invoke(prompt)
```

---

## 📚 Theoretical Foundations

### 1. Game Theory - Stackelberg Competition Model

**Application:** Dynamic price negotiation between hotel and guest.

**Theory:**
- **Stackelberg Game:** A strategic game where one player (leader) moves first, and the other (follower) responds.
- **Nash Equilibrium:** The stable state where neither party can improve by changing strategy unilaterally.

**Implementation:**

```
Hotel (Leader)                    Guest (Follower)
     │                                  │
     │  1. Set price bounds             │
     │     based on:                    │
     │     - Occupancy rate             │
     │     - Season                     │
     │     - Loyalty status             │
     │                                  │
     ▼                                  │
┌─────────────────┐                     │
│ Base: $80/night │                     │
│ Min:  $60/night │                     │
│ Dynamic: $55    │                     │
└────────┬────────┘                     │
         │                              │
         │  2. Communicate range        │
         │────────────────────────────▶│
         │                              │
         │                              │ 3. Make offer
         │                              │    considering:
         │                              │    - Budget
         │                              │    - Perceived value
         │                              │    - Alternatives
         │                              ▼
         │                    ┌─────────────────┐
         │                    │ Offer: $65/night│
         │◀───────────────────┤                 │
         │                    └─────────────────┘
         │
         │ 4. Evaluate & respond
         ▼
   ┌───────────┐
   │  Accept   │ (if offer ≥ base)
   ├───────────┤
   │  Counter  │ (if min ≤ offer < base)
   ├───────────┤
   │  Reject   │ (if offer < min)
   └───────────┘
```

**Payoff Matrix:**

| | Guest Accepts | Guest Rejects |
|---|---|---|
| **Hotel Accepts** | (Hotel: revenue, Guest: room) | N/A |
| **Hotel Counters** | (Hotel: higher rev, Guest: room) | (Both: 0) |
| **Hotel Rejects** | N/A | (Both: 0) |

### 2. Human-Computer Interaction (HCI)

**Application:** Emotion-adaptive chatbot interface.

**Principles Applied:**

#### a) Norman's Emotional Design (3 Levels)

| Level | Implementation |
|-------|----------------|
| **Visceral** | Color-coded themes (green=happy, amber=concerned, red=crisis) |
| **Behavioral** | Quick action buttons, typing indicators, smooth animations |
| **Reflective** | Personalized responses, empathy statements, follow-up care |

#### b) Affective Computing (Picard, 1997)

```
User Input → Sentiment Analysis → Emotional State Detection → Adaptive Response
     │              │                     │                        │
     │         ┌────┴────┐          ┌─────┴─────┐            ┌─────┴─────┐
     │         │ Lexicon │          │ positive  │            │ Enthusiast│
     │         │ Analysis│          │ negative  │            │ Empathetic│
     │         │ Negation│          │ neutral   │            │ Urgent    │
     │         │ Detect  │          │ angry     │            │ Crisis    │
     │         └─────────┘          └───────────┘            └───────────┘
```

#### c) Usability Heuristics (Nielsen)

| Heuristic | Implementation |
|-----------|----------------|
| Visibility of system status | "AI Concierge Online" indicator, typing animation |
| Match real world | Natural language, emoji, conversational tone |
| User control | Clear chat, close button, quick actions |
| Error prevention | Input validation, fallback responses |
| Recognition over recall | Quick action buttons for common queries |

### 3. Natural Language Processing (NLP)

**Application:** Intent detection, entity extraction, sentiment analysis.

**Techniques:**

```python
# Intent Classification (Rule-based + Keyword)
def detect_intent(text: str) -> str:
    """
    Multi-class intent classification
    
    Classes:
    - negotiation: Price-related queries
    - complaint: Issues and problems
    - recommendation: Activity/restaurant queries
    - booking: Reservation queries
    - general_info: Everything else
    """
    
    # Keyword-based classification
    if any(word in text for word in ["price", "cost", "discount"]):
        return "negotiation"
    
    if sentiment_analyzer.is_complaint(text):
        return "complaint"
    
    # ... more rules
    
    return "general_info"
```

### 4. Information Retrieval (IR)

**Application:** RAG system for grounding LLM responses.

**Techniques:**

#### Vector Similarity Search

```python
# Embedding: Text → Dense Vector (384 dimensions)
# Model: sentence-transformers/all-MiniLM-L6-v2

def similarity_search(query: str, k: int = 3):
    """
    1. Embed query using same model as documents
    2. Compute cosine similarity with all document embeddings
    3. Return top-k most similar documents
    
    Similarity(A, B) = (A · B) / (||A|| × ||B||)
    """
    query_embedding = embed(query)
    
    results = []
    for doc in documents:
        similarity = cosine_similarity(query_embedding, doc.embedding)
        results.append((doc, similarity))
    
    return sorted(results, key=lambda x: x[1], reverse=True)[:k]
```

### 5. Knowledge Graphs

**Application:** GraphRAG for relationship-aware recommendations.

**Theory:** Semantic networks representing entities and their relationships.

```
                    ┌─────────────┐
                    │ Cloudy Hill │
                    │   Cottage   │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │  Ella Rock  │ │   Cooking   │ │   Sunrise   │
    │  (6km away) │ │    Class    │ │    View     │
    └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
           │               │               │
           │               ▼               │
           │        ┌─────────────┐        │
           │        │  Jackfruit  │        │
           │        │    Curry    │        │
           │        └─────────────┘        │
           │                               │
           ▼                               ▼
    ┌─────────────┐                 ┌─────────────┐
    │ Nine Arch   │                 │   Balcony   │
    │   Bridge    │◀───────────────▶│    Room     │
    └─────────────┘  (view from)    └─────────────┘
```

---

## 🌟 Novelty & Innovation

### 1. Emotion-Adaptive UI (Novel Contribution)

**Innovation:** The chatbot UI dynamically changes its entire visual theme based on detected user sentiment.

| Sentiment | Theme | Visual Changes |
|-----------|-------|----------------|
| Positive | Green gradient | Celebratory icons, uplifting colors |
| Neutral | Blue gradient | Professional, calm appearance |
| Negative | Amber gradient | Concerned tone, solution-focused |
| Crisis | Red gradient + banner | Emergency mode, priority support |

**Why Novel:** Most chatbots have static UI regardless of conversation tone. Our system provides visual feedback that validates user emotions.

### 2. Integrated Negotiation in Conversation (Novel Contribution)

**Innovation:** Price negotiation happens naturally within the conversation flow, not through a separate interface.

```
User: "Can I get the deluxe room for $60?"
Bot:  "I appreciate your interest! Our Deluxe Room is normally $80/night.
       Given our current availability, I can offer it at $68/night.
       Would that work for you? 😊"
       
       [Accept $68] [Counter Offer] [See Other Rooms]
```

**Why Novel:** Traditional booking systems have fixed prices or require contacting sales. Our system enables real-time, conversational negotiation.

### 3. Crisis Auto-Escalation (Novel Contribution)

**Innovation:** Automatic detection and escalation of critical issues without human intervention.

```python
# Automatic escalation triggers
if sentiment == "angry" or severity == "critical":
    is_crisis_mode = True
    
    # Actions:
    # 1. Change UI to crisis theme
    # 2. Enable maximum compensation authority
    # 3. Log for management review
    # 4. Offer direct manager callback
```

**Why Novel:** Most systems require guests to explicitly request manager/escalation. Our system proactively identifies crises and responds appropriately.

### 4. GraphRAG for Local Recommendations (Novel Contribution)

**Innovation:** Combining Knowledge Graphs with RAG for contextually-aware local recommendations.

**Example:**
```
User: "What should I do this morning before checkout?"

GraphRAG Analysis:
- Time constraint: morning
- Activity type: before checkout (light activity)
- Relationships: 
  - Sunrise → best at 6 AM → visible from room balcony
  - Nine Arch Bridge → best at 6 AM → 6km away
  - Cooking Class → 2-3 hours → can do morning

Response: "Since you're checking out, I'd recommend watching the sunrise 
from your balcony at 6 AM - it's spectacular! Alternatively, if you wake 
early, the Nine Arch Bridge is magical at sunrise (6 AM train crossing). 
The cooking class is also possible if you have 2-3 hours."
```

### 5. Multi-Agent Architecture with LangGraph (Novel Contribution)

**Innovation:** Specialized AI agents orchestrated by **LangGraph** that collaborate to handle different aspects of guest interaction.

**Why LangGraph?**
- **Stateful Workflows:** Maintains conversation context across multiple agent interactions
- **Conditional Routing:** Dynamically routes to appropriate agents based on intent detection
- **Cyclic Graphs:** Supports iterative negotiation flows and multi-turn conversations
- **Built-in Persistence:** Manages session state for each user conversation

```
                    ┌──────────────────────────────────┐
                    │         LANGGRAPH WORKFLOW       │
                    │                                  │
                    │    ┌─────────────────┐          │
                    │    │  Intent Router  │          │
                    │    │   (detect_intent_node)     │
                    │    └────────┬────────┘          │
                    │             │                    │
                    │  ┌──────────┼──────────┐        │
                    │  │          │          │        │
                    │  ▼          ▼          ▼        │
                    │ ┌────┐   ┌────┐   ┌────┐       │
                    │ │Sent│   │Nego│   │Graph│       │
                    │ │iment│   │tiate│   │RAG │       │
                    │ │Agent│   │Agent│   │Agent│       │
                    │ └──┬─┘   └──┬─┘   └──┬─┘       │
                    │    │        │        │          │
                    │    └────────┼────────┘          │
                    │             ▼                    │
                    │    ┌─────────────────┐          │
                    │    │ Response Node   │          │
                    │    │ (Ollama LLM)    │          │
                    │    └─────────────────┘          │
                    └──────────────────────────────────┘
```

**LangGraph State Schema:**
```python
class ConversationState(TypedDict):
    messages: List[str]
    current_intent: str      # "general", "negotiation", "complaint", "recommendation"
    sentiment: str           # "positive", "neutral", "negative"
    sentiment_score: float   # -2.0 to +2.0
    negotiation_data: dict   # Price offers, counter-offers
    crisis_mode: bool        # Escalation flag
    user_context: dict       # Loyalty status, booking history
```

---

## 🛠 Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| React Router | Navigation |
| Clerk React | Authentication |
| React Hot Toast | Notifications |
| Axios | HTTP Client |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Web Framework |
| MongoDB | Database |
| Mongoose | ODM |
| Clerk Express | Auth Middleware |
| Cloudinary | Image Storage |
| Multer | File Upload |

### AI Service
| Technology | Purpose |
|------------|---------|
| Python 3.10 | Runtime |
| FastAPI | API Framework |
| **LangGraph** | **Multi-Agent Workflow Orchestration** |
| LangChain | LLM Integration & Tools |
| Ollama | Local LLM (Llama2) |
| ChromaDB | Vector Database (RAG) |
| HuggingFace | Sentence Embeddings |
| NetworkX | Knowledge Graph (GraphRAG) |

> **Note:** LangGraph is the core framework powering our multi-agent AI system. It orchestrates the flow between Sentiment Analysis Agent, Negotiation Agent, and GraphRAG Engine based on detected user intent.

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB Atlas account
- Ollama installed locally
- Cloudinary account
- Clerk account

### 1. Clone Repository

```bash
git clone https://github.com/DularaMadhusanka/Hotel-Booking-System.git
cd Hotel-Booking-System
```

### 2. Backend Setup

```bash
cd server
npm install

# Create .env file
cat > .env << EOF
PORT=3000
MONGO_URI=mongodb+srv://...
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
AI_API_URL=http://localhost:8000
EOF

npm run server
```

### 3. Frontend Setup

```bash
cd client
npm install

# Create .env file
cat > .env << EOF
VITE_BACKEND_URL=http://localhost:3000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_CURRENCY=$
EOF

npm run dev
```

### 4. AI Service Setup

```bash
cd ai-service

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Start Ollama (in separate terminal)
ollama serve

# Pull Llama2 model
ollama pull llama2

# Build knowledge base
python rebuild_database.py

# Start AI server
python api_server.py
```

### 5. Access Application

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- AI Service: http://localhost:8000

### 6. Seed Database (Optional)

To populate the database with sample rooms and experiences:

```bash
cd server
npm run seed
```

This will create:
- 6 sample rooms (Standard, Deluxe, Family Suite, Honeymoon Suite)
- 6 sample experiences (Cooking Class, Ella Rock Hike, Nine Arch Bridge Tour, etc.)

### 7. Create Admin User

After registering a user through the app, make them an admin by running this in MongoDB:

```javascript
// Using MongoDB Compass or mongosh
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

Or use the MongoDB Atlas UI:
1. Go to your cluster > Browse Collections
2. Find the `users` collection
3. Find your user document
4. Click Edit and change `role` from `"guest"` to `"admin"`
5. Save changes

After becoming an admin, you can:
- Access the admin dashboard at `/admin`
- Add/edit/delete rooms
- Manage experiences
- View all bookings and payments
- Respond to reviews

---

## 📖 API Documentation

### AI Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/chat` | POST | Main chat endpoint |
| `/api/ai/negotiate` | POST | Direct negotiation |
| `/api/ai/sentiment` | POST | Sentiment analysis |
| `/api/ai/recommend` | POST | Get recommendations |
| `/api/ai/occupancy` | GET | Get occupancy data |
| `/api/ai/health` | GET | Health check |

### Chat Request Example

```json
POST /api/ai/chat
{
  "message": "I'm not satisfied with my room",
  "userId": "user_123",
  "loyaltyStatus": "gold",
  "sessionId": "session_abc"
}
```

### Chat Response Example

```json
{
  "success": true,
  "response": "I'm truly sorry to hear that...",
  "sentiment": "negative",
  "sentimentScore": -1.5,
  "intent": "complaint",
  "isCrisisMode": false,
  "negotiationData": null
}
```

---

## 👥 Team Distribution

<div align="center">
    <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/People%20Holding%20Hands.png" alt="Team" width="34" height="34" />
    <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Clipboard.png" alt="Modules" width="34" height="34" />
    <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Brain.png" alt="AI" width="34" height="34" />
</div>

| Student ID | Team Member | Module Ownership |
|------------|-------------|------------------|
| IT24104118 | Jayakody J.A.B.S. | User Management |
| IT24101566 | Madhusanka K.B.D. | Review Management / AI Integration |
| IT24100738 | Udawaththa D.D.E | Experience Management |
| IT23286146 | Ayendri V.L. | Room Management |
| IT24102954 | Vaathuman G. | Booking Management |
| IT24103124 | Walawwaththage H.D.N. | Payment Management |

---

## 👥 Contributors

### Group Project Ownership

This repository represents a collaborative academic group project delivered by a 6-member development team.

### Shared Engineering Contributions

- End-to-end MERN application implementation
- Multi-agent AI service integration (LangGraph workflow, sentiment, negotiation, GraphRAG)
- Repository-wide testing, debugging, and refactoring
- API hardening, validation updates, and quality improvements

---

## 📄 License

MIT License - See LICENSE file for details.

---

## 🙏 Acknowledgments

- **Cloudy Hill Cottage, Ella** - For inspiring this project
- **Ollama** - For local LLM inference
- **LangChain** - For LLM orchestration
- **Clerk** - For authentication services

---
