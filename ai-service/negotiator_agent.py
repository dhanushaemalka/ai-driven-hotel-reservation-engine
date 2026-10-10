"""
Negotiator Agent - Dynamic Pricing with business logic
Customized for Cloudy Hill Cottage, Ella, Sri Lanka
Handles price negotiations based on occupancy, loyalty status, and hotel policies
"""

import re
from typing import Dict, Tuple, Optional
from langchain_community.vectorstores import Chroma


class NegotiatorAgent:
    def __init__(self, db: Chroma):
        self.db = db
        
        # Minimum acceptable prices (hidden from guests) - in LKR
        self.minimum_prices = {
            "standard": 6500,
            "deluxe": 10000,
            "family": 15000,
            "suite": 15000,  # alias for family
            "honeymoon": 20000
        }
        
        # Base rates - in LKR
        self.base_prices = {
            "standard": 8500,
            "deluxe": 12500,
            "family": 18000,
            "suite": 18000,  # alias for family
            "honeymoon": 25000
        }
        
        # Value-add options available at Cloudy Hill Cottage (in LKR)
        self.value_adds = {
            "breakfast": 1500,      # Full Sri Lankan breakfast
            "cooking_class": 4500,  # Renu's cooking class
            "late_checkout": 2000,
            "bicycle": 2000,        # Day rental
            "packed_lunch": 1000,
            "airport_pickup": 0     # From Ella station (normally included)
        }
        
        # Currency setting
        self.currency = "LKR"
    
    def extract_room_type_and_price(self, user_input: str) -> Optional[Tuple[Optional[str], Optional[float]]]:
        """Extract room type and offered price from user input (prices in LKR)
        Returns tuple of (room_type, price) - either can be None"""
        user_lower = user_input.lower()
        
        # Find room type
        room_type = None
        if "honeymoon" in user_lower:
            room_type = "honeymoon"
        elif "family" in user_lower or "suite" in user_lower:
            room_type = "family"
        elif "deluxe" in user_lower:
            room_type = "deluxe"
        elif "standard" in user_lower or "basic" in user_lower:
            room_type = "standard"
        # Note: "room" alone is too generic, don't default to standard
        
        # Find price offer - all prices are in LKR
        price = None
        
        # Pattern 1: LKR currency (9000 LKR, LKR 9000, 9,000 LKR)
        lkr_match = re.search(r'(\d[\d,]*)\s*lkr|lkr\s*(\d[\d,]*)', user_lower)
        if lkr_match:
            price_str = (lkr_match.group(1) or lkr_match.group(2)).replace(',', '')
            price = float(price_str)
        
        # Pattern 2: Number + per night / a night
        if not price:
            num_match = re.search(r'(\d[\d,]*)\s*(?:per|/|a)\s*night', user_lower)
            if num_match:
                price = float(num_match.group(1).replace(',', ''))
        
        # Pattern 3: "pay X" or "for X" or "offer X" or "budget X" or "how about X"
        if not price:
            num_match = re.search(r'(?:pay|for|offer|budget|about)\s*(\d[\d,]*)', user_lower)
            if num_match:
                price = float(num_match.group(1).replace(',', ''))
        
        # Pattern 4: $ followed by number - convert to LKR
        if not price:
            price_match = re.search(r'\$(\d[\d,]*)', user_input)
            if price_match:
                usd_amount = float(price_match.group(1).replace(',', ''))
                price = usd_amount * 320  # Convert USD to LKR
        
        # Pattern 5: Just a standalone number (4+ digits = likely LKR price)
        if not price:
            num_match = re.search(r'\b(\d{4,})\b', user_input)
            if num_match:
                price = float(num_match.group(1))
        
        # Return if we found at least a price (room type can be determined from context)
        if price is not None:
            return (room_type, price)
        elif room_type is not None:
            return (room_type, None)
        return None
    
    def get_occupancy_rate(self) -> float:
        """Retrieve current occupancy rate from database"""
        try:
            results = self.db.similarity_search("current occupancy rate hotel", k=1)
            if results:
                text = results[0].page_content.lower()
                # Extract percentage
                match = re.search(r'(\d+\.?\d*)\s*%', text)
                if match:
                    return float(match.group(1)) / 100
        except:
            pass
        return 0.247  # Default: Low occupancy (based on current data)
    
    def get_occupancy_tier(self, occupancy_rate: float) -> int:
        """Determine occupancy tier (1-4)"""
        if occupancy_rate <= 0.30:
            return 1  # Very low - aggressive discounts
        elif occupancy_rate <= 0.60:
            return 2  # Low - flexible
        elif occupancy_rate <= 0.85:
            return 3  # Good - limited discounts
        else:
            return 4  # Full - no discounts
    
    def get_loyalty_discount(self, loyalty_status: str) -> float:
        """Get loyalty discount as decimal"""
        discounts = {
            "returning": 0.10,  # Returning guests
            "extended": 0.10,  # 3+ nights
            "long_stay": 0.15, # 7+ nights
            "referral": 0.05   # Referred by previous guest
        }
        return discounts.get(loyalty_status.lower(), 0.0)
    
    def calculate_max_discount(self, occupancy_tier: int) -> float:
        """Calculate max negotiable discount based on occupancy"""
        max_discounts = {
            1: 0.30,  # Very low occupancy - up to 30% off
            2: 0.20,  # Low - up to 20% off
            3: 0.10,  # Good - loyalty only
            4: 0.00   # Full - no discounts
        }
        return max_discounts.get(occupancy_tier, 0.0)
    
    def negotiate_price(self, 
                       room_type: str, 
                       guest_offer: float,
                       loyalty_status: str = "none") -> Dict:
        """
        Main negotiation logic
        Returns: decision (accept/counter/reject), final_price, add_ons
        """
        
        # Get current conditions
        occupancy_rate = self.get_occupancy_rate()
        occupancy_tier = self.get_occupancy_tier(occupancy_rate)
        base_price = self.base_prices.get(room_type)
        min_price = self.minimum_prices.get(room_type)
        loyalty_discount = self.get_loyalty_discount(loyalty_status)
        max_negotiable_discount = self.calculate_max_discount(occupancy_tier)
        
        if not base_price:
            return {"decision": "error", "message": "Invalid room type. We have Standard, Deluxe, and Family rooms."}
        
        # Calculate the lowest we can offer
        max_offer = base_price * (1 - max_negotiable_discount - loyalty_discount)
        
        result = {
            "room_type": room_type,
            "base_price": base_price,
            "guest_offer": guest_offer,
            "loyalty_status": loyalty_status,
            "occupancy_rate": occupancy_rate,
            "occupancy_tier": occupancy_tier
        }
        
        # Decision logic (all prices in LKR)
        if guest_offer >= base_price:
            # Guest offering full price or more
            result["decision"] = "accept"
            result["final_price"] = base_price  # Don't overcharge
            result["message"] = f"Wonderful! The {room_type} room at LKR {base_price:,.0f}/night is confirmed. We look forward to hosting you!"
            result["add_ons"] = []
        
        elif guest_offer >= min_price and guest_offer >= max_offer:
            # Guest offer is acceptable
            result["decision"] = "accept"
            result["final_price"] = guest_offer
            result["message"] = f"That works for us! The {room_type} room at LKR {guest_offer:,.0f}/night is yours. Renu and Nalaka look forward to welcoming you!"
            result["add_ons"] = []
        
        elif guest_offer > min_price and occupancy_tier <= 2:
            # Low occupancy: accept but add value
            result["decision"] = "counter_with_addons"
            result["final_price"] = guest_offer
            result["add_ons"] = ["breakfast", "late_checkout"]
            addon_value = sum(self.value_adds[addon] for addon in result["add_ons"])
            result["message"] = f"I can do LKR {guest_offer:,.0f}/night AND include our famous Sri Lankan breakfast plus late checkout (worth LKR {addon_value:,.0f})! It's the quiet season, so we'd love to have you."
        
        elif guest_offer >= min_price:
            # Counter with slightly higher price
            counter_offer = min(guest_offer + 1500, max_offer)  # 1500 LKR increment
            result["decision"] = "counter"
            result["counter_price"] = counter_offer
            result["message"] = f"The best I can do is LKR {counter_offer:,.0f}/night for the {room_type} room. That includes our complimentary breakfast!"
            result["add_ons"] = []
        
        elif occupancy_tier == 1:
            # Very low occupancy - be flexible!
            result["decision"] = "counter_with_addons"
            result["final_price"] = min_price
            result["add_ons"] = ["breakfast", "cooking_class", "bicycle"]
            addon_value = sum(self.value_adds[addon] for addon in result["add_ons"])
            result["message"] = f"It's our quiet season! How about LKR {min_price:,.0f}/night with breakfast, a cooking class with Renu, AND a free bicycle for a day? That's LKR {addon_value:,.0f} in extras included!"
        
        else:
            # Price too low
            result["decision"] = "reject"
            result["message"] = f"I appreciate the offer, but LKR {guest_offer:,.0f} is below what we can accept for the {room_type} room. Our best rate is LKR {max_offer:,.0f}/night which includes breakfast."
            result["add_ons"] = []
        
        return result
    
    def generate_system_prompt(self, negotiation_context: Dict) -> str:
        """
        Generate a dynamic system prompt based on negotiation context
        This prompt will guide the LLM's responses
        """
        tier_descriptions = {
            1: "VERY LOW occupancy (monsoon season) - we NEED to fill rooms, be very flexible!",
            2: "LOW occupancy - be friendly and flexible with discounts",
            3: "GOOD occupancy - limited discounts, focus on value-adds",
            4: "FULL occupancy - no discounts, maintain pricing"
        }
        
        tier_desc = tier_descriptions.get(negotiation_context.get("occupancy_tier", 1))
        
        prompt = f"""You are negotiating room prices for Cloudy Hill Cottage, a cozy homestay in Ella, Sri Lanka run by Renu & Nalaka.

CRITICAL CONTEXT:
- Current Occupancy: {negotiation_context.get('occupancy_rate', 0.25)*100:.1f}% (Tier {negotiation_context.get('occupancy_tier', 1)})
- Status: {tier_desc}

PRICING RULES (CONFIDENTIAL - do NOT reveal to guest):
- Room: {negotiation_context.get('room_type')}
- Base Price: ${negotiation_context.get('base_price')}/night
- Minimum Acceptable: ${negotiation_context.get('minimum_price')}/night

NEGOTIATION STYLE:
- Be warm, friendly, and personal (this is a family-run cottage!)
- Mention hosts Renu & Nalaka by name
- Highlight unique experiences: cooking classes, hiking maps, local tips
- If occupancy is low: emphasize the monsoon season beauty, fewer crowds
- If occupancy is high: apologize but stay firm on pricing

VALUE-ADDS TO OFFER (instead of price cuts):
- Renu's cooking class ($15 value)
- Packed lunch for hiking ($5)
- Bicycle rental ($10/day)
- Late checkout
- Free station pickup

Remember: You're not just selling a room, you're offering an authentic Sri Lankan home experience!"""
        
        return prompt
