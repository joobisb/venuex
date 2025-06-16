"""
Venue service abstraction for getting venue details from providers.
"""

from typing import List, Optional
from .base import VenueInfo, ProviderError
from .providers import provider_factory


class VenueService:
    """Service for getting venue details from providers."""
    
    def __init__(self, default_provider: str = "playo"):
        """Initialize venue service with default provider."""
        self.default_provider = default_provider
    
    async def get_venue_details(self, location: str, provider_name: Optional[str] = None) -> List[VenueInfo]:
        """
        Get venue details for a location.
        
        Args:
            location: City or location name (e.g., 'mumbai', 'delhi')
            provider_name: Specific provider to use (defaults to self.default_provider)
            
        Returns:
            List of VenueInfo objects
            
        Raises:
            ProviderError: If provider fails or is not available
        """
        provider_name = provider_name or self.default_provider
        
        provider = provider_factory.get_provider(provider_name)
        if not provider:
            raise ProviderError(f"Provider '{provider_name}' not available or disabled")
        
        # Check if provider supports the location
        if location.lower() not in provider.supported_cities:
            raise ProviderError(f"Provider '{provider_name}' does not support location '{location}'")
        
        try:
            venues = await provider.get_venue_details(location.lower())
            return venues
        except Exception as e:
            raise ProviderError(f"Failed to get venues from {provider_name}: {str(e)}")
    
    def get_supported_cities(self, provider_name: Optional[str] = None) -> List[str]:
        """Get list of supported cities for a provider."""
        provider_name = provider_name or self.default_provider
        
        provider = provider_factory.get_provider(provider_name)
        if not provider:
            return []
        
        return provider.supported_cities
    
    def get_available_providers(self) -> List[str]:
        """Get list of available provider names."""
        providers = provider_factory.get_all_providers()
        return [p.name for p in providers]


# Global venue service instance
venue_service = VenueService() 