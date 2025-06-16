from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import agents
from app.core.config import settings

app = FastAPI(
    title="VenueX Core API",
    description="""
    Sports slot monitoring agent backend for cricket, football, and badminton in India & UK.
    
    ## Features
    - **Natural Language Interface**: Chat with AI agent to create monitors
    - **Durable Workflows**: Temporal-based monitoring with 10-minute polling
    - **Web Scraping**: Firecrawl integration for slot availability
    - **Notifications**: Push notifications and email alerts
    
    ## Usage
    1. Use `/api/v1/agents/chat` to interact with the AI agent naturally
    
    ## Authentication
    Currently uses simple user_id parameter. In production, implement proper auth.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

app.include_router(agents.router, prefix="/api/v1/agents", tags=["agents"])

@app.get("/")
async def root():
    return {"message": "venuex Core API is running", "status": "healthy"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)