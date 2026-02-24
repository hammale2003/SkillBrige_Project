"""FastAPI server exposing the SkillBridge LangGraph as a REST API."""

import json
import re

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agent.graph import graph

app = FastAPI(title="SkillBridge API", version="1.0.0")

# Allow Vite dev server, production preview, and common local ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------------------------------- #
# Pydantic models                                                              #
# --------------------------------------------------------------------------- #

class EvaluateRequest(BaseModel):
    employee_json: str
    mode: str = "simulate"
    test_scores: dict[str, int] = {}


class EvaluateResponse(BaseModel):
    final_output: str = ""
    test_blueprint: str = ""
    analysis: str = ""
    enriched_employee_json: str = ""


# --------------------------------------------------------------------------- #
# Blueprint parser                                                             #
# --------------------------------------------------------------------------- #

def _parse_blueprint_questions(blueprint: str) -> dict[str, dict]:
    """Parse agent-2 QCM blueprint into {competence_id: {question, options, correct_answer}}."""
    questions: dict[str, dict] = {}
    # Blocks are separated by --- or by a new COMPETENCE_ID: line
    blocks = re.split(r"\n---\n?|\n(?=COMPETENCE_ID:)", blueprint.strip())
    for block in blocks:
        block = block.strip()
        if not block:
            continue

        # Extract key: value pairs BUT preserve multi-line QUESTION (may contain code blocks)
        entry: dict[str, str] = {}
        current_key = None
        buffer: list[str] = []

        for line in block.splitlines():
            # A new recognised key resets the buffer
            matched = re.match(
                r"^(COMPETENCE_ID|TYPE|QUESTION|OPTION_A|OPTION_B|OPTION_C|OPTION_D|CORRECT_ANSWER|DIFFICULTY)\s*:\s*(.*)",
                line,
            )
            if matched:
                if current_key and buffer:
                    entry[current_key] = "\n".join(buffer).strip()
                current_key = matched.group(1)
                buffer = [matched.group(2)]
            else:
                if current_key:
                    buffer.append(line)

        if current_key and buffer:
            entry[current_key] = "\n".join(buffer).strip()

        cid = entry.get("COMPETENCE_ID")
        if not cid:
            continue

        options = [
            entry[k]
            for k in ("OPTION_A", "OPTION_B", "OPTION_C", "OPTION_D")
            if entry.get(k)
        ]

        questions[cid] = {
            "question": entry.get("QUESTION", ""),
            "question_type": "mcq",
            "options": options,
            "correct_answer": entry.get("CORRECT_ANSWER", "").strip().upper(),
        }

    return questions


def _enrich_employee_json(employee_json: str, blueprint: str) -> str:
    """Return employee JSON with question/options/correct_answer injected per competence."""
    try:
        data = json.loads(employee_json)
        q_map = _parse_blueprint_questions(blueprint)
        for comp in data.get("competences", []):
            # Support both key conventions used in input.json
            cid = comp.get("competence_id") or comp.get("id")
            if cid and cid in q_map:
                comp["question"] = q_map[cid]["question"]
                comp["question_type"] = q_map[cid]["question_type"]
                comp["options"] = q_map[cid]["options"]
                comp["correct_answer"] = q_map[cid]["correct_answer"]
        return json.dumps(data, ensure_ascii=False)
    except Exception:
        return employee_json


# --------------------------------------------------------------------------- #
# Endpoints                                                                    #
# --------------------------------------------------------------------------- #

@app.post("/api/evaluate", response_model=EvaluateResponse)
async def evaluate(req: EvaluateRequest) -> EvaluateResponse:
    """Run the SkillBridge multi-agent graph and return structured results."""
    try:
        result = await graph.ainvoke(
            {
                "employee_json": req.employee_json,
                "mode": req.mode,
                "test_scores": req.test_scores,
            }
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    blueprint = result.get("test_blueprint", "")
    enriched = _enrich_employee_json(req.employee_json, blueprint) if blueprint else ""

    return EvaluateResponse(
        final_output=result.get("final_output", ""),
        test_blueprint=blueprint,
        analysis=result.get("analysis", ""),
        enriched_employee_json=enriched,
    )


@app.get("/health")
async def health() -> dict:
    """Simple health-check used by the frontend to verify the server is up."""
    return {"status": "ok", "service": "SkillBridge"}


# --------------------------------------------------------------------------- #
# Entry point                                                                  #
# --------------------------------------------------------------------------- #

if __name__ == "__main__":
    uvicorn.run("agent.server:app", host="0.0.0.0", port=8000, reload=True)
