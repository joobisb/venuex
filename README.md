# VenueX - Sports Venue Booking Assistant

A sports venue finder that uses AI to help users discover and book cricket, football, and badminton venues through natural language conversations. Built with accuracy and reliability in mind addressing the common challenge of AI systems providing inconsistent or unreliable results in real-world applications.

## What it does

- **Chat Interface**: Natural language queries like "Find cricket venues in Mumbai"
- **AI-Powered Search**: Uses Large Language Models to understand user intent
- **Multi-Sport Support**: Cricket, football, and badminton venues
- **Real-time Scraping**: Live venue availability and booking information
- **Location Coverage**: Mumbai, Delhi, Bangalore, Kakkanad, and more

## Quick Demo


https://github.com/user-attachments/assets/4a76cc9d-5bc0-44f1-a0cd-f7dd9af6894e



## Quick Setup

### Backend (FastAPI)

```bash
cd venuex-core

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python main.py
```

Backend runs at: http://localhost:8000

### Frontend (React)

```bash
cd ui

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: http://localhost:3000

## Environment Setup

Create `.env` in `venuex-core/`:
```bash
DATABASE_URL=postgresql://user:password@localhost/venuex
OPENAI_API_KEY=your_openai_api_key_here
```

## Running Tests

```bash
cd venuex-core

# Run all unit tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/unit/services/test_agents.py

# Run tests with coverage
pytest --cov=app --cov-report=html
```

Test structure follows Python best practices:
- `tests/unit/` - Unit tests with mocked dependencies
- `tests/conftest.py` - Shared fixtures and configuration
- Uses pytest markers for test categorization

## Limitations & Roadmap

**Current Limitations:**
- Limited to 3 sports: cricket, football, and badminton
- Single venue data provider integration
- Focused on specific geographic regions

**Future Plans:**
- Multi-provider support for comprehensive venue coverage
- Expand to additional sports categories
- Enhanced geographic coverage and localization
- Advanced booking integrations and features
