# AI Chatbot Test Scenarios

Use these scripts to test and demonstrate each AI feature of the Cloudy Hill Cottage chatbot.

---

## 1. SENTIMENT ANALYSIS & EMOTION-ADAPTIVE RESPONSES (Affective Computing)

### Test 1.1: Positive Sentiment
**Input:**
```
I just had the most amazing stay at your cottage! The views were breathtaking and the food was incredible. Thank you so much!
```
**Expected Response:** Warm, appreciative tone. Should detect positive sentiment.

### Test 1.2: Negative Sentiment
**Input:**
```
I'm really disappointed with my room. It wasn't clean and the WiFi didn't work at all.
```
**Expected Response:** Empathetic, apologetic tone. Should offer solutions or compensation.

### Test 1.3: Angry/Frustrated Sentiment
**Input:**
```
This is ridiculous! I've been waiting for 2 hours and nobody has helped me! I want to speak to a manager NOW!
```
**Expected Response:** Should detect high negativity, offer immediate assistance, possibly trigger crisis mode.

### Test 1.4: Neutral Inquiry
**Input:**
```
What time is checkout?
```
**Expected Response:** Neutral, informative tone with checkout time details.

---

## 2. PRICE NEGOTIATION (Game Theory)

### Test 2.1: Basic Price Inquiry
**Input:**
```
How much does the deluxe room cost per night?
```
**Expected Response:** Should provide room pricing information.

### Test 2.2: Negotiation Attempt - Direct
**Input:**
```
The deluxe room is too expensive. Can you give me a discount? I can pay 10000 LKR per night.
```
**Expected Response:** Should enter negotiation mode, consider the offer, possibly counter-offer.

### Test 2.3: Negotiation with Justification
**Input:**
```
I'm planning to stay for 5 nights. Can I get a better rate? My budget is limited.
```
**Expected Response:** Should offer long-stay discount, negotiate based on duration.

### Test 2.4: Multi-turn Negotiation
**Message 1:**
```
I want to book a room but your prices are higher than other places in Ella.
```
**Message 2 (after response):**
```
What if I pay 8000 LKR per night for the standard room? That's my final offer.
```
**Message 3 (after response):**
```
Okay, how about 9000 LKR? I'll also leave a good review.
```
**Expected Response:** Should maintain negotiation context across messages, use Game Theory to reach a mutually beneficial agreement.

### Test 2.5: Loyalty-based Negotiation
**Input:**
```
I've stayed here 3 times before. Don't I get a loyalty discount?
```
**Expected Response:** Should recognize returning guest, offer loyalty pricing.

---

## 3. KNOWLEDGE GRAPH RECOMMENDATIONS (GraphRAG)

### Test 3.1: Local Attractions
**Input:**
```
What are the best places to visit near the cottage?
```
**Expected Response:** Should list attractions like Nine Arch Bridge, Ella Rock, Little Adam's Peak with relevant details.

