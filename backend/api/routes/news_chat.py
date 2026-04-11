from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Dict, Optional
from scraper.news_feed import get_news_feed, get_news_item
from nlp.chat_engine import get_chat_response

router = APIRouter(prefix="/api", tags=["news", "chat"])


# ── News Feed ──
@router.get("/news/feed")
def news_feed(category: str = None, limit: int = 20):
    return get_news_feed(category=category, limit=limit)


@router.get("/news/{news_id}")
def news_detail(news_id: str):
    item = get_news_item(news_id)
    if not item:
        return {"error": "News item not found"}
    return item


# ── Chat ──
class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    context: Dict = {}


class ChatResponse(BaseModel):
    response: str
    source: str  # "gemini" or "rule-based"


@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(req: ChatRequest):
    msgs = [{"role": m.role, "content": m.content} for m in req.messages]
    response = get_chat_response(msgs, req.context)

    # Determine source
    import os
    source = "gemini" if os.getenv("GEMINI_API_KEY") else "rule-based"

    return ChatResponse(response=response, source=source)
