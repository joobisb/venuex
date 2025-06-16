"""
Sports venue scraping providers.
"""

from .factory import ProviderFactory, provider_factory
from .playo_provider import PlayoProvider, create_playo_config

# Register providers on import
def register_default_providers():
    """Register all default providers with the factory."""
    
    # Register Playo provider
    playo_config = create_playo_config()
    provider_factory.register_provider(PlayoProvider, playo_config)

# Auto-register providers when module is imported
register_default_providers()

__all__ = [
    'ProviderFactory', 
    'provider_factory',
    'PlayoProvider',
    'create_playo_config',
    'register_default_providers'
] 