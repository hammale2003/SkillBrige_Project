# SkillBridge — Start FastAPI backend
$env:PYTHONPATH = "$PSScriptRoot\src"
Write-Host "Starting SkillBridge API on http://localhost:8000 ..." -ForegroundColor Cyan
uv run python -m uvicorn agent.server:app --port 8000 --log-level info --reload
