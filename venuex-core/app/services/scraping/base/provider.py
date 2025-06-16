"""
Abstract base provider for sports venue scraping.
"""

from abc import ABC, abstractmethod
from typing import List, Optional
from .models import ProviderConfig, VenueInfo


class BaseProvider(ABC):
    """Abstract base class for sports venue scraping providers."""
    
    def __init__(self, config: ProviderConfig):
        """Initialize provider with configuration."""
        self.config = config
        self.name = config.name
        
    @property
    @abstractmethod
    def supported_cities(self) -> List[str]:
        """Return list of supported cities."""
        pass
    
    @abstractmethod
    async def get_venue_details(self, location: str) -> List[VenueInfo]:
        """Get detailed venue information for the given location."""
        pass
    
    def map_city(self, city: str) -> str:
        """Map city name to provider-specific format."""
        return self.config.city_mapping.get(city.lower(), city.lower())
    
    def __str__(self) -> str:
        return f"{self.__class__.__name__}({self.name})"
    
    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(name='{self.name}', enabled={self.config.enabled})"


class ProviderError(Exception):
    """Base exception for provider-related errors."""
    pass 