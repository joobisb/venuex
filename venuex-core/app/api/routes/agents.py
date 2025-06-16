from fastapi import APIRouter, HTTPException
from app.schemas.agent import AgentChatRequest, AgentChatResponse
from app.services.agents import AgentRouter

router = APIRouter()
agents = AgentRouter()

@router.post("/chat", response_model=AgentChatResponse,
            summary="Chat with AI Agent",
            description="""
            Chat with the AI agent using natural language to find sports venues.
            
            The agent understands requests like:
            - "Find cricket venues in Mumbai"
            - "I need badminton courts in Kakkanad"
            - "Show me football grounds in Bangalore"
            
            **Supported Sports:** cricket, football, badminton  
            **Supported Cities:** Mumbai, Delhi, Bangalore, Kakkanad
            
            **Example Request:**
            ```json
            {
                "message": "Find cricket venues in Mumbai",
                "user_id": "user123"
            }
            ```
            
            **Example Response:**
            ```json
            {
                "response": "🔍 Found 5 venues for cricket in Mumbai...",
                "slots_found": [
                    {
                        "venue_name": "Mumbai Cricket Ground",
                        "platform": "Playo",
                        "rating": 4.5,
                        "is_bookable": true,
                        "booking_url": "https://playo.co/booking?venueId=123"
                    }
                ]
            }
            ```
            """)
async def chat_with_agent(request: AgentChatRequest):
    try:
        result = await agents.process_message(request.message, request.user_id)
        return AgentChatResponse(
            response=result["response"],
            slots_found=result.get("slots_found", [])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

@router.get("/health",
           summary="Agent Health Check",
           description="Check if the AI agent service is running and healthy")
async def agent_health():
    return {"status": "Agent service is healthy"}