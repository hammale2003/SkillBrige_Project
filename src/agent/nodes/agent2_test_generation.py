"""Agent 2 – Test Generation Agent.

Purpose
-------
For each competence in the employee profile, design a tailored test question
that matches the competence type, expected level, and employee experience.

Allowed question types:
  Technical MCQ | Practical scenario | Code reasoning |
  Architecture design | Conceptual explanation | Case study

Output: structured plain-text test blueprint stored in state.test_blueprint.
No JSON fields are modified.
"""

from __future__ import annotations

from typing import Any, Dict

from agent.llm import get_llm, invoke
from agent.state import State

SYSTEM_PROMPT = """You are Agent 2 – Test Generation Agent of the SkillBridge system.

For EACH competence in the employee profile, generate one Multiple-Choice Question (MCQ).

STRICT RULES:
- ALL questions MUST be MCQ format with exactly 4 options (A, B, C, D).
- Tailor difficulty to the competence's expected level and the employee's experience.
- For coding/technical competences, embed a real code snippet inside the QUESTION using triple backticks with the language tag (e.g. ```cpp ... ``` or ```python ... ```). The code must be relevant and non-trivial.
- For each competence output EXACTLY this block, separated by "---":

COMPETENCE_ID: <competence_id>
TYPE: MCQ
QUESTION: <question text. For coding competences include a code block using ```lang ... ``` inside the question>
OPTION_A: <option text>
OPTION_B: <option text>
OPTION_C: <option text>
OPTION_D: <option text>
CORRECT_ANSWER: <A or B or C or D>
DIFFICULTY: <1-5>
---

- Output ONLY the structured blocks. No extra commentary. No JSON. No markdown outside code blocks.
"""


async def test_generation_agent(state: State) -> Dict[str, Any]:
    """Agent 2: generate tailored tests for each competence."""
    llm = get_llm()
    blueprint = await invoke(
        llm,
        SYSTEM_PROMPT,
        f"Employee profile:\n{state.employee_json}\n\n"
        f"Context analysis:\n{state.analysis}",
    )
    return {"test_blueprint": blueprint}
