"""SkillBridge – LLM instantiation and async invocation helper."""

from __future__ import annotations

import os

from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()


def get_llm() -> ChatGoogleGenerativeAI:
    """Return a Gemini 3 Pro Preview LLM instance."""
    api_key = os.getenv("GOOGLE_API_KEY", "")
    return ChatGoogleGenerativeAI(
        model="gemini-3-pro-preview",
        google_api_key=api_key,
        temperature=0.2,
    )


async def invoke(llm: ChatGoogleGenerativeAI, system: str, human: str) -> str:
    """Call the LLM asynchronously and return plain text content.

    Handles both plain-string content (older models) and list content
    (Gemini 3 thinking models which return a list of content blocks).
    """
    response = await llm.ainvoke(
        [SystemMessage(content=system), HumanMessage(content=human)]
    )
    content = response.content
    if isinstance(content, list):
        # Thinking models: extract text blocks only
        parts = [
            block.get("text", "") if isinstance(block, dict) else str(block)
            for block in content
            if (isinstance(block, dict) and block.get("type") == "text")
            or not isinstance(block, dict)
        ]
        return "\n".join(parts).strip()
    return content.strip()
