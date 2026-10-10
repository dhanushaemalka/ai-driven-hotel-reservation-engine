"""
GraphRAG - Knowledge Graph for contextual relationships
Customized for Cloudy Hill Cottage, Ella, Sri Lanka
Enables smarter queries by understanding entity relationships
"""

from typing import Dict, List, Set, Tuple
from dataclasses import dataclass, field


@dataclass
class Entity:
    """Represents a node in the knowledge graph"""
    name: str
    entity_type: str  # "restaurant", "service", "activity", "hotel_feature"
    attributes: Dict = field(default_factory=dict)


@dataclass
class Relationship:
    """Represents an edge in the knowledge graph"""
    source: str
    target: str
    relationship_type: str  # "near", "serves", "requires", "available_at"
    strength: float = 1.0  # Weight of relationship (0-1)


class KnowledgeGraph:
    """GraphRAG implementation for Cloudy Hill Cottage recommendations"""
    
    def __init__(self):
        self.entities: Dict[str, Entity] = {}
        self.relationships: List[Relationship] = []
        self._initialize_graph()
    
    def _initialize_graph(self):
        """Initialize the knowledge graph with Ella, Sri Lanka data"""
        
        # Add Hotel Center
        self.add_entity("Cloudy Hill Cottage", "hotel", {
            "address": "Ella, Badulla District, Sri Lanka",
            "rating": 9.2,
            "open_hours": "24/7",
            "hosts": "Renu & Nalaka",
            "phone": "+94 77 123 4567"
        })
        
        # Add Local Restaurants
        restaurants = [
            {
                "name": "Ella Village Restaurant",
                "distance_km": 0.5,
                "cuisine": ["sri_lankan", "western", "curry"],
                "rating": 4.5,
                "romantic": False,
                "hours": "7:00-22:00",
                "price_range": "$5-15"
            },
            {
                "name": "Cafe Chill",
                "distance_km": 0.8,
                "cuisine": ["international", "vegetarian", "breakfast"],
                "rating": 4.6,
                "romantic": True,
                "hours": "7:00-21:00",
                "price_range": "$8-20"
            },
            {
                "name": "Matey Hut",
                "distance_km": 1.0,
                "cuisine": ["sri_lankan", "seafood", "local"],
                "rating": 4.4,
                "romantic": True,
                "hours": "11:00-22:00",
                "price_range": "$6-18"
            },
            {
                "name": "Dream Cafe",
                "distance_km": 0.6,
                "cuisine": ["western", "pizza", "pasta"],
                "rating": 4.3,
                "romantic": False,
                "hours": "8:00-21:00",
                "price_range": "$7-15"
            },
            {
                "name": "Renu's Kitchen (On-site)",
                "distance_km": 0.0,
                "cuisine": ["sri_lankan", "homemade", "vegetarian"],
                "rating": 4.9,
                "romantic": True,
                "hours": "Breakfast & Dinner",
                "price_range": "Included/By request"
            }
        ]
        
        for rest in restaurants:
            self.add_entity(rest["name"], "restaurant", rest)
            self.add_relationship(
                "Cloudy Hill Cottage", 
                rest["name"], 
                "near",
                strength=1.0 - (rest["distance_km"] / 5)
            )
        
        # Add Activities & Attractions
        activities = [
            {
                "name": "Ella Rock",
                "distance_km": 1.5,
                "type": "hiking",
                "cost": 0,
                "duration": "4-5 hours",
                "difficulty": "moderate",
                "best_time": "5:30 AM start for sunrise"
            },
            {
                "name": "Nine Arch Bridge",
                "distance_km": 2.0,
                "type": "sightseeing",
                "cost": 0,
                "duration": "1-2 hours",
                "difficulty": "easy",
                "best_time": "6 AM sunrise or 3:30 PM for train"
            },
            {
                "name": "Little Adam's Peak",
                "distance_km": 3.0,
                "type": "hiking",
                "cost": 0,
                "duration": "2-3 hours",
                "difficulty": "easy",
                "best_time": "Early morning or late afternoon"
            },
            {
                "name": "Ravana Falls",
                "distance_km": 5.0,
                "type": "nature",
                "cost": 0,
                "duration": "1-2 hours",
                "difficulty": "easy",
                "best_time": "Midday (swimming)"
            },
            {
                "name": "Lipton's Seat",
                "distance_km": 20.0,
                "type": "viewpoint",
                "cost": 25,  # Tuk-tuk cost
                "duration": "Half day",
                "difficulty": "easy (driving)",
                "best_time": "Before 10 AM"
            },
            {
                "name": "Cooking Class with Renu",
                "distance_km": 0.0,
                "type": "experience",
                "cost": 15,
                "duration": "3-4 hours",
                "difficulty": "easy",
                "best_time": "10 AM or 4 PM"
            },
            {
                "name": "Tea Factory Tour",
                "distance_km": 8.0,
                "type": "cultural",
                "cost": 5,
                "duration": "2 hours",
                "difficulty": "easy",
                "best_time": "Morning (factory active)"
            },
            {
                "name": "Kandy-Ella Train Journey",
                "distance_km": 0.5,  # to station
                "type": "experience",
                "cost": 3,
                "duration": "6-7 hours",
                "difficulty": "easy",
                "best_time": "Book in advance!"
            }
        ]
        
        for activity in activities:
            self.add_entity(activity["name"], "activity", activity)
            self.add_relationship(
                "Cloudy Hill Cottage",
                activity["name"],
                "near",
                strength=1.0 - (min(activity["distance_km"], 5) / 5)
            )
        
        # Add Services
        services = [
            {"name": "Bicycle Rental", "available": True, "cost": 10, "unit": "per day"},
            {"name": "Airport Transfer", "available": True, "cost": 80, "unit": "Colombo"},
            {"name": "Tuk-Tuk Tour", "available": True, "cost": 25, "unit": "half day"},
            {"name": "Laundry Service", "available": True, "cost": 5, "unit": "per load"},
            {"name": "Free WiFi", "available": True, "cost": 0, "unit": "included"},
            {"name": "Packed Lunch", "available": True, "cost": 5, "unit": "per person"}
        ]
        
        for service in services:
            self.add_entity(service["name"], "service", service)
            self.add_relationship(
                "Cloudy Hill Cottage",
                service["name"],
                "provides"
            )
        
        # Add cuisine relationships to restaurants
        for rest in restaurants:
            for cuisine in rest.get("cuisine", []):
                if cuisine not in self.entities:
                    self.add_entity(cuisine, "cuisine_type", {})
                self.add_relationship(
                    rest["name"],
                    cuisine,
                    "serves",
                    strength=0.9
                )
        
        # Add activity type relationships
        activity_tags = {
            "hiking": ["Ella Rock", "Little Adam's Peak"],
            "sightseeing": ["Nine Arch Bridge", "Lipton's Seat"],
            "nature": ["Ravana Falls"],
            "experience": ["Cooking Class with Renu", "Kandy-Ella Train Journey"],
            "cultural": ["Tea Factory Tour"]
        }
        
        for tag, activities_list in activity_tags.items():
            if tag not in self.entities:
                self.add_entity(tag, "activity_type", {})
            for activity_name in activities_list:
                self.add_relationship(activity_name, tag, "is_type_of")
    
    def add_entity(self, name: str, entity_type: str, attributes: Dict = None):
        """Add entity to graph"""
        self.entities[name] = Entity(name, entity_type, attributes or {})
    
    def add_relationship(self, source: str, target: str, rel_type: str, strength: float = 1.0):
        """Add relationship to graph"""
        self.relationships.append(
            Relationship(source, target, rel_type, strength)
        )
    
    def find_neighbors(self, entity: str, rel_type: str = None) -> List[Tuple[str, str]]:
        """Find related entities"""
        neighbors = []
        for rel in self.relationships:
            if rel.source == entity:
                if rel_type is None or rel.relationship_type == rel_type:
                    neighbors.append((rel.target, rel.relationship_type))
        return neighbors
    
    def find_entities_with_attributes(self, entity_type: str = None, **attributes) -> List[str]:
        """Find entities matching criteria"""
        results = []
        for name, entity in self.entities.items():
            if entity_type and entity.entity_type != entity_type:
                continue
            
            match = True
            for key, value in attributes.items():
                if key not in entity.attributes:
                    match = False
                    break
                
                attr_val = entity.attributes[key]
                
                if isinstance(value, list):
                    if isinstance(attr_val, list):
                        if not any(v in attr_val for v in value):
                            match = False
                    else:
                        match = False
                elif isinstance(value, bool):
                    if attr_val != value:
                        match = False
                elif isinstance(value, (int, float)):
                    if attr_val > value:  # Distance check: entity distance should be <= requested max
                        match = False
                elif value not in str(attr_val):
                    match = False
            
            if match:
                results.append(name)
        
        return results
    
    def query_itinerary(self, preferences: Dict) -> List[Dict]:
        """
        Advanced query using graph relationships
        Returns ranked recommendations based on preferences
        """
        recommendations = []
        
        # Extract preferences
        cuisine_pref = preferences.get("cuisine", [])
        romantic = preferences.get("romantic", False)
        distance_max = preferences.get("max_distance_km", 5.0)
        activity_type = preferences.get("activity_type", None)
        
        # Find matching restaurants
        if cuisine_pref or romantic:
            query_attrs = {"distance_km": distance_max}
            if romantic:
                query_attrs["romantic"] = True
            
            matching_restaurants = self.find_entities_with_attributes("restaurant", **query_attrs)
            
            for rest_name in matching_restaurants:
                rest = self.entities[rest_name]
                
                if cuisine_pref:
                    rest_cuisines = rest.attributes.get("cuisine", [])
                    cuisine_match = any(c in rest_cuisines for c in cuisine_pref)
                    if not cuisine_match:
                        continue
                
                distance = rest.attributes.get("distance_km", 999)
                rating = rest.attributes.get("rating", 3.0)
                score = rating * (1 - (distance / 5))
                
                recommendations.append({
                    "name": rest_name,
                    "type": "restaurant",
                    "rating": rating,
                    "distance_km": distance,
                    "cuisine": rest.attributes.get("cuisine", []),
                    "hours": rest.attributes.get("hours", "Unknown"),
                    "price_range": rest.attributes.get("price_range", "Unknown"),
                    "score": score
                })
        
        # Find matching activities
        activity_attrs = {"distance_km": distance_max}
        matching_activities = self.find_entities_with_attributes("activity", **activity_attrs)
        
        for act_name in matching_activities:
            activity = self.entities[act_name]
            
            if activity_type:
                if activity.attributes.get("type") != activity_type:
                    continue
            
            distance = activity.attributes.get("distance_km", 999)
            score = 5.0 * (1 - (distance / 25))  # Activities can be further
            
            recommendations.append({
                "name": act_name,
                "type": "activity",
                "activity_type": activity.attributes.get("type", "general"),
                "distance_km": distance,
                "duration": activity.attributes.get("duration", "Unknown"),
                "cost": activity.attributes.get("cost", 0),
                "difficulty": activity.attributes.get("difficulty", "moderate"),
                "best_time": activity.attributes.get("best_time", "Any time"),
                "score": score
            })
        
        # Sort by score
        recommendations.sort(key=lambda x: x["score"], reverse=True)
        
        return recommendations[:5]  # Top 5 recommendations


