"""SkillBridge – graph wiring.

This module is the single entry point for LangGraph (referenced in langgraph.json).
It only assembles the graph — all agent logic lives in the nodes/ package.

Modes
-----
simulate       : Run all 5 agents end-to-end (default, no frontend).
generate_tests : Run Agent 1 + Agent 2 only — returns test blueprint.
evaluate       : Run Agent 1 + Agents 3-5 — uses real scores from test_scores.
"""

from __future__ import annotations

from langgraph.graph import StateGraph

from agent.state import State
from agent.nodes import (
    skill_context_analyzer,
    test_generation_agent,
    evaluation_scoring_agent,
    consistency_gap_validator,
    json_output_controller,
)


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

def _route_after_agent1(state: State) -> str:
    """Route after Agent 1 based on execution mode."""
    if state.mode == "evaluate":
        return "evaluation_scoring_agent"
    # simulate or generate_tests both go through Agent 2 first
    return "test_generation_agent"


def _route_after_agent2(state: State) -> str:
    """Stop after Agent 2 in generate_tests mode; continue otherwise."""
    if state.mode == "generate_tests":
        return "__end__"
    return "evaluation_scoring_agent"


# ---------------------------------------------------------------------------
# Graph assembly
# ---------------------------------------------------------------------------

graph = (
    StateGraph(State)
    # ── nodes ──────────────────────────────────────────────────────────────
    .add_node("skill_context_analyzer", skill_context_analyzer)
    .add_node("test_generation_agent", test_generation_agent)
    .add_node("evaluation_scoring_agent", evaluation_scoring_agent)
    .add_node("consistency_gap_validator", consistency_gap_validator)
    .add_node("json_output_controller", json_output_controller)
    # ── entry ──────────────────────────────────────────────────────────────
    .add_edge("__start__", "skill_context_analyzer")
    # ── Agent 1 → route by mode ────────────────────────────────────────────
    .add_conditional_edges(
        "skill_context_analyzer",
        _route_after_agent1,
        {
            "test_generation_agent": "test_generation_agent",
            "evaluation_scoring_agent": "evaluation_scoring_agent",
        },
    )
    # ── Agent 2 → stop or continue ─────────────────────────────────────────
    .add_conditional_edges(
        "test_generation_agent",
        _route_after_agent2,
        {
            "__end__": "__end__",
            "evaluation_scoring_agent": "evaluation_scoring_agent",
        },
    )
    # ── Agents 3 → 4 → 5 ──────────────────────────────────────────────────
    .add_edge("evaluation_scoring_agent", "consistency_gap_validator")
    .add_edge("consistency_gap_validator", "json_output_controller")
    .add_edge("json_output_controller", "__end__")
    .compile(name="SkillBridge")
)
