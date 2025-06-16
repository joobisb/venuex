"""
Playo.co provider for sports venue scraping.
"""

from typing import List, Dict, Any, Optional
import re
import json
from datetime import datetime
from pydantic import BaseModel, Field

from ..base.provider import BaseProvider, ProviderError
from ..base.models import ProviderConfig, VenueInfo
from ..crawlers.firecrawl_crawler import FirecrawlCrawler


class PlayoVenueInfo(BaseModel):
    """Structured venue information from Playo JSON data."""
    id: str = Field(description="Unique venue identifier")
    name: str = Field(description="Venue name")
    area: str = Field(description="Area/locality")
    city: str = Field(description="City")
    address: str = Field(description="Full address")
    is_bookable: bool = Field(description="Whether venue is bookable")
    avg_rating: float = Field(description="Average rating")
    rating_count: int = Field(description="Number of ratings")
    sports: List[str] = Field(description="List of sport IDs available")
    active_key: str = Field(description="URL slug for the venue")
    booking_url: str = Field(description="Direct booking URL")
    distance: Optional[float] = Field(description="Distance from search location")


class PlayoProvider(BaseProvider):
    """Provider for scraping Playo.co sports venue booking URLs."""
    
    def __init__(self, config: ProviderConfig):
        super().__init__(config)
        self.crawler = FirecrawlCrawler()
    
    @property
    def supported_cities(self) -> List[str]:
        """Cities supported by Playo."""
        return ['mumbai', 'delhi', 'bangalore', 'bengaluru', 'pune', 'hyderabad', 'chennai', 'kochi', 'kakkanad']
    
    def build_url(self, locality: str) -> str:
        """Build Playo URL for given locality."""
        # Map locality to Playo format
        mapped_locality = self.map_city(locality)
        
        # Playo's URL structure: https://playo.co/venues/{locality}/sports/all
        return f"{self.config.base_url}/venues/{mapped_locality}/sports/all"
    
    def get_crawl_config(self) -> Dict[str, Any]:
        """Get Playo-specific scrape configuration."""
        return {
            'formats': ['rawHtml', 'html'],  # Use rawHtml to get unmodified content
            'timeout': 30000,  # 30 second timeout
            'actions': [
                {"type": "wait", "milliseconds": 3000},  # Wait for page to load
                {"type": "scrape"}  # Then scrape the content
            ]
        }
    
    async def get_booking_urls(self, locality: str) -> List[str]:
        """Get booking URLs for all bookable venues in the locality."""
        try:
            # Build the URL for the locality
            url = self.build_url(locality)
            scrape_config = self.get_crawl_config()
            
            print(f"DEBUG: Crawling URL: {url}")
            
            # Scrape the main venue listing page
            result = await self.crawler.scrape_single_url(
                url, 
                self.name,
                scrape_config
            )
            
            if not result.success:
                raise ProviderError(f"Failed to scrape Playo venue listing: {result.error_message}")
            
            # Try to access raw_html_content first, then fall back to html_content
            html_content = result.raw_html_content or result.html_content or ""
            
            if not html_content:
                raise ProviderError("No HTML content received from Playo")
            
            print(f"DEBUG: HTML content length: {len(html_content)}")
            
            # Extract JSON data from HTML
            json_data = self._extract_json_from_html(html_content)
            if not json_data:
                # Try fallback HTML parsing approach
                print("Trying fallback HTML parsing approach...")
                venues = self._parse_html_content_fallback(html_content, locality)
                if venues:
                    print(f"Fallback parsing found {len(venues)} venues")
                    booking_urls = [venue.booking_url for venue in venues if venue.is_bookable]
                    return booking_urls
                else:
                    raise ProviderError("Could not extract venue data from Playo page using any method")
            
            # Parse venue data and get booking URLs
            venues = self._parse_venue_data(json_data)
            sport_mapping = self._get_sport_names(json_data)
            
            # Add sport names to venues
            for venue in venues:
                venue_sports = []
                for sport_id in venue.sports:
                    sport_name = sport_mapping.get(sport_id, sport_id)
                    venue_sports.append(sport_name)
                venue.sports = venue_sports
            
            # Filter for bookable venues and return URLs
            booking_urls = [venue.booking_url for venue in venues if venue.is_bookable]
            
            print(f"DEBUG: Found {len(booking_urls)} bookable venues")
            
            return booking_urls
            
        except Exception as e:
            raise ProviderError(f"Failed to get booking URLs from Playo: {str(e)}")
    
    async def get_venue_details(self, location: str) -> List[VenueInfo]:
        """Get detailed venue information for the given location."""
        try:
            url = self.build_url(location)
            scrape_config = self.get_crawl_config()
            
            result = await self.crawler.scrape_single_url(url, self.name, scrape_config)
            
            if not result.success:
                raise ProviderError(f"Failed to scrape Playo venue listing: {result.error_message}")
            
            html_content = result.raw_html_content or result.html_content or ""
            
            if not html_content:
                raise ProviderError("No HTML content received from Playo")
            
            json_data = self._extract_json_from_html(html_content)
            if not json_data:
                raise ProviderError("Could not extract JSON data from Playo page")
            
            playo_venues = self._parse_venue_data(json_data)
            sport_mapping = self._get_sport_names(json_data)
            
            # Convert PlayoVenueInfo to VenueInfo
            venues = []
            for playo_venue in playo_venues:
                # Map sport IDs to sport names
                sport_names = []
                for sport_id in playo_venue.sports:
                    sport_name = sport_mapping.get(sport_id, sport_id)
                    sport_names.append(sport_name)
                
                venue = VenueInfo(
                    platform=self.name,
                    venue_id=playo_venue.id,
                    name=playo_venue.name,
                    city=playo_venue.city,
                    area=playo_venue.area,
                    address=playo_venue.address,
                    sports_offered=sport_names,
                    rating=playo_venue.avg_rating,
                    rating_count=playo_venue.rating_count,
                    is_bookable=playo_venue.is_bookable,
                    booking_url=playo_venue.booking_url,
                    venue_url=f"https://playo.co/venue/{playo_venue.active_key}" if playo_venue.active_key else None,
                    distance=playo_venue.distance
                )
                venues.append(venue)
            
            return venues
            
        except Exception as e:
            raise ProviderError(f"Failed to get venue details from Playo: {str(e)}")
    
    def _extract_json_from_html(self, html_content: str) -> Optional[Dict[str, Any]]:
        """
        Extract the __NEXT_DATA__ JSON from the HTML content.
        """
        try:
            # Debug: Check if __NEXT_DATA__ exists in the content
            if '__NEXT_DATA__' in html_content:
                print("✅ Found __NEXT_DATA__ in HTML content")
            else:
                print("❌ __NEXT_DATA__ not found in HTML content")
                # Let's check what script tags are available
                script_matches = re.findall(r'<script[^>]*id="([^"]*)"[^>]*>', html_content)
                print(f"Available script IDs: {script_matches[:10]}")  # Show first 10
                
                # Check for any Next.js related patterns
                next_patterns = re.findall(r'<script[^>]*>(.*?Next.*?)</script>', html_content, re.DOTALL | re.IGNORECASE)
                if next_patterns:
                    print(f"Found {len(next_patterns)} Next.js related scripts")
                
                return None
            
            # Try multiple patterns for the __NEXT_DATA__ script tag
            patterns = [
                r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>',
                r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>',
                r'<script[^>]*id="__NEXT_DATA__"[^>]*>(.*?)</script>',
            ]
            
            for pattern in patterns:
                match = re.search(pattern, html_content, re.DOTALL)
                if match:
                    print(f"✅ Found __NEXT_DATA__ with pattern: {pattern}")
                    json_content = match.group(1).strip()
                    
                    # Clean up any HTML entities
                    json_content = json_content.replace('&quot;', '"').replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
                    
                    return json.loads(json_content)
            
            print("❌ Could not find __NEXT_DATA__ script tag with any pattern")
            return None
                
        except json.JSONDecodeError as e:
            print(f"❌ Failed to parse JSON: {e}")
            # Print first 500 chars of the content that failed to parse
            json_preview = json_content[:500] if 'json_content' in locals() else "No content"
            print(f"JSON preview: {json_preview}")
            return None
        except Exception as e:
            print(f"❌ Error extracting JSON: {e}")
            return None
    
    def _parse_venue_data(self, json_data: Dict[str, Any]) -> List[PlayoVenueInfo]:
        """Parse venue information from the extracted JSON data."""
        venues = []
        
        try:
            # Navigate to the venue list
            venue_list = json_data.get('props', {}).get('pageProps', {}).get('listData', {}).get('data', {}).get('venueList', [])
            
            if not venue_list:
                print("❌ No venue list found in JSON data")
                return venues
                
            print(f"📊 Found {len(venue_list)} venues in JSON data")
            
            for venue_data in venue_list:
                try:
                    venue = PlayoVenueInfo(
                        id=venue_data.get('id', ''),
                        name=venue_data.get('name', ''),
                        area=venue_data.get('area', ''),
                        city=venue_data.get('city', ''),
                        address=venue_data.get('address', ''),
                        is_bookable=venue_data.get('isBookable', False),
                        avg_rating=venue_data.get('avgRating', 0.0),
                        rating_count=venue_data.get('ratingCount', 0),
                        sports=venue_data.get('sports', []),
                        active_key=venue_data.get('activeKey', ''),
                        booking_url=f"https://playo.co/booking?venueId={venue_data.get('id', '')}",
                        distance=venue_data.get('distance')
                    )
                    venues.append(venue)
                    
                except Exception as e:
                    print(f"⚠️ Error parsing venue data: {e}")
                    continue
                    
        except Exception as e:
            print(f"❌ Error parsing venue data: {e}")
            
        return venues
    
    def _get_sport_names(self, json_data: Dict[str, Any]) -> Dict[str, str]:
        """Extract sport ID to name mapping from JSON data."""
        sport_mapping = {}
        
        try:
            sports_list = json_data.get('props', {}).get('pageProps', {}).get('allSports', {}).get('list', [])
            
            for sport in sports_list:
                sport_id = sport.get('sportId')
                sport_name = sport.get('name')
                if sport_id and sport_name:
                    sport_mapping[sport_id] = sport_name
                    
        except Exception as e:
            print(f"⚠️ Error extracting sport names: {e}")
            
        return sport_mapping
    
    def _parse_html_content_fallback(self, html_content: str, locality: str) -> List[PlayoVenueInfo]:
        """Fallback method to parse venue information from HTML when JSON data is not available."""
        venues = []
        
        try:
            import re
            
            # Look for venue cards or blocks in the HTML
            # This is a simplified approach - adjust patterns based on actual HTML structure
            venue_patterns = [
                r'data-venue-id="([^"]+)"[^>]*>([^<]*venue[^<]*)',
                r'href="/venue/([^"]+)"[^>]*>([^<]+)',
                r'venueId["\']?\s*:\s*["\']?([^"\'>\s,]+)',
            ]
            
            venue_ids = set()
            for pattern in venue_patterns:
                matches = re.findall(pattern, html_content, re.IGNORECASE)
                for match in matches:
                    if isinstance(match, tuple) and len(match) >= 1:
                        venue_id = match[0]
                        venue_name = match[1] if len(match) > 1 else f"Venue {venue_id}"
                    else:
                        venue_id = match
                        venue_name = f"Venue {venue_id}"
                    
                    if venue_id and venue_id not in venue_ids:
                        venue_ids.add(venue_id)
                        
                        # Create basic venue info
                        venue = PlayoVenueInfo(
                            id=venue_id,
                            name=venue_name.strip(),
                            area=locality.title(),
                            city=locality.title(),
                            address=f"Address in {locality.title()}",
                            is_bookable=True,  # Assume bookable if found on the page
                            avg_rating=0.0,
                            rating_count=0,
                            sports=[],  # Will be filled if we can extract sport info
                            active_key=venue_id,
                            booking_url=f"https://playo.co/booking?venueId={venue_id}",
                            distance=None
                        )
                        venues.append(venue)
            
            print(f"Fallback parsing extracted {len(venues)} venue IDs")
            return venues
            
        except Exception as e:
            print(f"Error in fallback HTML parsing: {e}")
            return []
    
    async def health_check(self) -> Dict[str, Any]:
        """Playo-specific health check."""
        try:
            # Test with a known locality
            test_locality = 'mumbai'
            test_url = self.build_url(test_locality)
            
            result = await self.crawler.scrape_single_url(
                test_url,
                self.name,
                {
                    'timeout': 15000, 
                    'formats': ['html'],
                    'actions': [{"type": "wait", "milliseconds": 3000}]
                }
            )
            
            return {
                'provider': self.name,
                'status': 'healthy' if result.success else 'unhealthy',
                'test_url': test_url,
                'response_time': result.crawl_duration,
                'content_length': len(result.html_content or ''),
                'error': result.error_message if not result.success else None,
            }
            
        except Exception as e:
            return {
                'provider': self.name,
                'status': 'unhealthy',
                'error': str(e),
            }
    
    def get_rate_limit_config(self) -> Dict[str, Any]:
        """Get Playo-specific rate limiting."""
        return {
            'max_requests_per_minute': 20,  # Conservative for Playo
            'request_delay': 3.0,  # 3 seconds between requests
            'burst_limit': 5,  # Max 5 concurrent requests
        }


def create_playo_config() -> ProviderConfig:
    """Create default configuration for Playo provider."""
    return ProviderConfig(
        name='playo',
        base_url='https://playo.co',
        enabled=True,
        city_mapping={
            'mumbai': 'mumbai',
            'delhi': 'delhi-ncr',
            'bangalore': 'bangalore',
            'bengaluru': 'bangalore',
            'pune': 'pune',
            'hyderabad': 'hyderabad',
            'chennai': 'chennai',
            'kochi': 'kochi',
            'kakkanad': 'kakkanad'
        },
        crawl_config={
            'formats': ['rawHtml', 'html'],  # Use rawHtml for unmodified content
            'timeout': 30000,  # 30 second timeout
            'actions': [
                {"type": "wait", "milliseconds": 3000},  # Wait for page to load
                {"type": "scrape"}  # Then scrape the content
            ]
        },
        max_requests_per_minute=20,
        request_delay=3.0,
    ) 