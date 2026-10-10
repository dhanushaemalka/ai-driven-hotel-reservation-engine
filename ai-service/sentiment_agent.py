"""
Sentiment Analysis & Crisis Manager
Detects guest emotion and adapts response strategy
"""

from typing import Tuple
from langchain_community.vectorstores import Chroma


class SentimentAnalyzer:
    def __init__(self, db: Chroma):
        self.db = db
        
        # Sentiment keywords
        self.positive_words = {
            "great": 2, "wonderful": 2, "excellent": 2, "amazing": 2,
            "good": 1, "nice": 1, "happy": 1, "satisfied": 1, "perfect": 2,
            "fantastic": 2, "lovely": 1, "beautiful": 1, "enjoyed": 1,
            "love": 2, "best": 2, "recommend": 1, "thank": 1
        }
        
        self.negative_words = {
            "terrible": -2, "horrible": -2, "awful": -2, "disgusting": -2,
            "broken": -1, "rude": -1, "disappointed": -1, "angry": -2,
            "frustrated": -1, "dirty": -1, "cold": -1, "loud": -1,
            "bad": -1, "worst": -2, "hate": -2, "ruined": -2,
            # Common misspellings
            "dissapointed": -1, "dissappointed": -1, "disapointed": -1,
            "fustrated": -1, "frustarted": -1,
            # Additional negative words
            "unhappy": -1, "upset": -1, "annoyed": -1, "irritated": -1,
            "poor": -1, "wrong": -1, "fail": -1, "failed": -1,
            "unacceptable": -2, "ridiculous": -1, "pathetic": -2,
            "unsatisfied": -1, "dissatisfied": -1
        }
        
        # Negation patterns that flip sentiment
        self.negation_phrases = [
            "not satisfied", "not happy", "not good", "not great", 
            "not nice", "not pleased", "not impressed", "not recommend",
            "don't like", "didn't like", "doesn't work", "didn't work",
            "wasn't good", "weren't good", "isn't good", "aren't good",
            "never again", "won't return", "won't come back", "not worth"
        ]
        
        self.issue_severity_keywords = {
            "critical": ["security", "theft", "health", "emergency", "poisoning", "attack"],
            "severe": ["broken", "damaged", "unsafe", "rude", "misconduct", "unacceptable"],
            "moderate": ["dirty", "issue", "problem", "noise", "not ready", "dissatisfied", "unsatisfied"],
            "minor": ["small", "minor", "light", "forgot"]
        }
    
    def analyze_sentiment(self, text: str) -> Tuple[str, float]:
        """
        Analyze sentiment of user text
        Returns: (sentiment, score)
        sentiment: "positive", "negative", "neutral", "angry"
        score: -2 to +2
        """
        text_lower = text.lower()
        score = 0
        anger_markers = [
            "refund now", "manager now", "unacceptable", "ridiculous",
            "worst", "hate", "disgusting", "pathetic", "calling the manager",
            "calling the tourism board", "full refund", "immediately"
        ]
        anger_signal = any(marker in text_lower for marker in anger_markers)
        
        # FIRST: Check for negation phrases (these override individual word sentiment)
        negation_found = False
        for phrase in self.negation_phrases:
            if phrase in text_lower:
                score -= 1.5  # Strong negative signal
                negation_found = True
        
        # Count negative words first
        for word, value in self.negative_words.items():
            if word in text_lower:
                score += value
        
        # Only count positive words if no negation is present
        if not negation_found:
            for word, value in self.positive_words.items():
                if word in text_lower:
                    score += value
        
        # Detect intensity markers
        if "!" in text or "!!" in text or "!!!" in text:
            if score < 0:
                score *= 1.3  # Amplify negative
            else:
                score *= 1.2  # Slightly amplify positive
            if "!!" in text or "!!!" in text:
                anger_signal = True
        
        if "?" in text and score < 0:
            score *= 0.7  # Reduce intensity if questioning

        # Strong all-caps tokens usually indicate anger/escalation
        if any(token.isupper() and len(token) > 2 for token in text.split()):
            anger_signal = True
        
        # Determine sentiment based on score
        if score >= 1:
            return ("positive", min(score, 2.0))
        elif score <= -1.5 and (anger_signal or score <= -2.25):
            return ("angry", max(score, -2.0))
        elif score < -0.5:
            return ("negative", score)
        else:
            return ("neutral", score)
    
    def detect_issue_severity(self, text: str) -> str:
        """Detect severity of reported issue"""
        text_lower = text.lower()
        
        for severity, keywords in self.issue_severity_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    return severity
        
        return "minor"
    
    def is_complaint(self, text: str) -> bool:
        """Check if text is a complaint"""
        complaint_phrases = [
            "broken", "doesn't work", "not working", "issue", "problem",
            "dirty", "rude", "disappointed", "angry", "complaint",
            "refund", "compensation", "fix", "manager",
            # Additional complaint indicators
            "not satisfied", "dissatisfied", "unsatisfied", "unhappy",
            "dissapointed", "dissappointed", "disapointed",  # Misspellings
            "poor service", "bad service", "terrible", "horrible", "awful",
            "unacceptable", "ridiculous", "worst", "never again",
            "want to speak", "speak to manager", "very disappointed",
            "not happy", "upset", "frustrated", "annoyed"
        ]
        text_lower = text.lower()
        return any(phrase in text_lower for phrase in complaint_phrases)
    
    def generate_system_prompt(self, sentiment: str, is_complaint: bool, severity: str) -> str:
        """Generate contextual system prompt based on sentiment
        
        Implements Affective Computing principles:
        - Emotion-aware response strategies
        - Escalation protocols for crisis situations
        - De-escalation techniques for negative sentiment
        """
        
        if is_complaint and severity == "critical":
            return """You are the Crisis Management Agent for Cloudy Hill Cottage, Ella, Sri Lanka.

PRIORITY: De-escalate this critical situation immediately.

APPROACH:
1. Lead with genuine empathy: "I sincerely apologize that this happened..."
2. Take responsibility: Do NOT blame the guest or make excuses
3. Offer immediate help: Connect them with Nalaka or Renu directly
4. Escalate: Inform guest that our host will call personally within 30 minutes
5. Document: Remember all details for follow-up

TONE: Professional, empathetic, action-oriented. Show you CARE.

COMPENSATION (within authority):
- Full refund for affected nights
- Free night for future stay
- Complimentary cooking class or experience
- Personal call from Nalaka (host)

CONTACT: +94 71 593 4715 (Nalaka direct line)

Do NOT debate or defend. Just SOLVE."""
        
        elif is_complaint and severity == "severe":
            return """You are a Guest Relations Agent for Cloudy Hill Cottage.

GUEST SITUATION: This guest has experienced a serious problem and is frustrated.

STRATEGY:
1. Acknowledge: "I completely understand your frustration. This shouldn't have happened."
2. Validate: Their concern is legitimate and we take it seriously.
3. Investigate: Ask clarifying questions if needed to understand fully.
4. Offer Solutions: Present 2-3 options to make it right:
   - Compensation options (discount, credit, free breakfast)
   - Experience recovery (cooking class, packed lunch for hike)
   - Future stay benefits
5. Follow through: Commit to specific next steps and timeline.

TONE: Empathetic, professional, solution-focused.
Remember: This is a family-run cottage - Renu and Nalaka genuinely care!

CONTACT: +94 77 123 4567"""
        
        elif is_complaint and severity in ["moderate", "minor"]:
            return """You are a Guest Service Agent for Cloudy Hill Cottage.

GUEST SITUATION: Guest has reported an issue but conversation tone is manageable.

STRATEGY:
1. Apologize: "I sincerely apologize for this inconvenience."
2. Solve Quickly: Offer immediate action (room change, extra amenities, etc.)
3. Compensate Appropriately: 
   - For minor issues: Complimentary breakfast or packed lunch
   - For moderate issues: Cooking class, bicycle rental, or similar
4. Follow up: Ensure issue is resolved and guest is satisfied.
5. Prevent Repeat: Ask what we can improve.

TONE: Helpful, responsive, genuine - like a caring family member.
Remember: We want to turn this negative experience into a positive one."""
        
        elif sentiment == "positive":
            return """You are a friendly Concierge for Cloudy Hill Cottage with a HAPPY guest!

GUEST SITUATION: This guest is pleased and happy with their experience.

STRATEGY:
1. Share their joy: Match their positive energy!
2. Enhance experience: Suggest Ella Rock hike, Nine Arch Bridge, cooking class
3. Gather feedback: Ask what they enjoyed most
4. Invite review: "We'd love if you shared your experience on Booking.com!"
5. Encourage return: "We'd love to see you again during tea season!"

TONE: Warm, enthusiastic, hospitable - like Renu welcoming you for breakfast.

This is an opportunity to build a brand advocate. Make them feel like family!"""
        
        else:  # neutral sentiment
            return """You are a friendly Concierge for Cloudy Hill Cottage, Ella, Sri Lanka.

ABOUT US: A cozy mountain cottage run by Renu & Nalaka, known for:
- Stunning sunrise views of Ella Rock and the valley
- Famous home-cooked breakfast and Jackfruit Curry
- Renu's cooking classes
- Personalized hiking maps and local tips

APPROACH:
1. Be warm and helpful - like a friendly local guide
2. Provide accurate information about the cottage and Ella
3. Offer personalized recommendations based on interests
4. Make guest feel welcomed like family
5. Suggest experiences: cooking class, Ella Rock hike, Nine Arch Bridge

TONE: Professional yet warm, knowledgeable, hospitable.

Remember: We're not a big hotel - we're a family-run cottage where every guest is special!"""
    
    def get_rag_search_context(self, sentiment: str, is_complaint: bool, severity: str) -> str:
        """Suggest what documents to retrieve from RAG"""
        
        if is_complaint:
            if severity == "critical":
                return "compensation policies critical issues escalation manager"
            elif severity == "severe":
                return "compensation policies resolution severe guest issues"
            elif severity == "moderate":
                return "compensation policies moderate complaints"
            else:
                return "compensation policies minor issues vouchers"
        
        elif sentiment == "negative":
            return "compensation policies conflict resolution negative feedback"
        
        else:
            return "hotel amenities services concierge recommendations"
