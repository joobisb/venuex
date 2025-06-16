"""
Base abstractions for sports venue scraping.
"""

from .provider import BaseProvider, ProviderError
from .models import VenueInfo, ProviderConfig, CrawlResult

__all__ = [
    'BaseProvider',
    'ProviderError',
    'VenueInfo',
    'ProviderConfig',
    'CrawlResult'
] 