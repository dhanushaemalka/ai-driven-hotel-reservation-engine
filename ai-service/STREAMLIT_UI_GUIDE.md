# Emotion-Adaptive Chatbot UI - Setup & Usage Guide

## 🎨 Overview

The **Streamlit-based UI** features **Affective Computing** with emotion-adaptive design:

- **😊 Happy Mode**: Bright greens/oranges, playful emojis, casual fonts
- **😔 Negative Mode**: Supportive reds, empathetic tone, adjusted layout
- **😠 Angry/Crisis Mode**: Dark red, muted colors, formal tone, visual warning badge
- **😐 Neutral Mode**: Professional blues, standard layout

The UI **responds in real-time** to detected sentiment, making guests feel emotionally acknowledged before human support.

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Navigate to project directory
cd d:\RAG\langchain-rag-tutorial

# Install all requirements
pip install -r requirements.txt

# Install markdown support (optional)
pip install "unstructured[md]"
```

### 2. Start Ollama (In Separate Terminal)

```bash
ollama serve
```

The model will auto-download on first use.

### 3. Run the Streamlit App

```bash
streamlit run streamlit_app.py
```

The app will open at `http://localhost:8501`

---

## 🎯 Emotion-Adaptive UI Breakdown

### Theme Colors & States

#### 1. **Happy/Satisfied** 😊
```
Colors:
- Primary: #2ECC71 (Bright Green)
- Secondary: #F39C12 (Orange)
- Background: #F0FFF4 (Light Green)
- Avatar: 😊

Typography:
- Font Size: 1.1em (Slightly larger)
- Style: Normal
- Tone: Enthusiastic, casual

Components:
- Borders: Rounded, soft
- Buttons: Smooth, green gradient
- Messages: Bright background
```

**When it appears:** Guest uses words like "great", "wonderful", "excellent", "thank you"

#### 2. **Neutral/Informational** 😐
```
Colors:
- Primary: #3498DB (Professional Blue)
- Secondary: #9B59B6 (Purple)
- Background: #F8F9FA (Light Gray)
- Avatar: 🤖

Typography:
- Font Size: 1.0em (Standard)
- Style: Normal
- Tone: Professional, helpful

Components:
- Clean, minimal design
- Standard button styling
- Organized layout
```

**When it appears:** General inquiries, pricing questions, information requests

#### 3. **Negative/Concerned** 😔
```
Colors:
- Primary: #E74C3C (Soft Red)
- Secondary: #E67E22 (Orange-Red)
- Background: #FFF5F5 (Light Red)
- Avatar: 😔

Typography:
- Font Size: 1.05em (Slightly larger)
- Style: Italic
- Tone: Empathetic, supportive

Components:
- Softer colors to calm
- Supportive messages emphasized
- Clear action items
```

**When it appears:** Guest mentions issues ("broken", "problem", "disappointed")

#### 4. **Angry/Crisis** 😠 🚨
```
Colors:
- Primary: #C0392B (Dark Red)
- Secondary: #8B0000 (Blood Red)
- Background: #2C3E50 (Dark Blue-Gray - CRISIS MODE)
- Text: #ECF0F1 (Light Gray)
- Avatar: 🚨
- Border: 2px solid #C0392B

Typography:
- Font Size: 1.0em
- Style: Bold
- Tone: Formal, action-oriented

Components:
- BRIGHT WARNING BADGE with animation
- High contrast for visibility
- Urgent action buttons
- Pulsing animation draws attention
```

**When it appears:** Guest shows anger ("very upset!", "!!!", "rude staff", "THIS IS UNACCEPTABLE")

---

## 🧠 How the UI Responds

### Real-Time Sentiment Detection

Every message is analyzed:

```python
sentiment, score = sentiment_analyzer.analyze_sentiment(user_input)

# Score ranges:
# +2.0 = Very happy
# +1.0 = Happy
#  0.0 = Neutral
# -1.0 = Unhappy
# -2.0 = Angry
```

### Instant UI Transitions

When sentiment changes:

1. **CSS classes swap** (Happy → Angry theme)
2. **Avatar emoji updates** (😊 → 😠)
3. **Background color transitions** (smooth 0.3s animation)
4. **New greeting appears** (emotion-appropriate message)
5. **Warning badges show** (for critical issues)
6. **Bot personality adapts** (responses change in tone)

