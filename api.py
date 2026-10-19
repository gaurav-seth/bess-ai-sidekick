
from fastapi import FastAPI
from pydantic import BaseModel

from bess_agent import agent
from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI, HTTPException, Query
from telemetry_store import get_latest_reading, get_recent_readings

app = FastAPI(
    title="BESS AI Sidekick API",
    description="API for battery telemetry queries and AI-assisted analysis.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


class ChatRequest(BaseModel):
    question: str
    thread_id: str = "bess-default-session"

class ChatResponse(BaseModel):
    answer: str


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    result = agent.invoke(
        {
            "messages": [
                {"role": "user", "content": request.question}
            ]
        },
        config={
            "configurable": {
                "thread_id": request.thread_id
            }
        },
    )

    answer = ""

    for message in reversed(result["messages"]):
        if message.type == "ai" and message.content:
            answer = message.content
            break

    return ChatResponse(answer=answer)

@app.get("/telemetry/latest")
def latest_telemetry(rack_id: str = "Rack-01"):
    reading = get_latest_reading(rack_id)

    if reading is None:
        raise HTTPException(
            status_code=404,
            detail="No telemetry found for this rack",
        )

    return reading


@app.get("/telemetry/history")
def telemetry_history(
    rack_id: str = "Rack-01",
    limit: int = Query(default=20, ge=1, le=500),
):
    readings = get_recent_readings(rack_id, limit)

    # Return readings from oldest to newest for chart plotting.
    readings.reverse()

    return {
        "rack_id": rack_id,
        "readings": readings,
    }
