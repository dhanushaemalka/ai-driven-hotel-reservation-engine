# Negotiation Agent Documentation

## Cloudy Hill Cottage - AI-Powered Price Negotiation System

**Version:** 1.0  
**Last Updated:** February 2026  
**Author:** Hotel Booking System Development Team

---

## Table of Contents

1. [Overview](#1-overview)
2. [Theoretical Foundations](#2-theoretical-foundations)
3. [System Architecture](#3-system-architecture)
4. [Python Files & Components](#4-python-files--components)
5. [Mathematical Models](#5-mathematical-models)
6. [Decision Algorithm](#6-decision-algorithm)
7. [Natural Language Processing](#7-natural-language-processing)
8. [State Management](#8-state-management)
9. [Technologies Used](#9-technologies-used)
10. [API Integration](#10-api-integration)
11. [Testing & Examples](#11-testing--examples)

---

## 1. Overview

The Negotiation Agent is an AI-powered system that handles dynamic price negotiations for hotel room bookings. It simulates human-like bargaining while protecting business interests through:

- **Dynamic pricing** based on real-time occupancy
- **Multi-turn conversation** memory for context-aware negotiation
- **Value-based selling** through add-on offerings
- **Sentiment detection** for price complaints
- **Loyalty recognition** for returning guests

### Key Features

| Feature | Description |
|---------|-------------|
| Dynamic Pricing | Adjusts acceptable prices based on occupancy tiers |
| Multi-Turn Memory | Remembers room type and previous offers across messages |
| Value-Add Strategy | Offers complimentary services instead of pure discounts |
| Long-Stay Discounts | Proactive offers for extended bookings (5+ nights) |
| Review Incentives | Additional flexibility for guests promising reviews |
| Graceful Exits | Handles abandonment and acceptance signals |

---

## 2. Theoretical Foundations

### 2.1 Game Theory - Negotiation as a Sequential Game

The negotiation agent implements concepts from **cooperative game theory** and **bargaining theory**.

#### Nash Bargaining Solution (Inspiration)

The system's pricing logic is inspired by the Nash Bargaining Solution, which finds an optimal agreement point between two parties:

```
Maximize: (U_guest - d_guest) × (U_hotel - d_hotel)

Where:
- U_guest = Guest's utility from the deal
- U_hotel = Hotel's utility (revenue)
- d_guest = Guest's disagreement point (walk away)
- d_hotel = Hotel's disagreement point (minimum acceptable price)
```

**Implementation:** The agent has a hidden "minimum price" (disagreement point) that it will not go below, while trying to maximize revenue within acceptable bounds.

#### Zone of Possible Agreement (ZOPA)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Guest's Max ◄──────── ZOPA ────────► Hotel's Min          │
│     Budget              │              Price                │
│                         │                                   │
│                    Agreement                                │
│                      Zone                                   │
└─────────────────────────────────────────────────────────────┘
```

The agent finds deals within the ZOPA by:
1. Extracting the guest's offer (their position)
2. Comparing against minimum acceptable price
3. Finding a mutually beneficial middle ground

### 2.2 Behavioral Economics

#### Anchoring Effect

The system uses **price anchoring** by displaying base prices first:
```
"Standard Room - from LKR 8,500/night"
```
This establishes a reference point that influences guest offers.

#### Loss Aversion

When occupancy is low, the system emphasizes what guests **gain** rather than what they save:
```
"I can do LKR 9,000/night AND include breakfast plus late checkout (worth LKR 3,500)!"
```

#### Reciprocity Principle

When guests promise reviews or referrals, the system reciprocates with a 5% discount:
```python
if has_review_promise and loyalty_status == "none":
    effective_loyalty = "referral"  # 5% bonus
```

### 2.3 Revenue Management Theory

The pricing strategy follows **yield management** principles:

```
Optimal Price = f(Demand, Capacity, Time, Segmentation)
```

**Implemented as:**
- **Demand Proxy:** Occupancy rate from database
- **Capacity:** Fixed room inventory (4 room types)
- **Time Factor:** Seasonal adjustments via occupancy tiers
- **Segmentation:** Loyalty status differentiation

---

## 3. System Architecture

### 3.1 Component Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           LANGGRAPH WORKFLOW                              │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                                                                     │ │
│  │   User Input ──► Intent Classifier ──► Negotiation Node            │ │
│  │                         │                    │                      │ │
│  │                         ▼                    ▼                      │ │
│  │              ┌──────────────────┐   ┌──────────────────┐           │ │
│  │              │  Other Intents   │   │  NegotiatorAgent │           │ │
│  │              │  - general_info  │   │  ┌────────────┐  │           │ │
│  │              │  - recommendation│   │  │ Price      │  │           │ │
│  │              │  - complaint     │   │  │ Extraction │  │           │ │
│  │              │  - crisis        │   │  ├────────────┤  │           │ │
│  │              └──────────────────┘   │  │ Occupancy  │  │           │ │
│  │                                     │  │ Calculator │  │           │ │
│  │                                     │  ├────────────┤  │           │ │
│  │                                     │  │ Decision   │  │           │ │
│  │                                     │  │ Engine     │  │           │ │
│  │                                     │  └────────────┘  │           │ │
│  │                                     └──────────────────┘           │ │
│  │                                              │                      │ │
│  │                                              ▼                      │ │
│  │                                     ┌──────────────────┐           │ │
│  │                                     │  LLM Response    │           │ │
│  │                                     │  Generator       │           │ │
│  │                                     │  (Ollama/Llama2) │           │ │
│  │                                     └──────────────────┘           │ │
│  │                                              │                      │ │
│  │                                              ▼                      │ │
│  │                                        Response                     │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Data Flow

```
1. User Message: "Can I get the deluxe room for 9000 LKR?"
        │
        ▼
2. Intent Classification ──► "negotiation"
        │
        ▼
3. Price Extraction: room_type="deluxe", price=9000
        │
        ▼
4. State Retrieval: Get previous negotiation context
        │
        ▼
5. Occupancy Check: Query ChromaDB for current rate
        │
        ▼
6. Decision Engine:
   - Compare offer vs. minimum price (10,000 LKR)
   - Apply occupancy tier discounts
   - Apply loyalty bonuses
        │
        ▼
7. Decision: "counter" with LKR 10,500
        │
        ▼
8. Response Generation: LLM creates natural response
        │
        ▼
9. State Update: Save round, offers, decision
        │
        ▼
10. Return Response + Metadata
```

---

## 4. Python Files & Components

### 4.1 File Structure

```
ai-service/
├── negotiator_agent.py      # Core negotiation logic
├── langgraph_workflow.py    # Workflow orchestration
├── api_server.py            # FastAPI endpoints
├── knowledge_base.py        # ChromaDB integration
└── NEGOTIATION_AGENT_DOCUMENTATION.md
```

### 4.2 `negotiator_agent.py` - Core Logic

**Purpose:** Contains the `NegotiatorAgent` class with all pricing logic.

| Method | Description |
|--------|-------------|
| `__init__()` | Initialize price tables, value-adds, currency |
| `extract_room_type_and_price()` | NLP to parse user offers |
| `get_occupancy_rate()` | Query database for current occupancy |
| `get_occupancy_tier()` | Map occupancy to discount tier (1-4) |
| `get_loyalty_discount()` | Calculate loyalty-based discounts |
| `calculate_max_discount()` | Determine maximum allowed discount |
| `negotiate_price()` | Main decision engine |
| `generate_system_prompt()` | Create context for LLM |

**Key Data Structures:**

```python
# Minimum acceptable prices (hidden from guests) - in LKR
minimum_prices = {
    "standard": 6500,
    "deluxe": 10000,
    "family": 15000,
    "honeymoon": 20000
}

# Base/Published rates - in LKR
base_prices = {
    "standard": 8500,
    "deluxe": 12500,
    "family": 18000,
    "honeymoon": 25000
}

# Value-add options (in LKR)
value_adds = {
    "breakfast": 1500,
    "cooking_class": 4500,
    "late_checkout": 2000,
    "bicycle": 2000,
    "packed_lunch": 1000,
    "airport_pickup": 0
}
```

### 4.3 `langgraph_workflow.py` - Orchestration

**Purpose:** Manages conversation flow, state persistence, and node routing.

| Function | Description |
|----------|-------------|
| `classify_intent()` | Determine if message is negotiation-related |
| `negotiation_node()` | Handle negotiation turns with state |
| `detect_price_complaint()` | Identify budget concerns |
| `detect_review_promise()` | Identify referral/review offers |
| `detect_long_stay()` | Identify extended booking requests |

**State Schema (TypedDict):**

```python
class ConversationState(TypedDict):
    user_input: str
    conversation_history: List[Dict]
    user_context: Dict
    loyalty_status: str
    sentiment: Dict
    intent: str
    response: str
    crisis_detected: bool
    negotiation: Dict  # Negotiation-specific state
    response_metadata: Dict
```

**Negotiation State Structure:**

```python
negotiation = {
    "round": 0,              # Current negotiation round
    "room_type": None,       # Selected room type
    "initial_offer": None,   # Guest's first price offer
    "current_offer": None,   # Guest's latest offer
    "counter_offers": [],    # History of all offers
    "final_price": None,     # Agreed price (if accepted)
    "add_ons": [],           # Complimentary services offered
    "status": "inactive"     # inactive|active|accepted|rejected|abandoned
}
```

---

## 5. Mathematical Models

### 5.1 Pricing Boundaries

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRICE SPECTRUM                          │
│                                                                 │
│   Minimum      Maximum         Base          Guest's            │
│   Price       Discount       Price          Offer               │
│     │           │              │              │                 │
│     ▼           ▼              ▼              ▼                 │
│ ────┼───────────┼──────────────┼──────────────┼────────────►   │
│    6,500      7,000          8,500         9,000    (LKR)      │
│     │           │              │              │                 │
│     │◄─────────►│◄────────────►│              │                 │
│     │  Reject   │  Negotiable  │              │                 │
│     │   Zone    │    Zone      │              │                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Maximum Discount Calculation

```python
def calculate_max_discount(occupancy_tier: int) -> float:
    """
    Maximum Discount = f(Occupancy Tier)
    
    Tier 1 (≤30% occupancy): Up to 30% off
    Tier 2 (31-60% occupancy): Up to 20% off
    Tier 3 (61-85% occupancy): Up to 10% off
    Tier 4 (>85% occupancy): No discount
    """
    max_discounts = {
        1: 0.30,  # Very low - desperate
        2: 0.20,  # Low - flexible
        3: 0.10,  # Good - limited
        4: 0.00   # Full - none
    }
    return max_discounts.get(occupancy_tier, 0.0)
```

### 5.3 Effective Minimum Price Formula

```
Effective_Min = Base_Price × (1 - Max_Discount - Loyalty_Discount)

Example (Deluxe Room, Tier 1, Returning Guest):
Effective_Min = 12,500 × (1 - 0.30 - 0.10)
Effective_Min = 12,500 × 0.60
Effective_Min = 7,500 LKR
```

### 5.4 Loyalty Discount Table

| Status | Discount | Trigger |
|--------|----------|---------|
| `none` | 0% | New guest |
| `returning` | 10% | Booked before |
| `extended` | 10% | 3-4 nights |
| `long_stay` | 15% | 7+ nights |
| `referral` | 5% | Review promise |

### 5.5 Long-Stay Discount Formula

```python
def calculate_long_stay_discount(nights: int) -> float:
    """
    Nights ≥ 7: 15% discount
    Nights 5-6: 10% discount
    Nights 3-4: Negotiable (case by case)
    Nights 1-2: No automatic discount
    """
    if nights >= 7:
        return 0.15
    elif nights >= 5:
        return 0.10
    return 0.0
```

### 5.6 Value-Add Compensation Formula

When the guest offer is below base price but above minimum:

```
Total_Value = Guest_Offer + Σ(Value_Add_i)

Example:
Guest offers: 9,000 LKR
Value-adds offered: breakfast (1,500) + late_checkout (2,000)
Total_Value = 9,000 + 3,500 = 12,500 LKR (equivalent to base price)
```

---

## 6. Decision Algorithm

### 6.1 Decision Tree

```
                         Guest Offer Received
                                │
                                ▼
                    ┌───────────────────────┐
                    │ Offer ≥ Base Price?   │
                    └───────────────────────┘
                          │           │
                         YES          NO
                          │           │
                          ▼           ▼
                     ┌────────┐  ┌─────────────────────┐
                     │ ACCEPT │  │ Offer ≥ Min Price   │
                     │ at Base│  │ AND ≥ Max Offer?    │
                     └────────┘  └─────────────────────┘
                                      │           │
                                     YES          NO
                                      │           │
                                      ▼           ▼
                                 ┌────────┐  ┌─────────────────────┐
                                 │ ACCEPT │  │ Offer > Min Price   │
                                 │ at     │  │ AND Tier ≤ 2?       │
                                 │ Offer  │  └─────────────────────┘
                                 └────────┘       │           │
                                                 YES          NO
                                                  │           │
                                                  ▼           ▼
                                        ┌───────────────┐  ┌─────────────┐
                                        │ COUNTER with  │  │ Offer ≥     │
                                        │ Value-Adds    │  │ Min Price?  │
                                        └───────────────┘  └─────────────┘
                                                                │      │
                                                               YES     NO
                                                                │      │
                                                                ▼      ▼
                                                        ┌─────────┐ ┌──────────┐
                                                        │ COUNTER │ │ Tier 1?  │
                                                        │ +1,500  │ └──────────┘
                                                        └─────────┘     │    │
                                                                       YES   NO
                                                                        │    │
                                                                        ▼    ▼
                                                              ┌─────────────┐ ┌────────┐
                                                              │ COUNTER at  │ │ REJECT │
                                                              │ Min + Addons│ └────────┘
                                                              └─────────────┘
```

### 6.2 Decision Outcomes

| Decision | Condition | Action |
|----------|-----------|--------|
| `accept` | Offer ≥ Base Price | Accept at base price (don't overcharge) |
| `accept` | Offer ≥ Min AND ≥ Max Offer | Accept at offered price |
| `counter_with_addons` | Offer > Min AND Low Occupancy | Accept offer + free services |
| `counter` | Offer ≥ Min | Counter at offer + 1,500 LKR |
| `counter_with_addons` | Very Low Occupancy (Tier 1) | Offer min price + generous add-ons |
| `reject` | Offer < Min AND High Occupancy | Politely decline |

### 6.3 Implementation Code

```python
def negotiate_price(self, room_type, guest_offer, loyalty_status="none"):
    # Get context
    occupancy_rate = self.get_occupancy_rate()
    occupancy_tier = self.get_occupancy_tier(occupancy_rate)
    base_price = self.base_prices.get(room_type)
    min_price = self.minimum_prices.get(room_type)
    loyalty_discount = self.get_loyalty_discount(loyalty_status)
    max_negotiable_discount = self.calculate_max_discount(occupancy_tier)
    
    # Calculate floor
    max_offer = base_price * (1 - max_negotiable_discount - loyalty_discount)
    
    # Decision logic
    if guest_offer >= base_price:
        return {"decision": "accept", "final_price": base_price}
    
    elif guest_offer >= min_price and guest_offer >= max_offer:
        return {"decision": "accept", "final_price": guest_offer}
    
    elif guest_offer > min_price and occupancy_tier <= 2:
        return {"decision": "counter_with_addons", 
                "final_price": guest_offer,
                "add_ons": ["breakfast", "late_checkout"]}
    
    elif guest_offer >= min_price:
        counter = min(guest_offer + 1500, max_offer)
        return {"decision": "counter", "counter_price": counter}
    
    elif occupancy_tier == 1:
        return {"decision": "counter_with_addons",
                "final_price": min_price,
                "add_ons": ["breakfast", "cooking_class", "bicycle"]}
    
    else:
        return {"decision": "reject"}
```

---

## 7. Natural Language Processing

### 7.1 Price Extraction Patterns

The system uses **Regular Expressions (Regex)** to extract prices from natural language:

| Priority | Pattern | Example Match | Extracted Price |
|----------|---------|---------------|-----------------|
| 1 | LKR Currency | "9000 LKR", "LKR 9,000" | 9000 |
| 2 | Per Night | "9000 per night" | 9000 |
| 3 | Action + Number | "pay 9000", "offer 9000" | 9000 |
| 4 | USD (converts) | "$30" | 9600 (×320) |
| 5 | Standalone Number | "9000" (4+ digits) | 9000 |

**Regex Patterns:**

```python
# Pattern 1: LKR currency
r'(\d[\d,]*)\s*lkr|lkr\s*(\d[\d,]*)'

# Pattern 2: Per night
r'(\d[\d,]*)\s*(?:per|/|a)\s*night'

# Pattern 3: Action verbs
r'(?:pay|for|offer|budget|about)\s*(\d[\d,]*)'

# Pattern 4: USD (auto-convert)
r'\$(\d[\d,]*)'

# Pattern 5: Standalone large number
r'\b(\d{4,})\b'
```

### 7.2 Room Type Detection

```python
def detect_room_type(user_input):
    user_lower = user_input.lower()
    
    if "honeymoon" in user_lower:
        return "honeymoon"
    elif "family" in user_lower or "suite" in user_lower:
        return "family"
    elif "deluxe" in user_lower:
        return "deluxe"
    elif "standard" in user_lower or "basic" in user_lower:
        return "standard"
    return None  # Ask user to specify
```

### 7.3 Intent Detection Keywords

| Intent | Keywords |
|--------|----------|
| Price Complaint | "expensive", "high", "costly", "cheaper", "budget" |
| Review Promise | "review", "recommend", "tell my friends" |
| Long Stay | Number + "nights" (e.g., "5 nights") |
| Acceptance | "ok", "fine", "deal", "accept", "book it" |
| Abandonment | "forget it", "nevermind", "cancel" |

---

## 8. State Management

### 8.1 Multi-Turn Conversation State

The system maintains state across multiple messages to enable natural negotiation:

```python
# State persisted between messages
negotiation_state = {
    "round": 2,
    "room_type": "deluxe",
    "initial_offer": 8000,
    "current_offer": 9000,
    "counter_offers": [
        {"round": 1, "guest_offer": 8000, "decision": "counter", "counter_offer": 10500},
        {"round": 2, "guest_offer": 9000, "decision": "counter_with_addons", "counter_offer": 9000}
    ],
    "final_price": None,
    "add_ons": ["breakfast", "late_checkout"],
    "status": "active"
}
```

### 8.2 State Transitions

```
┌───────────────────────────────────────────────────────────────────┐
│                       STATE MACHINE                                │
│                                                                    │
│   ┌──────────┐    price offer    ┌──────────┐                     │
│   │ inactive │──────────────────►│  active  │◄────────┐           │
│   └──────────┘                   └──────────┘         │           │
│                                       │               │           │
│              ┌────────────────────────┼───────────────┤           │
│              │            │           │               │           │
│              ▼            ▼           ▼               │           │
│        ┌──────────┐ ┌──────────┐ ┌──────────┐   counter/          │
│        │ accepted │ │ rejected │ │abandoned │   addons            │
│        └──────────┘ └──────────┘ └──────────┘        │            │
│              │            │           │              │            │
│              └────────────┴───────────┴──────────────┘            │
│                            END                                     │
└───────────────────────────────────────────────────────────────────┘
```

### 8.3 Round Tracking

Each negotiation round is recorded with:

```python
round_record = {
    "round": 1,
    "guest_offer": 9000,        # What the guest offered
    "decision": "counter",       # System's decision
    "counter_offer": 10500,      # Counter price (if any)
    "add_ons": []               # Services included
}
```

---

## 9. Technologies Used

### 9.1 Core Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| **Python** | Primary language | 3.10+ |
| **LangGraph** | Workflow orchestration | Latest |
| **LangChain** | LLM integration | Latest |
| **FastAPI** | REST API framework | 0.100+ |
| **Ollama** | Local LLM runtime | Latest |
| **ChromaDB** | Vector database (RAG) | Latest |

### 9.2 AI/ML Stack

```
┌─────────────────────────────────────────────────────────────┐
│                      AI/ML STACK                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐   ┌─────────────────┐                 │
│  │   Ollama        │   │   ChromaDB      │                 │
│  │   (LLM Server)  │   │   (Vector DB)   │                 │
│  │                 │   │                 │                 │
│  │  ┌───────────┐  │   │  ┌───────────┐  │                 │
│  │  │  Llama2   │  │   │  │ HuggingFace│  │                 │
│  │  │  Mistral  │  │   │  │ Embeddings │  │                 │
│  │  └───────────┘  │   │  └───────────┘  │                 │
│  └─────────────────┘   └─────────────────┘                 │
│           │                     │                          │
│           └──────────┬──────────┘                          │
│                      │                                     │
│              ┌───────▼───────┐                             │
│              │   LangChain   │                             │
│              │  (Framework)  │                             │
│              └───────┬───────┘                             │
│                      │                                     │
│              ┌───────▼───────┐                             │
│              │   LangGraph   │                             │
│              │  (Workflow)   │                             │
│              └───────────────┘                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 9.3 Libraries & Dependencies

```python
# requirements.txt (relevant items)
langchain>=0.1.0
langchain-community>=0.0.10
langgraph>=0.0.20
chromadb>=0.4.0
sentence-transformers>=2.2.0
fastapi>=0.100.0
uvicorn>=0.22.0
ollama>=0.1.0
```

### 9.4 Design Patterns Used

| Pattern | Application |
|---------|-------------|
| **State Pattern** | Conversation state machine |
| **Strategy Pattern** | Decision algorithms per occupancy tier |
| **Factory Pattern** | Response generation |
| **Observer Pattern** | State change notifications |
| **Chain of Responsibility** | Intent classification pipeline |

---

## 10. API Integration

### 10.1 Endpoint

```
POST /api/ai/chat
Content-Type: application/json

{
    "message": "Can I get the deluxe room for 9000 LKR?",
    "user_id": "user123",
    "conversation_id": "conv456"
}
```

### 10.2 Response Structure

```json
{
    "response": "I can do LKR 9,000/night AND include our famous Sri Lankan breakfast plus late checkout!",
    "intent": "negotiation",
    "negotiation": {
        "round": 1,
        "room_type": "deluxe",
        "current_offer": 9000,
        "decision": "counter_with_addons",
        "add_ons": ["breakfast", "late_checkout"],
        "status": "active"
    },
    "response_metadata": {
        "decision": "counter_with_addons",
        "occupancy_rate": 0.247,
        "loyalty_applied": false
    }
}
```

### 10.3 Integration with Frontend

```javascript
// React component example
const handleNegotiation = async (message) => {
    const response = await axios.post('/api/ai/chat', {
        message,
        conversation_id: conversationId
    });
    
    // Handle negotiation state
    if (response.data.intent === 'negotiation') {
        setNegotiationStatus(response.data.negotiation.status);
        if (response.data.negotiation.status === 'accepted') {
            // Show booking confirmation
            showBookingForm(response.data.negotiation.final_price);
        }
    }
};
```

---

## 11. Testing & Examples

### 11.1 Test Scenarios

#### Scenario 1: Basic Negotiation Flow

```
User: "I'm interested in the deluxe room"
Bot:  "For the deluxe room, what price per night did you have in mind?"

User: "How about 9000 LKR?"
Bot:  "I can do LKR 9,000/night AND include our famous Sri Lankan 
       breakfast plus late checkout (worth LKR 3,500)!"

User: "Deal!"
Bot:  "Wonderful! The deluxe room at LKR 9,000/night is confirmed! 
       Renu and Nalaka are excited to welcome you."
```

#### Scenario 2: Price Complaint Handling

```
User: "Your prices are higher than other places in Ella"
Bot:  "I completely understand - budget matters! Let me explain why 
       Cloudy Hill Cottage offers great value:
       
       **What's included in our rates:**
       - Complimentary Sri Lankan breakfast
       - Stunning Ella Gap views
       - Free hiking maps & local tips
       
       Tell me your budget and preferred room, and I'll see what I can do!"
```

#### Scenario 3: Long-Stay Discount

```
User: "I want to stay for 7 nights"
Bot:  "Great news! For a 7-night stay, we offer a **15% long-stay discount**!
       
       With the discount:
       • Standard Room - LKR 7,225/night
       • Deluxe Room - LKR 10,625/night
       • Family Suite - LKR 15,300/night
       
       Which room would you like?"
```

#### Scenario 4: Review Promise Bonus

```
User: "Can I get it for 10000 LKR? I'll leave a good review"
Bot:  "That works for us! The deluxe room at LKR 10,000/night is yours. 
       Renu and Nalaka look forward to welcoming you - and we really 
       appreciate you promising to leave a review! 🙏"
```

### 11.2 Edge Cases

| Case | Input | Expected Behavior |
|------|-------|-------------------|
| No room specified | "How about 9000?" | Ask which room they want |
| Very low offer | "I can only pay 3000" | Counter with minimum + add-ons |
| Full occupancy | Any negotiation | Minimal/no discount |
| Abandonment | "Forget it" | Graceful exit, offer help |

### 11.3 Debugging

Check the response metadata for negotiation details:

```python
# In the response
"response_metadata": {
    "decision": "counter_with_addons",  # What decision was made
    "occupancy_rate": 0.247,            # Current occupancy
    "occupancy_tier": 1,                # Discount tier
    "loyalty_applied": true,            # Was loyalty bonus used
    "price_received": 9000              # Parsed price from input
}
```

---

## Appendix A: Quick Reference Card

### Price Boundaries (LKR)

| Room | Min | Base | Max Discount (Tier 1) |
|------|-----|------|----------------------|
| Standard | 6,500 | 8,500 | 5,950 (30% off) |
| Deluxe | 10,000 | 12,500 | 8,750 (30% off) |
| Family | 15,000 | 18,000 | 12,600 (30% off) |
| Honeymoon | 20,000 | 25,000 | 17,500 (30% off) |

### Decision Quick Guide

```
Offer ≥ Base Price        → ACCEPT at base
Offer ≥ Min + Acceptable  → ACCEPT at offer
Low Occupancy + Offer > Min → ACCEPT + Add-ons
Offer ≥ Min               → COUNTER +1,500
Tier 1 + Low Offer        → COUNTER at Min + Add-ons
Otherwise                 → REJECT politely
```

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **ZOPA** | Zone of Possible Agreement - the range where both parties can agree |
| **Anchoring** | Setting an initial price point that influences subsequent negotiations |
| **Value-Add** | Complimentary services offered instead of price cuts |
| **Occupancy Tier** | Classification (1-4) based on current hotel occupancy |
| **Counter-Offer** | A response that proposes different terms than the initial offer |
| **RAG** | Retrieval-Augmented Generation - using database context in AI responses |

---

*Document generated for the Hotel Booking System project - Cloudy Hill Cottage*
