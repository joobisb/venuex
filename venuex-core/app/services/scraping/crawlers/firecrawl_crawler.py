"""
Firecrawl-based crawler for sports venue scraping.
Implements best practices from Firecrawl documentation.
"""

import asyncio
import time
from typing import Dict, List, Optional, Any
from datetime import datetime

from firecrawl import FirecrawlApp, AsyncFirecrawlApp, ScrapeOptions
from app.core.config import settings

from ..base.models import CrawlResult


class FirecrawlCrawler:
    """Firecrawl-based crawler with async support and best practices."""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize Firecrawl crawler."""
        self.api_key = api_key or settings.firecrawl_api_key
        self.sync_app = FirecrawlApp(api_key=self.api_key)
        self.async_app = AsyncFirecrawlApp(api_key=self.api_key)
    
    async def scrape_single_url(
        self, 
        url: str, 
        platform: str,
        scrape_options: Optional[Dict[str, Any]] = None
    ) -> CrawlResult:
        """Scrape a single URL using async Firecrawl."""
        start_time = time.time()
        
        try:
            # Default scrape options optimized for sports venues
            default_options = {
                'formats': ['markdown', 'html'],
                'timeout': 30000,  # 30 second timeout
            }
            
            if scrape_options:
                default_options.update(scrape_options)
            
            # Use async scraping - pass options directly as keyword arguments
            result = await self.async_app.scrape_url(url, **default_options)
            
            crawl_duration = time.time() - start_time
            
            # Handle different content formats
            raw_html = getattr(result, 'rawHtml', None)
            html_content = getattr(result, 'html', None)
            markdown_content = getattr(result, 'markdown', None)
                        
            return CrawlResult(
                platform=platform,
                url=url,
                success=True,
                markdown_content=markdown_content,
                html_content=html_content,
                raw_html_content=raw_html,
                crawled_at=datetime.utcnow(),
                crawl_duration=crawl_duration,
                pages_crawled=1
            )
            
        except Exception as e:
            return CrawlResult(
                platform=platform,
                url=url,
                success=False,
                error_message=f"Failed to scrape {url}: {str(e)}",
                crawled_at=datetime.utcnow(),
                crawl_duration=time.time() - start_time
            )
    
