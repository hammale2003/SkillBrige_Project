"""SkillBridge – shared graph state definition."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, Literal


@dataclass
class State:
    """Graph state passed between all agents.

    Fields
    ------
    employee_json      : Raw input JSON string (required).
    mode               : Execution mode — simulate | generate_tests | evaluate.
    test_scores        : Real scores from the frontend: {competence_id: score_int}.
                         Leave as empty dict for simulate mode.
    analysis           : Agent 1 internal reasoning text.
    test_blueprint     : Agent 2 structured test questions per competence.
    evaluation_results : Agent 3 JSON array of competences with _metadata_evaluation.
    validated_results  : Agent 4 validated JSON array.
    final_output       : Agent 5 final full JSON string (the answer).
    """

    employee_json: str = ""
    mode: Literal["simulate", "generate_tests", "evaluate"] = "simulate"
    test_scores: Dict[str, int] = field(default_factory=dict)
    analysis: str = ""
    test_blueprint: str = ""
    evaluation_results: str = ""
    validated_results: str = ""
    final_output: str = ""
