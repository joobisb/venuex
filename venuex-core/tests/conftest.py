"""
Test configuration and fixtures for the test suite.
"""
import pytest
from unittest.mock import Mock, AsyncMock
import asyncio
from typing import Dict, Any, List
from datetime import datetime


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def mock_settings():
    """Mock application settings."""
    settings = Mock()
    settings.openai_api_key = "test-api-key"
    settings.environment = "test"
    return settings


@pytest.fixture
def mock_chat_openai():
    """Mock ChatOpenAI instance."""
    mock_llm = Mock()
    mock_llm.invoke = AsyncMock()
    return mock_llm


@pytest.fixture
def mock_venue_service():
    """Mock venue service."""
    mock_service = Mock()
    mock_service.get_venue_details = AsyncMock()
    return mock_service


@pytest.fixture
def sample_venue_data():
    """Sample venue data for testing."""
    from unittest.mock import Mock
    
    venue1 = Mock()
    venue1.platform = "Playo"
    venue1.name = "Test Cricket Ground"
    venue1.venue_id = "venue-1"
    venue1.city = "mumbai"
    venue1.area = "Bandra"
    venue1.address = "123 Test Street, Bandra, Mumbai"
    venue1.sports_offered = ["cricket"]
    venue1.rating = 4.5
    venue1.rating_count = 100
    venue1.is_bookable = True
    venue1.booking_url = "https://test.com/book"
    venue1.venue_url = "https://test.com/venue"
    venue1.distance = "2.5 km"
    
    venue2 = Mock()
    venue2.platform = "BookMyGame"
    venue2.name = "Elite Football Club"
    venue2.venue_id = "venue-2"
    venue2.city = "mumbai"
    venue2.area = "Andheri"
    venue2.address = "456 Test Avenue, Andheri, Mumbai"
    venue2.sports_offered = ["football"]
    venue2.rating = 4.2
    venue2.rating_count = 85
    venue2.is_bookable = True
    venue2.booking_url = "https://test.com/book2"
    venue2.venue_url = "https://test.com/venue2"
    venue2.distance = "3.2 km"
    
    return [venue1, venue2]


@pytest.fixture
def sample_venue_response_data():
    """Sample venue response data in expected format."""
    return [
        {
            'platform': 'Playo',
            'venue_name': 'Test Cricket Ground',
            'venue_id': 'venue-1',
            'city': 'mumbai',
            'area': 'Bandra',
            'address': '123 Test Street, Bandra, Mumbai',
            'sport': 'cricket',
            'sports_offered': ['cricket'],
            'rating': 4.5,
            'rating_count': 100,
            'is_bookable': True,
            'booking_url': 'https://test.com/book',
            'venue_url': 'https://test.com/venue',
            'price': 'Check venue for pricing',
            'time_slots': 'Available slots vary by date',
            'is_available': True,
            'distance': '2.5 km'
        }
    ] 