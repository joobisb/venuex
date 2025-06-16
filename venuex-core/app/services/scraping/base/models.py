"""
Data models for sports venue scraping system.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, HttpUrl
from enum import Enum


class SportType(str, Enum):
    """Supported sports types."""
    CRICKET = "cricket"
    FOOTBALL = "football"
    BADMINTON = "badminton"


class VenueInfo(BaseModel):
    """Information about a sports venue."""
    platform: str = Field(..., description="Platform/provider name")
    venue_id: Optional[str] = Field(None, description="Platform-specific venue ID")
    name: str = Field(..., description="Venue name")
    city: str = Field(..., description="City name")
    area: Optional[str] = Field(None, description="Area/locality")
    address: Optional[str] = Field(None, description="Full address")
    
    # Sports offered
    sports_offered: List[str] = Field(default_factory=list, description="List of sports available")
    
    # Rating and availability
    rating: Optional[float] = Field(None, description="Average rating")
    rating_count: Optional[int] = Field(None, description="Number of ratings")
    is_bookable: bool = Field(default=False, description="Whether venue is bookable")
    
    # URLs
    booking_url: Optional[str] = Field(None, description="Booking page URL")
    venue_url: Optional[str] = Field(None, description="Venue details URL")
    
    # Additional info
    distance: Optional[float] = Field(None, description="Distance from search location")
    
    # Metadata
    last_updated: datetime = Field(default_factory=datetime.utcnow)


class CrawlResult(BaseModel):
    """Result from a crawling operation (minimal version for crawler compatibility)."""
    platform: str = Field(..., description="Platform/provider name")
    url: str = Field(..., description="Crawled URL")
    success: bool = Field(..., description="Whether crawl was successful")
    
    # Content
    markdown_content: Optional[str] = Field(None, description="Markdown content")
    html_content: Optional[str] = Field(None, description="HTML content")
    raw_html_content: Optional[str] = Field(None, description="Raw HTML content")
    
    # Metadata
    crawled_at: datetime = Field(default_factory=datetime.utcnow)
    error_message: Optional[str] = Field(None, description="Error message if failed")


class ProviderConfig(BaseModel):
    """Configuration for a specific provider."""
    name: str = Field(..., description="Provider name")
    base_url: str = Field(..., description="Base URL")
    enabled: bool = Field(default=True, description="Whether provider is enabled")
    
    # City mappings
    city_mapping: dict = Field(default_factory=dict)
    
    # Rate limiting
    max_requests_per_minute: int = Field(default=30, description="Rate limit")
    request_delay: float = Field(default=1.0, description="Delay between requests in seconds")