def format_graph_context(recommendations: List[Dict], preferences: Dict) -> str:
    """Format graph query results for LLM"""
    
    if not recommendations:
        return "No matching venues found with your criteria. But Ella has many wonderful places - ask me for general recommendations!"
    
    context = f"Based on your preferences:\n\n"
    
    restaurants = [r for r in recommendations if r["type"] == "restaurant"]
    activities = [r for r in recommendations if r["type"] == "activity"]
    
    if restaurants:
        context += "**🍽️ Restaurants:**\n"
        for i, rec in enumerate(restaurants[:3], 1):
            context += f"{i}. **{rec['name']}**\n"
            context += f"   - Rating: {rec['rating']}/5.0\n"
            context += f"   - Distance: {rec['distance_km']} km from cottage\n"
            context += f"   - Cuisines: {', '.join(rec['cuisine'])}\n"
            context += f"   - Hours: {rec['hours']}\n"
            context += f"   - Price: {rec.get('price_range', 'Ask locally')}\n\n"
    
    if activities:
        context += "\n**🎯 Activities:**\n"
        for i, rec in enumerate(activities[:3], 1):
            context += f"{i}. **{rec['name']}**\n"
            context += f"   - Type: {rec.get('activity_type', 'General')}\n"
            context += f"   - Distance: {rec['distance_km']} km\n"
            context += f"   - Duration: {rec.get('duration', 'Varies')}\n"
            context += f"   - Cost: ${rec.get('cost', 0)}\n"
            context += f"   - Best Time: {rec.get('best_time', 'Any time')}\n\n"
    
    return context
