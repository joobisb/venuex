"""
Unit tests for app.services.agents.AgentRouter
"""
import pytest
from unittest.mock import Mock, AsyncMock, patch, MagicMock
from datetime import datetime
from typing import Dict, Any, List

from app.services.agents import AgentRouter


class TestAgentRouter:
    """Test suite for AgentRouter class."""
    
    @pytest.fixture
    def agent_router(self, mock_settings):
        """Create an AgentRouter instance for testing."""
        with patch('app.services.agents.settings', mock_settings):
            with patch('app.services.agents.ChatOpenAI') as mock_chat_openai:
                mock_chat_openai.return_value = Mock()
                return AgentRouter()
    
    @pytest.fixture
    def agent_router_no_openai(self):
        """Create an AgentRouter instance without OpenAI for testing fallback."""
        with patch('app.services.agents.settings') as mock_settings:
            mock_settings.openai_api_key = None
            return AgentRouter()

    class TestInit:
        """Test AgentRouter initialization."""
        
        def test_init_with_openai_api_key(self, mock_settings):
            """Test initialization when OpenAI API key is available."""
            with patch('app.services.agents.settings', mock_settings):
                with patch('app.services.agents.ChatOpenAI') as mock_chat_openai:
                    mock_llm = Mock()
                    mock_chat_openai.return_value = mock_llm
                    
                    router = AgentRouter()
                    
                    assert router.llm == mock_llm
                    mock_chat_openai.assert_called_once_with(
                        model="gpt-4o",
                        temperature=0,
                        openai_api_key="test-api-key"
                    )
        
        def test_init_without_openai_api_key(self):
            """Test initialization when OpenAI API key is not available."""
            with patch('app.services.agents.settings') as mock_settings:
                mock_settings.openai_api_key = None
                
                router = AgentRouter()
                
                assert router.llm is None
        
        def test_init_with_openai_exception(self, mock_settings, capsys):
            """Test initialization when OpenAI initialization raises an exception."""
            with patch('app.services.agents.settings', mock_settings):
                with patch('app.services.agents.ChatOpenAI') as mock_chat_openai:
                    mock_chat_openai.side_effect = Exception("OpenAI connection failed")
                    
                    router = AgentRouter()
                    
                    assert router.llm is None
                    captured = capsys.readouterr()
                    assert "Warning: Could not initialize OpenAI" in captured.out

    class TestExtractSearchArgs:
        """Test _extract_search_args method."""
        
        def test_extract_cricket_mumbai(self, agent_router):
            """Test extracting cricket and Mumbai from message."""
            message = "Find cricket venues in Mumbai"
            result = agent_router._extract_search_args(message)
            
            assert result == {"sport": "cricket", "location": "mumbai"}
        
        def test_extract_football_delhi(self, agent_router):
            """Test extracting football and Delhi from message."""
            message = "Show me football grounds in Delhi"
            result = agent_router._extract_search_args(message)
            
            assert result == {"sport": "football", "location": "delhi"}
        
        def test_extract_badminton_bangalore(self, agent_router):
            """Test extracting badminton and Bangalore from message."""
            message = "I need badminton courts in Bangalore"
            result = agent_router._extract_search_args(message)
            
            assert result == {"sport": "badminton", "location": "bangalore"}
        
        def test_extract_bengaluru_maps_to_bangalore(self, agent_router):
            """Test that Bengaluru gets mapped to Bangalore."""
            message = "cricket venues in Bengaluru"
            result = agent_router._extract_search_args(message)
            
            assert result == {"sport": "cricket", "location": "bangalore"}
        
        def test_extract_kakkanad(self, agent_router):
            """Test extracting Kakkanad location."""
            message = "badminton in Kakkanad"
            result = agent_router._extract_search_args(message)
            
            assert result == {"sport": "badminton", "location": "kakkanad"}
        
        def test_no_sport_mentioned(self, agent_router):
            """Test when no sport is mentioned."""
            message = "Find venues in Mumbai"
            result = agent_router._extract_search_args(message)
            
            assert result is None
        
        def test_no_location_mentioned(self, agent_router):
            """Test when no location is mentioned."""
            message = "Find cricket venues"
            result = agent_router._extract_search_args(message)
            
            assert result is None
        
        def test_unsupported_location(self, agent_router):
            """Test when unsupported location is mentioned."""
            message = "Find cricket venues in Paris"
            result = agent_router._extract_search_args(message)
            
            assert result is None
        
        def test_case_insensitive(self, agent_router):
            """Test that extraction is case insensitive."""
            message = "CRICKET VENUES IN MUMBAI"
            result = agent_router._extract_search_args(message)
            
            assert result == {"sport": "cricket", "location": "mumbai"}

    class TestSearchVenuesImmediately:
        """Test _search_venues_immediately method."""
        
        @pytest.mark.asyncio
        async def test_search_venues_success(self, agent_router, sample_venue_data):
            """Test successful venue search."""
            with patch('app.services.scraping.venue_service.venue_service') as mock_venue_service:
                mock_venue_service.get_venue_details = AsyncMock(return_value=sample_venue_data)
                
                result = await agent_router._search_venues_immediately("cricket", "mumbai")
                
                assert len(result) == 1  # Only cricket venue should be returned
                assert result[0]['venue_name'] == 'Test Cricket Ground'
                assert result[0]['sport'] == 'cricket'
                assert result[0]['platform'] == 'Playo'
                mock_venue_service.get_venue_details.assert_called_once_with("mumbai")
        
        
        @pytest.mark.asyncio
        async def test_search_venues_service_exception(self, agent_router, capsys):
            """Test venue search when service raises an exception."""
            with patch('app.services.scraping.venue_service.venue_service') as mock_venue_service:
                mock_venue_service.get_venue_details = AsyncMock(side_effect=Exception("Service error"))
                
                result = await agent_router._search_venues_immediately("cricket", "mumbai")
                
                assert result == []
                captured = capsys.readouterr()
                assert "Error using venue service" in captured.out
        
        @pytest.mark.asyncio
        async def test_search_venues_filters_by_sport(self, agent_router, sample_venue_data):
            """Test that venues are filtered by sport."""
            with patch('app.services.scraping.venue_service.venue_service') as mock_venue_service:
                mock_venue_service.get_venue_details = AsyncMock(return_value=sample_venue_data)
                
                # Search for football, should only return football venue
                result = await agent_router._search_venues_immediately("football", "mumbai")
                
                assert len(result) == 1
                assert result[0]['venue_name'] == 'Elite Football Club'
                assert result[0]['sport'] == 'football'

    class TestProcessMessage:
        """Test process_message method."""
        
        @pytest.mark.asyncio
        async def test_process_message_venue_search_success(self, agent_router, sample_venue_data):
            """Test processing message with successful venue search."""
            with patch.object(agent_router, '_extract_search_args') as mock_extract:
                with patch.object(agent_router, '_search_venues_immediately') as mock_search:
                    mock_extract.return_value = {"sport": "cricket", "location": "mumbai"}
                    mock_search.return_value = [
                        {
                            'platform': 'Playo',
                            'venue_name': 'Test Cricket Ground',
                            'rating': 4.5,
                            'is_bookable': True
                        }
                    ]
                    
                    result = await agent_router.process_message("Find cricket venues in Mumbai", "user123")
                    
                    assert "Found 1 venues for cricket in mumbai" in result['response']
                    assert "Test Cricket Ground" in result['response']
                    assert "✅ Available" in result['response']
                    assert len(result['slots_found']) == 1
                    mock_extract.assert_called_once_with("Find cricket venues in Mumbai")
                    mock_search.assert_called_once_with("cricket", "mumbai")
        
        @pytest.mark.asyncio
        async def test_process_message_no_venues_found(self, agent_router):
            """Test processing message when no venues are found."""
            with patch.object(agent_router, '_extract_search_args') as mock_extract:
                with patch.object(agent_router, '_search_venues_immediately') as mock_search:
                    mock_extract.return_value = {"sport": "cricket", "location": "mumbai"}
                    mock_search.return_value = []
                    
                    result = await agent_router.process_message("Find cricket venues in Mumbai", "user123")
                    
                    assert "❌ No venues found for cricket in mumbai" in result['response']
                    assert "This could be due to:" in result['response']
                    assert result['slots_found'] == []
        
        @pytest.mark.asyncio
        async def test_process_message_no_search_args(self, agent_router):
            """Test processing message when search args cannot be extracted."""
            with patch.object(agent_router, '_extract_search_args') as mock_extract:
                mock_extract.return_value = None
                
                result = await agent_router.process_message("Hello there", "user123")
                
                assert "Hello! I'm your sports booking assistant" in result['response']
                assert "cricket, football, and badminton" in result['response']
                assert result['slots_found'] == []
        
        @pytest.mark.asyncio
        async def test_process_message_sports_mentioned_no_location(self, agent_router):
            """Test processing message with sports mentioned but no valid location."""
            with patch.object(agent_router, '_extract_search_args') as mock_extract:
                mock_extract.return_value = None
                
                result = await agent_router.process_message("I want cricket venues", "user123")
                
                assert "I can help you find sports venues!" in result['response']
                assert "Please specify both the sport and location" in result['response']
                assert result['slots_found'] == []
        
        @pytest.mark.asyncio
        async def test_process_message_multiple_venues_display(self, agent_router):
            """Test processing message with multiple venues for display formatting."""
            with patch.object(agent_router, '_extract_search_args') as mock_extract:
                with patch.object(agent_router, '_search_venues_immediately') as mock_search:
                    mock_extract.return_value = {"sport": "cricket", "location": "mumbai"}
                    mock_search.return_value = [
                        {
                            'platform': 'Playo',
                            'venue_name': 'Ground 1',
                            'rating': 4.5,
                            'is_bookable': True
                        },
                        {
                            'platform': 'BookMyGame',
                            'venue_name': 'Ground 2',
                            'rating': 4.2,
                            'is_bookable': False
                        },
                        {
                            'platform': 'Playo',
                            'venue_name': 'Ground 3',
                            'rating': 4.8,
                            'is_bookable': True
                        },
                        {
                            'platform': 'Playo',
                            'venue_name': 'Ground 4',
                            'rating': 4.0,
                            'is_bookable': True
                        }
                    ]
                    
                    result = await agent_router.process_message("Find cricket venues in Mumbai", "user123")
                    
                    # Should show first 3 venues
                    assert "1. **Ground 1**" in result['response']
                    assert "2. **Ground 2**" in result['response']
                    assert "3. **Ground 3**" in result['response']
                    assert "... and 1 more venues" in result['response']
                    assert "✅ Available" in result['response']
                    assert "❌ Not Available" in result['response']
                    assert len(result['slots_found']) == 4
        
        @pytest.mark.asyncio
        async def test_process_message_venue_without_rating(self, agent_router):
            """Test processing message with venue that has no rating."""
            with patch.object(agent_router, '_extract_search_args') as mock_extract:
                with patch.object(agent_router, '_search_venues_immediately') as mock_search:
                    mock_extract.return_value = {"sport": "cricket", "location": "mumbai"}
                    mock_search.return_value = [
                        {
                            'platform': 'Playo',
                            'venue_name': 'Test Ground',
                            'rating': 0, 
                            'is_bookable': True
                        }
                    ]
                    
                    result = await agent_router.process_message("Find cricket venues in Mumbai", "user123")
                    
                    # Should not include rating in response when rating is 0
                    assert "⭐" not in result['response']
                    assert "Test Ground" in result['response'] 