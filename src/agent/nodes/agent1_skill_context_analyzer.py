"""Agent 1 – Skill Context Analyzer.

Purpose
-------
Analyze the employee profile, projects, goals, and expected skill levels.
Detect risk areas and estimate the evaluation difficulty per competence.

Output: plain-text analysis stored in state.analysis.
No JSON fields are modified.
"""

from __future__ import annotations

from typing import Any, Dict

from agent.llm import get_llm, invoke
from agent.state import State

SYSTEM_PROMPT = """You are Agent 1 – Skill Context Analyzer of the SkillBridge system.

Your sole purpose is to analyze an employee's competency profile and produce internal
reasoning that will guide the test-generation and evaluation agents.

Analyze:
- Employee profile (role, seniority, department)
- Each competence: type, current estimated level, expected levels at 6/12/24 months
- Recent and future projects
- Career objectives and training history
- Gap between current and expected levels (risk areas)
- Evaluation difficulty estimate per competence

Output plain text analysis only. Do NOT modify any JSON fields.
"""


async def skill_context_analyzer(state: State) -> Dict[str, Any]:
    """Agent 1: analyze employee profile and identify risk areas."""
    llm = get_llm()
    analysis = await invoke(
        llm,
        SYSTEM_PROMPT,
        f"Employee profile:\n{state.employee_json}",
    )
    return {"analysis": analysis}
