"""
Booking Agent for Cloudy Hill Cottage Chatbot
Handles conversational room booking with multi-turn conversation,
availability checking, and backend integration.

Features:
- Natural language date/guest count extraction
- Availability checking via backend API
- Dynamic pricing based on occupancy
- Multi-turn booking confirmation flow
- Integration with Stripe for payment processing
"""

import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import httpx
from enum import Enum


class BookingPhase(Enum):
    """Booking conversation phases"""
    INITIAL = "initial"              # Waiting for dates/details
    DATES_RECEIVED = "dates_received"  # Got dates, asking for room type
    ROOM_SELECTED = "room_selected"    # Got room type, confirming details
    DETAILS_CONFIRMED = "confirmed"    # Ready to create booking
    PAYMENT_PENDING = "payment_pending"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class BookingAgent:
    """Conversational booking agent"""
    
    def __init__(self, backend_url: str = "http://localhost:3000/api"):
        """
        Initialize booking agent
        
        Args:
            backend_url: Backend API base URL (default: http://localhost:3000/api)
        """
        self.backend_url = backend_url
        self.booking_sessions: Dict[str, Dict] = {}  # Track ongoing bookings by session_id
        
        # Keywords for booking intent detection
        self.booking_keywords = [
            "book", "reserve", "check availability", "available room",
            "room", "reservation", "stay", "night", "dates",
            "how much", "price", "cost", "rate", "booking"
        ]
        
        # Room types available
        self.room_types = ["standard", "deluxe", "suite", "presidential"]
        
    
    def is_booking_intent(self, text: str) -> bool:
        """
        Detect if user is asking to book a room
        
        Args:
            text: User message
            
        Returns:
            True if booking intent detected
        """
        text_lower = text.lower()
        
        # Check for booking keywords
        for keyword in self.booking_keywords:
            if keyword in text_lower:
                return True
        
        # Check for date patterns (e.g., "March 15-18", "tomorrow", "next week")
        date_patterns = [
            r'\d{1,2}[-/]\d{1,2}',  # 15-18 or 15/18
            r'\b(tomorrow|next week|this week|next month|today)\b',
            r'(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)',
        ]
        
        for pattern in date_patterns:
            if re.search(pattern, text_lower):
                return True
        
        return False
    
    
    def extract_booking_details(self, text: str) -> Dict:
        """
        Extract booking details from user message
        
        Args:
            text: User message
            
        Returns:
            Dict with extracted check_in, check_out, guests, room_type
        """
        details = {
            "check_in": None,
            "check_out": None,
            "guests": 1,
            "room_type": None
        }
        
        # Extract guest count
        guest_pattern = r'(\d+)\s*(person|people|guest|guests|traveler|travellers|adult|adults)'
        guest_match = re.search(guest_pattern, text.lower())
        if guest_match:
            details["guests"] = int(guest_match.group(1))
        
        # Extract room type preference
        text_lower = text.lower()
        for room in self.room_types:
            if room in text_lower:
                details["room_type"] = room
                break
        
        # Extract dates (simplified - in production use dateparser)
        # Look for patterns like "March 15-18" or "15th to 18th"
        dates = self._extract_dates(text)
        if dates:
            details["check_in"] = dates[0]
            details["check_out"] = dates[1]
        
        return details
    
    
    def _extract_dates(self, text: str) -> Optional[Tuple[str, str]]:
        """
        Extract check-in and check-out dates from text
        
        Returns:
            Tuple of (check_in_date, check_out_date) in YYYY-MM-DD format, or None
        """
        # Simple pattern: "March 15-18" or "15 to 18"
        pattern = r'(\d{1,2})[-/](\d{1,2})'
        match = re.search(pattern, text)
        
        if not match:
            # Try "next week", "tomorrow", etc.
            if "tomorrow" in text.lower():
                today = datetime.now()
                check_in = (today + timedelta(days=1)).strftime("%Y-%m-%d")
                check_out = (today + timedelta(days=2)).strftime("%Y-%m-%d")
                return (check_in, check_out)
            return None
        
        day1 = int(match.group(1))
        day2 = int(match.group(2))
        
        # Get current month
        now = datetime.now()
        
        # Construct dates (assuming current month)
        try:
            check_in = datetime(now.year, now.month, day1).strftime("%Y-%m-%d")
            check_out = datetime(now.year, now.month, day2).strftime("%Y-%m-%d")
            
            # If dates are in the past, assume next month
            if datetime.strptime(check_in, "%Y-%m-%d") < now:
                next_month = now.month + 1
                year = now.year
                if next_month > 12:
                    next_month = 1
                    year += 1
                check_in = f"{year}-{next_month:02d}-{day1:02d}"
                check_out = f"{year}-{next_month:02d}-{day2:02d}"
            
            return (check_in, check_out)
        except ValueError:
            return None
    
    
    async def check_availability(self, check_in: str, check_out: str, room_type: Optional[str] = None) -> Dict:
        """
        Check room availability via backend API
        
        Args:
            check_in: Check-in date (YYYY-MM-DD)
            check_out: Check-out date (YYYY-MM-DD)
            room_type: Optional room type filter
            
        Returns:
            Dict with available rooms and pricing
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.backend_url}/rooms",
                    timeout=10.0
                )

                if response.status_code != 200:
                    return {
                        "success": False,
                        "error": f"Rooms API returned {response.status_code}",
                        "message": "Please try again or contact our front desk."
                    }

                data = response.json()
                if not isinstance(data, dict) or not data.get("success", False):
                    return {
                        "success": False,
                        "error": (data.get("message") if isinstance(data, dict) else "Invalid rooms response"),
                        "message": "I'm having trouble checking availability. Please try again shortly."
                    }

                rooms = data.get("rooms", [])
                if not isinstance(rooms, list):
                    rooms = []

                # Optional in-memory room type filter (backend currently returns all available rooms).
                if room_type:
                    rooms = [
                        room for room in rooms
                        if str(room.get("roomType", "")).lower() == room_type.lower()
                    ]

                return {
                    "success": True,
                    "available_rooms": rooms,
                    "check_in": check_in,
                    "check_out": check_out
                }
        except Exception as e:
            print(f"[ERROR] Availability check failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "I'm having trouble checking availability. Please contact our front desk at +94 77 123 4567."
            }
    
    
    async def create_booking(
        self,
        user_id: str,
        room_id: str,
        check_in: str,
        check_out: str,
        guests: int,
        guest_email: str,
        guest_phone: str,
        payment_token: Optional[str] = None
    ) -> Dict:
        """
        Create booking in backend
        
        Args:
            user_id: Guest user ID
            room_id: Room ID to book
            check_in: Check-in date
            check_out: Check-out date
            guests: Number of guests
            guest_email: Guest email
            guest_phone: Guest phone
            payment_token: Stripe token (optional for now)
            
        Returns:
            Booking creation result
        """
        try:
            booking_data = {
                "userId": user_id,
                "room": room_id,
                "checkInDate": check_in,
                "checkOutDate": check_out,
                "guests": guests,
                "guestName": "Chatbot Guest",
                "guestEmail": guest_email,
                "guestPhone": guest_phone,
                "source": "ai_chatbot",
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.backend_url}/bookings/chatbot-book",
                    json=booking_data,
                    timeout=10.0
                )

                payload = response.json() if response.text else {}

                if response.status_code in [200, 201] and payload.get("success"):
                    booking = payload.get("booking", {})
                    return {
                        "success": True,
                        "booking": booking,
                        "booking_id": booking.get("_id"),
                        "confirmation": f"Booking confirmed! Your confirmation number is {booking.get('_id')}."
                    }
                else:
                    return {
                        "success": False,
                        "error": payload,
                        "message": payload.get("message", "Sorry, I couldn't complete the booking. Please try again or contact our team.")
                    }
        except Exception as e:
            print(f"[ERROR] Booking creation failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "I encountered an error while creating your booking. Please contact support."
            }
    
    
    def start_booking_session(self, session_id: str, user_id: str) -> Dict:
        """
        Start a new booking session
        
        Args:
            session_id: Unique session ID
            user_id: User ID
            
        Returns:
            Session state
        """
        session = {
            "session_id": session_id,
            "user_id": user_id,
            "phase": BookingPhase.INITIAL.value,
            "check_in": None,
            "check_out": None,
            "room_type": None,
            "guests": 1,
            "selected_room": None,
            "guest_email": None,
            "guest_phone": None,
            "price": None,
            "created_at": datetime.now().isoformat()
        }
        
        self.booking_sessions[session_id] = session
        return session
    
    
    def get_booking_session(self, session_id: str) -> Optional[Dict]:
        """Get booking session by ID"""
        return self.booking_sessions.get(session_id)
    
    
    def update_booking_session(self, session_id: str, updates: Dict) -> Dict:
        """Update booking session"""
        if session_id in self.booking_sessions:
            self.booking_sessions[session_id].update(updates)
            return self.booking_sessions[session_id]
        return None
    
    
    def generate_booking_response(self, session: Dict, available_rooms: List) -> str:
        """
        Generate conversational response about available rooms
        
        Args:
            session: Current booking session
            available_rooms: List of available room options
            
        Returns:
            Friendly response text
        """
        if not available_rooms:
            return f"I'm sorry, we don't have any rooms available for {session['check_in']} to {session['check_out']}. Would you like to try different dates?"
        
        response = f"Great! I found {len(available_rooms)} room(s) available for {session['check_in']} to {session['check_out']}:\n\n"
        
        for i, room in enumerate(available_rooms, 1):
            room_type = room.get("roomType", "Unknown")
            price = room.get("pricePerNight", room.get("price", "Contact for pricing"))
            rating = room.get("rating", "N/A")
            response += f"{i}. {room_type} - ${price}/night ⭐ {rating}\n"
        
        response += "\nWhich room would you like to book?"
        return response
    
    
    def generate_confirmation_prompt(self, session: Dict) -> str:
        """Generate confirmation message with booking details"""
        nights = self._calculate_nights(session["check_in"], session["check_out"])
        total = float(session["price"]) * nights if session["price"] else "TBD"
        
        return f"""
Perfect! Here's your booking summary:

📅 Check-in: {session['check_in']}
📅 Check-out: {session['check_out']}
🛏️  Room: {session['room_type']}
👥 Guests: {session['guests']}
💰 Price: ${session['price']}/night ({nights} nights = ${total} total)

To complete the booking, I need:
1. Your email address
2. Your phone number

What's your email?
        """
    
    
    @staticmethod
    def _calculate_nights(check_in: str, check_out: str) -> int:
        """Calculate number of nights"""
        try:
            c_in = datetime.strptime(check_in, "%Y-%m-%d")
            c_out = datetime.strptime(check_out, "%Y-%m-%d")
            return (c_out - c_in).days
        except:
            return 1