### Example: "My shower is broken!!"

```
Timeline of UI changes:

[User types] "My shower is broken!!"
↓
[Sentiment Analysis] Detects NEGATIVE (score: -1.5)
↓
[UI Transitions]:
  - Color scheme → Soft red (#E74C3C)
  - Avatar → 😔
  - Greeting → "I hear you're having trouble..."
  - Font → Italic (empathetic)
↓
[Response Type] Complaint handler activated
↓
[RAG Search] Retrieves "compensation_policy.md"
↓
[Bot Response] Empathetic, action-focused
```

---

## 💬 Chat Interface Features

### Message Types

#### User Messages
- Styled with primary color
- Right-aligned
- Rounded corners (bubble style)
- White text on colored background

#### Assistant Messages
- Styled with light background + left border
- Left-aligned
- Primary color border
- Full-width for readability

### Sidebar Information

Shows real-time status:
- 📊 Message count
- 😊 Current emotional state
- ℹ️ Feature descriptions
- 🔄 Clear history button

---

## 🎮 Interactive Features

### 1. Intent Detection

The system automatically recognizes:

**Negotiation Intent:**
```
User: "The Presidential Suite is too expensive at $500. Can you do $400?"
→ Negotiator Bot activated
→ Dynamic pricing logic applied
→ Response: Price negotiation strategy
```

**Complaint Intent:**
```
User: "Your staff was rude and my room is dirty!"
→ Crisis Manager activated
→ Sentiment detected: ANGRY
→ UI → Crisis Mode
→ Response: Empathetic resolution
```

**Recommendation Intent:**
```
User: "I want a romantic dinner with vegan options nearby"
→ GraphRAG activated
→ Knowledge graph queried
→ Response: Personalized recommendations
```

**General Info Intent:**
```
User: "What time is breakfast?"
→ Standard RAG retrieval
→ Chroma vector search
→ Response: Hotel information
```

### 2. Real-Time Feedback

- **Loading spinner**: Shows when LLM is processing
- **Message animations**: Smooth slide-in effects
- **Color transitions**: Emotion changes animate
- **Visual feedback**: Buttons change on hover

---

## 🛠️ Customization

### Change Theme Colors

Edit `.streamlit/config.toml`:
```toml
[theme]
primaryColor = "#Your-Hex-Color"
backgroundColor = "#Your-Hex-Color"
textColor = "#Your-Hex-Color"
```

### Adjust Sentiment Thresholds

Edit `sentiment_agent.py`:
```python
self.positive_words = {
    "great": 2,      # Increase/decrease weight
    "excellent": 2,
    # ...
}
```

### Add New Emotion States

Edit `streamlit_app.py` → `EmotionTheme.THEMES`:
```python
THEMES = {
    "excited": {
        "primary_color": "#FF6B6B",
        "secondary_color": "#FFE66D",
        "background": "#FFFACD",
        "emoji": "🎉",
        # ...
    }
}
```

### Modify Response Behavior

Edit `sentiment_agent.py` → `generate_system_prompt()`:
```python
def generate_system_prompt(self, sentiment: str, ...):
    if sentiment == "your_emotion":
        return "Your custom prompt here..."
```

---

## 📱 UI Layout Breakdown

```
┌─────────────────────────────────────────────────┐
│         🏨 GRAND VISTA HOTEL                   │
│        AI Concierge Assistant                   │
│  😊 HAPPY (Emotion detected: +1.5)              │
├─────────────────────────────────────────────────┤
│                                                 │
│  👤 [User Message]                              │
│     You: "Room pricing negotiation?"            │
│                                                 │
│  [Assistant Message]                            │
│  🤖 Of course! Let me check current rates...   │
│                                                 │
├─────────────────────────────────────────────────┤
│  [Input Box]                                    │
│  How can I help you today? [____] [Send]       │
├─────────────────────────────────────────────────┤
│ Sidebar:                                        │
│ • 🎯 Chat Features                              │
│ • 📊 Current Status                             │
│ • ℹ️ About                                      │
│ • [Clear Chat]                                  │
└─────────────────────────────────────────────────┘
```

---

## 🔌 Technical Stack

