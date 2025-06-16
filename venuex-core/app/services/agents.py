from langchain_openai import ChatOpenAI
from langchain.schema.messages import HumanMessage, SystemMessage
from typing import Dict, Any, Optional
from app.core.config import settings
from datetime import datetime

class AgentRouter:
    def __init__(self):
        self.llm = None
        
        if settings.openai_api_key:
            try:
                self.llm = ChatOpenAI(
                    model="gpt-4o",
                    temperature=0,
                    openai_api_key=settings.openai_api_key
                )
            except Exception as e:
                print(f"Warning: Could not initialize OpenAI: {e}")
                self.llm = None
        
    async def process_message(self, message: str, user_id: str) -> Dict[str, Any]:
        """Process message and return venue search results only."""
        # Extract intent from message
        args = self._extract_search_args(message)
        if args:
            # Get venue data from scraper
            venues_found = await self._search_venues_immediately(args["sport"], args["location"])
            
            if venues_found:
                response_msg = f"🔍 Found {len(venues_found)} venues for {args['sport']} in {args['location']}:\n\n"
                
                # Show brief summary of top venues
                for i, venue in enumerate(venues_found[:3], 1):
                    platform = venue.get('platform', 'Unknown')
                    venue_name = venue.get('venue_name', 'Unknown Venue')
                    rating = venue.get('rating', 0)
                    is_bookable = venue.get('is_bookable', False)
                    status = "✅ Available" if is_bookable else "❌ Not Available"
                    
                    response_msg += f"{i}. **{venue_name}** ({platform})\n"
                    if rating > 0:
                        response_msg += f"   ⭐ {rating:.1f}/5\n"
                    response_msg += f"   {status}\n\n"
                
                if len(venues_found) > 3:
                    response_msg += f"... and {len(venues_found) - 3} more venues\n\n"
                
                response_msg += "📋 See all venues below with booking links!"
                
                return {
                    "response": response_msg,
                    "slots_found": venues_found
                }
            else:
                return {
                    "response": f"❌ No venues found for {args['sport']} in {args['location']}. This could be due to:\n\n1. No venues available in this area\n2. Scraping temporarily unavailable\n3. Try a different city (Mumbai, Delhi, Bangalore, Kakkanad)",
                    "slots_found": []
                }
        
        # Temporarily disable OpenAI to test fallback responses
        # if self.llm:
        #     try:
        #         system_prompt = """
        #         You are a sports venue finder agent. Help users find cricket, football, and badminton venues.
        #         You can search in Mumbai, Delhi, Bangalore, and Kakkanad.
        #         
        #         If the user asks about sports venues, guide them to be more specific about:
        #         - Sport type (cricket, football, badminton)
        #         - Location (city name)
        #         
        #         For non-sports queries, politely redirect to sports venue finding.
        #         """
        #         
        #         messages = [
        #             SystemMessage(content=system_prompt),
        #             HumanMessage(content=message)
        #         ]
        #         
        #         response = self.llm.invoke(messages)
        #         return {"response": response.content, "slots_found": []}
        #     except Exception as e:
        #         print(f"Error in OpenAI processing: {e}")
        
        print(f"Using fallback responses for message: {message}")
        
        # Fallback response
        if any(sport in message.lower() for sport in ["cricket", "football", "badminton"]):
            return {
                "response": "I can help you find sports venues! Please specify both the sport and location, like:\n• 'Find cricket venues in Mumbai'\n• 'Show badminton courts in Kakkanad'", 
                "slots_found": []
            }
        else:
            return {
                "response": (
                    "Hello! I'm your sports booking assistant. 🏏 I help you find the perfect venues for "
                    "cricket, football, and badminton.\n\n"
                    "For the best results, please include:\n"
                    "• Sport (cricket, football, or badminton)\n"
                    "• Location (Mumbai, Delhi, Bangalore, or Kakkanad)\n"
                    "• When (today, tomorrow, weekend, specific date/time)\n\n"
                    "Try asking something like \"Find cricket venues in Mumbai for this weekend\" or "
                    "\"I need badminton courts in Kakkanad tomorrow evening\""
                ),
                "slots_found": []
            }
    
    async def _search_venues_immediately(self, sport: str, location: str) -> list:
        """Search for venues using the venue service abstraction."""
        try:
            print(f"Searching for {sport} venues in {location}")
            
            # Use venue service abstraction instead of calling provider directly
            from app.services.scraping.venue_service import venue_service
            
            try:
                # Get venue details through the abstraction
                venues = await venue_service.get_venue_details(location.lower())
                
                if venues:
                    # Convert VenueInfo to response format
                    venues_data = []
                    for venue in venues:
                        # Filter venues that offer the requested sport (if sports data available)
                        if venue.sports_offered and not any(sport.lower() in s.lower() for s in venue.sports_offered):
                            continue  # Skip venues that don't offer the requested sport
                            
                        venues_data.append({
                            'platform': venue.platform,
                            'venue_name': venue.name,
                            'venue_id': venue.venue_id,
                            'city': venue.city,
                            'area': venue.area,
                            'address': venue.address,
                            'sport': sport,
                            'sports_offered': venue.sports_offered,
                            'rating': venue.rating,
                            'rating_count': venue.rating_count,
                            'is_bookable': venue.is_bookable,
                            'booking_url': venue.booking_url,
                            'venue_url': venue.venue_url,
                            'price': 'Check venue for pricing',
                            'time_slots': 'Available slots vary by date',
                            'is_available': venue.is_bookable,
                            'detected_at': datetime.utcnow().isoformat(),
                            'distance': venue.distance
                        })
                    
                    print(f"Venue service: found {len(venues_data)} venues")
                    return venues_data
                    
            except Exception as e:
                print(f"Error using venue service: {e}")
                return []
                
        except Exception as e:
            print(f"Error searching venues: {e}")
            return []
    
    def _extract_search_args(self, message: str) -> Optional[Dict[str, Any]]:
        """Extract sport and location from message."""
        message_lower = message.lower()
        
        # Extract sport
        sport = None
        for s in ["cricket", "football", "badminton"]:
            if s in message_lower:
                sport = s
                break
        
        if not sport:
            return None
        
        # Extract location
        location = None
        cities = ["mumbai", "delhi", "bangalore", "bengaluru", "chennai", "kolkata", "hyderabad", 
                 "pune", "kochi", "kakkanad", "trivandrum"]
        for city in cities:
            if city in message_lower:
                # Map bengaluru to bangalore for consistency
                if city == "bengaluru":
                    location = "bangalore"
                else:
                    location = city
                break
        
        if not location:
            # Try to extract after "in"
            words = message_lower.split()
            try:
                in_idx = words.index("in")
                if in_idx + 1 < len(words):
                    potential_city = words[in_idx + 1]
                    # Only accept if it's a supported city
                    if potential_city in ["mumbai", "delhi", "bangalore", "bengaluru", "kakkanad"]:
                        location = "bangalore" if potential_city == "bengaluru" else potential_city
            except ValueError:
                pass
        
        if not location:
            return None
        
        return {
            "sport": sport,
            "location": location
        }