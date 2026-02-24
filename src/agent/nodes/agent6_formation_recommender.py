"""Agent 6 – Formation Recommender.

Purpose
-------
Analyse the evaluated employee's skill gaps and search the web (via Gemini
Google Search grounding) to find real, up-to-date training courses on platforms
such as Udemy, Coursera, Pluralsight, YouTube and official documentation.

Returns a list of course dicts:
  {
    "name":               str,
    "platform":           str,   # "Udemy" | "Coursera" | "YouTube" | "Pluralsight" | ...
    "url":                str,   # verified web URL from grounding metadata
    "description":        str,
    "priority":           str,   # "Prioritaire" | "Important" | "Utile"
    "competences_cibles": list[str],
    "importance":         int    # 1-10
  }
"""

from __future__ import annotations

import asyncio
import json
import os
import re
from typing import Any

import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """You are Agent 6 – Formation Recommender of the SkillBridge system.

Your task: analyse the employee's evaluated competences and find REAL, EXISTING online courses that will help them improve their weakest skills.

Rules:
- Search for concrete courses on Udemy, Coursera, Pluralsight, YouTube, LinkedIn Learning, or official docs.
- Focus on competences where niveau_estime < niveau_attendu_12m (highest-priority gaps).
- For each course return EXACTLY this JSON block inside a JSON array:
  {
    "name": "<course title exactly as found online>",
    "platform": "<Udemy|Coursera|Pluralsight|YouTube|LinkedIn Learning|Other>",
    "url": "<direct course URL>",
    "description": "<1-2 sentence description of what the course teaches>",
    "priority": "<Prioritaire|Important|Utile>",
    "competences_cibles": ["<competence_id>", ...],
    "importance": <number 1-10>
  }
- Return 5-10 courses total, ordered by priority descending.
- Output ONLY a valid JSON array. No markdown, no prose, no extra keys.
"""


def _build_prompt(final_output_json: str) -> str:
    """Build a focused search prompt from the evaluated employee JSON."""
    try:
        data = json.loads(final_output_json)
        employee_name = data.get("employee_name", "employé")
        poste = data.get("poste", "développeur")
        gaps = []
        for c in data.get("competences", []):
            niveau = c.get("niveau_estime", 0)
            attendu = c.get("niveau_attendu_12m", 0)
            if niveau < attendu:
                gaps.append({
                    "id": c.get("competence_id", ""),
                    "titre": c.get("titre", ""),
                    "gap": attendu - niveau,
                    "niveau_actuel": niveau,
                    "niveau_cible": attendu,
                })
        gaps.sort(key=lambda x: x["gap"], reverse=True)
        gap_text = "\n".join(
            f"- {g['titre']} (ID: {g['id']}) — niveau actuel {g['niveau_actuel']}/5, cible {g['niveau_cible']}/5, gap={g['gap']}"
            for g in gaps[:6]
        )
        return (
            f"Employee: {employee_name}, role: {poste}\n\n"
            f"Priority skill gaps to fill:\n{gap_text}\n\n"
            "Search for the best online courses (Udemy, Coursera, Pluralsight, YouTube, LinkedIn Learning) "
            "that would fill these gaps. Return the JSON array as instructed."
        )
    except Exception:
        return (
            f"Employee profile:\n{final_output_json[:1000]}\n\n"
            "Search for relevant online training courses for this employee. Return the JSON array as instructed."
        )


def _extract_grounding_urls(response: Any) -> dict[str, str]:
    """Extract web URL → title mapping from Gemini grounding metadata."""
    url_map: dict[str, str] = {}
    try:
        candidate = response.candidates[0]
        meta = getattr(candidate, "grounding_metadata", None)
        if meta is None:
            return url_map
        chunks = getattr(meta, "grounding_chunks", None) or []
        for chunk in chunks:
            web = getattr(chunk, "web", None)
            if web:
                uri = getattr(web, "uri", None)
                title = getattr(web, "title", "")
                if uri:
                    url_map[uri] = title
    except Exception:
        pass
    return url_map


def _clean_text(raw: str) -> str:
    """Strip markdown fences and extract JSON array."""
    raw = raw.strip()
    # Remove ```json / ``` fences
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    # Find the first [ ... ] block
    match = re.search(r"\[.*\]", raw, re.DOTALL)
    return match.group(0) if match else raw


def _merge_grounding_urls(formations: list[dict], url_map: dict[str, str]) -> list[dict]:
    """Best-effort: if a formation URL is missing or placeholder, try to fill from grounding."""
    if not url_map:
        return formations
    url_list = list(url_map.keys())
    grounding_idx = 0
    for f in formations:
        url = f.get("url", "")
        # Replace missing / obviously placeholder URLs with a grounding URL
        if (not url or url in ("", "#", "https://", "http://")
                or "placeholder" in url or "example.com" in url):
            if grounding_idx < len(url_list):
                f["url"] = url_list[grounding_idx]
                grounding_idx += 1
    return formations


async def recommend_formations(final_output_json: str) -> list[dict]:
    """Call Gemini with Google Search grounding and return formation list."""
    api_key = os.getenv("GOOGLE_API_KEY", "")
    genai.configure(api_key=api_key)

    # Use gemini-2.0-flash which supports Google Search grounding reliably
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        system_instruction=SYSTEM_PROMPT,
        tools=[{"google_search_retrieval": {}}],
    )

    prompt = _build_prompt(final_output_json)

    # Run the sync SDK call in a thread pool to keep FastAPI async
    loop = asyncio.get_event_loop()
    response = await loop.run_in_executor(
        None,
        lambda: model.generate_content(prompt),
    )

    raw_text = response.text or ""
    url_map = _extract_grounding_urls(response)

    try:
        formations: list[dict] = json.loads(_clean_text(raw_text))
    except json.JSONDecodeError:
        # Fallback: return empty list rather than crashing
        formations = []

    formations = _merge_grounding_urls(formations, url_map)
    return formations