### Test 3.2: Activity Recommendations
**Input:**
```
I love hiking. What trails do you recommend?
```
**Expected Response:** Should recommend hiking trails (Ella Rock, Little Adam's Peak) with difficulty levels, duration, and tips.

### Test 3.3: Food & Dining Queries
**Input:**
```
Where can I get authentic Sri Lankan food?
```
**Expected Response:** Should mention the cottage's cooking class, local restaurants, traditional dishes.

### Test 3.4: Experience Recommendations
**Input:**
```
I'm here with my family for 3 days. What experiences should we do?
```
**Expected Response:** Should provide family-friendly itinerary using knowledge graph connections.

### Test 3.5: Contextual Recommendation
**Input:**
```
I want to see the sunrise tomorrow. What should I do?
```
**Expected Response:** Should recommend Ella Rock sunrise hike with timing, preparation tips.

---

## 4. CRISIS DETECTION & ESCALATION (HCI)

### Test 4.1: Mild Complaint
**Input:**
```
The hot water isn't working properly in my room.
```
**Expected Response:** Should acknowledge issue, offer to send maintenance, possibly offer compensation.

### Test 4.2: Serious Complaint (Crisis Trigger)
**Input:**
```
This is unacceptable! I found bugs in my bed and the room smells terrible! I demand a full refund immediately or I'm calling the tourism board!
```
**Expected Response:** Should detect crisis mode, offer sincere apology, immediate room change, refund/compensation, escalation to management.

### Test 4.3: Health/Safety Concern
**Input:**
```
I think I ate something bad at dinner and now I'm feeling very sick. I need help!
```
**Expected Response:** Should prioritize guest safety, offer medical assistance, show high concern.

### Test 4.4: Escalation Request
**Input:**
```
I've complained 3 times already and nothing has been done. I want to speak to the owner right now!
```
**Expected Response:** Should acknowledge repeated issues, offer to connect with management, provide compensation.

---

## 5. COMBINED FEATURE TESTS

### Test 5.1: Negative Sentiment + Negotiation
**Input:**
```
I'm very unhappy with my current room. It's noisy and small. I want to upgrade to the deluxe room but I shouldn't have to pay extra after this experience!
```
**Expected Response:** Should detect negative sentiment, offer empathetic response, negotiate upgrade possibly free or discounted.

### Test 5.2: Recommendation + Booking
**Input:**
```
I want to do something romantic for my anniversary. What do you suggest and can you help me book it?
```
**Expected Response:** Should recommend romantic experiences (honeymoon suite, sunset dinner, cooking class for couples) and offer to help with booking.

### Test 5.3: Full Conversation Flow
**Message 1:**
```
Hi, I'm interested in booking a room for next weekend.
```
**Message 2:**
```
What rooms do you have available and what are the prices?
```
**Message 3:**
```
The honeymoon suite looks nice but it's a bit expensive. Can you do 20000 LKR per night?
```
**Message 4:**
```
Okay, what activities do you recommend for couples?
```
**Message 5:**
```
Great! Please book the honeymoon suite with the cooking class experience.
```
**Expected Response:** Should maintain context throughout, handle pricing negotiation, provide recommendations, assist with booking.

---

## QUICK TEST COMMANDS

Copy-paste these to quickly test each feature:

### Sentiment Test (Positive):
```
I absolutely love this place! Best vacation ever!
```

### Sentiment Test (Negative):
```
I'm very disappointed and frustrated with the service here.
```

### Negotiation Test:
```
Can I get a discount on the deluxe room? I can pay 10000 LKR per night for 3 nights.
```

### Recommendation Test:
```
What are the must-see attractions near Ella that I shouldn't miss?
```

### Crisis Test:
```
This is terrible! My room has insects and nobody is helping me! I want a refund now!
```

---

## EXPECTED BEHAVIOR SUMMARY

| Feature | Trigger Keywords/Phrases | Expected AI Behavior |
|---------|-------------------------|---------------------|
| **Positive Sentiment** | love, amazing, wonderful, thank you, great | Warm, appreciative responses |
| **Negative Sentiment** | disappointed, frustrated, unhappy, bad, terrible | Empathetic, solution-focused |
| **Crisis Mode** | demand, refund, unacceptable, manager, complaint + high intensity | Immediate escalation, compensation offers |
| **Negotiation** | discount, cheaper, afford, budget, offer, pay X amount | Counter-offers, loyalty discounts |
| **Recommendations** | visit, see, do, recommend, attractions, activities | Knowledge graph-based suggestions |

---

## TROUBLESHOOTING

If the chatbot isn't responding correctly:

1. **Check Ollama is running:**
   ```bash
   ollama serve
   ```

2. **Check AI service is running:**
   ```bash
   cd ai-service
   python api_server.py
   ```

3. **Check API health:**
   Visit: http://localhost:8000/health

4. **Check backend is running:**
   ```bash
   cd server
   npm run server
   ```

5. **Verify all services are connected:**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000
   - AI Service: http://localhost:8000