### Frontend
- **Streamlit**: Web UI framework
- **Custom CSS**: Emotion-adaptive styling
- **HTML/CSS animations**: Smooth transitions

### Backend
- **LangChain**: LLM orchestration
- **Ollama**: Local LLM (Llama2)
- **Chroma**: Vector database
- **Custom Agents**:
  - `NegotiatorAgent`: Dynamic pricing
  - `SentimentAnalyzer`: Emotion detection
  - `KnowledgeGraph`: GraphRAG

### Integration
- **Intent Detection**: Routes to appropriate handler
- **Real-time Sentiment**: Updates UI instantly
- **Dynamic Prompting**: Context-aware LLM instructions

---

## 🚀 Deployment Options

### Local Development
```bash
streamlit run streamlit_app.py
```

### Production Server (Streamlit Cloud)
1. Push code to GitHub
2. Connect to Streamlit Cloud
3. Deploy with one click

### Custom Server (Heroku/AWS)
```dockerfile
FROM python:3.10
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
CMD streamlit run streamlit_app.py --server.port=8501
```

---

## 📊 Advanced Features Showcase

### 1. Dynamic Pricing Negotiation
```
User: "Is there a discount?"
→ NegotiatorAgent extracts context
→ Occupancy rate checked (24.7%)
→ Low occupancy tier detected
→ Pricing negotiation logic applied
→ LLM responds with counter-offer + value-adds
```

### 2. Sentiment-Driven Crisis Response
```
User: "HELP! My room is flooding!!"
→ Sentiment: ANGRY (score: -2.0)
→ UI: CRISIS MODE activated (dark red)
→ Warning badge: "🚨 CRISIS MODE ACTIVATED"
→ Compensation policy retrieved
→ LLM: Empathetic, action-oriented response
→ Offers immediate solutions
```

### 3. GraphRAG Recommendations
```
User: "Romantic vegan dinner nearby?"
→ Intent: Recommendation
→ Preferences extracted: romantic=True, cuisine=vegan
→ Knowledge graph queried
→ Top 3 results: The Green Leaf, Vegans Paradise, etc.
→ Context formatted for LLM
→ Personalized recommendation generated
```

---

## 🧪 Testing

Run the test suite before deploying:

```bash
python test_advanced_features.py
```

All three systems (Negotiator, Sentiment, GraphRAG) are validated.

---

## ⚡ Performance Tips

1. **Cache Resources**: Backend is cached with `@st.cache_resource`
2. **Lazy Loading**: Models loaded only on first run
3. **Minimal Reloads**: Sentiment analysis doesn't reload models
4. **Efficient Queries**: Chroma similarity search optimized

---

## 🎓 Key HCI Principles Demonstrated

✅ **Feedback & Status Visibility**
- User emotions acknowledged visually
- Real-time UI changes show system understands context

✅ **Consistency**
- Colors consistent with emotional meanings
- Predictable behavior based on sentiment

✅ **User Control**
- Clear chat history
- Ability to start fresh
- Transparent intent detection

✅ **Aesthetics & Minimalism**
- Clean interface
- Emotion-appropriate design
- No unnecessary clutter

---

## 🐛 Troubleshooting

### App won't start
```bash
# Check Ollama is running
ollama serve  # In separate terminal

# Clear Streamlit cache
streamlit cache clear
```

### Sentiment not changing
- Check your message contains emotional keywords
- Try: "I'm very upset!" or "This is amazing!"

### Slow responses
- Ensure Ollama is running
- Check system resources
- First query may be slower (model loading)

### Database errors
```bash
# Recreate database
python create_database.py
```

---

## 📚 Documentation Files

- `advanced_chatbot.py`: Core chatbot logic
- `streamlit_app.py`: UI implementation
- `sentiment_agent.py`: Emotion detection
- `negotiator_agent.py`: Price negotiation
- `graphrag_engine.py`: Knowledge graph
- `ADVANCED_FEATURES.md`: Full feature docs

---

## 🎯 Next Steps

1. ✅ Install requirements
2. ✅ Start Ollama
3. ✅ Run `streamlit run streamlit_app.py`
4. ✅ Test all three features
5. ✅ Customize colors/themes as desired
6. ✅ Deploy to production

---

**Built with ❤️ for advanced RAG systems**
