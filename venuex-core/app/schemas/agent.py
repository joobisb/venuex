from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
class AgentChatRequest(BaseModel):
    message: str = Field(
        description="Natural language message to the AI agent",
        example="Find cricket venues in Mumbai"
    )
    user_id: str = Field(
        description="User identifier",
        example="user123"
    )

class AgentChatResponse(BaseModel):
    response: str = Field(
        description="AI agent's response message",
        example="🔍 Found 5 venues for cricket in Mumbai..."
    )
    slots_found: Optional[list] = Field(
        None,
        description="List of venues found by the agent"
    )
