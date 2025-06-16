"""
Factory for creating and managing sports venue scraping providers.
"""

from typing import Dict, List, Optional, Type
from ..base.provider import BaseProvider
from ..base.models import ProviderConfig


class ProviderFactory:
    """Factory for creating and managing scraping providers."""
    
    def __init__(self):
        self._providers: Dict[str, Type[BaseProvider]] = {}
        self._configs: Dict[str, ProviderConfig] = {}
        self._instances: Dict[str, BaseProvider] = {}
    
    def register_provider(self, provider_class: Type[BaseProvider], config: ProviderConfig):
        """Register a new provider with its configuration."""
        self._providers[config.name] = provider_class
        self._configs[config.name] = config
    
    def get_provider(self, name: str) -> Optional[BaseProvider]:
        """Get a provider instance by name."""
        if name not in self._instances:
            if name in self._providers and name in self._configs:
                config = self._configs[name]
                if config.enabled:
                    self._instances[name] = self._providers[name](config)
                else:
                    return None
            else:
                return None
        
        return self._instances[name]
    
    def get_all_providers(self) -> List[BaseProvider]:
        """Get all enabled provider instances."""
        providers = []
        for name in self._providers.keys():
            provider = self.get_provider(name)
            if provider:
                providers.append(provider)
        return providers
    
    def get_available_provider_names(self) -> List[str]:
        """Get list of available provider names."""
        return [name for name, config in self._configs.items() if config.enabled]


# Global provider factory instance
provider_factory = ProviderFactory() 