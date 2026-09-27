"""
WARLORD BASE 1 // PIPELINE STAGE 2 MULTI-FRONTIER ENSEMBLE BRIDGE
ROUTE: /api/pipeline/stage2
FUNCTION: Reads a Stage 1 checkpoint artifact, dispatches simultaneous audits
          across selected frontier LLMs via OpenRouter, aggregates the critiques,
          writes an ensemble checkpoint to disk, and presents side-by-side results.
GOVERNANCE: Warlord ROE Tier 1 - Tier 5
"""

import os
import json
import logging
import asyncio
import datetime
import httpx
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("STAGE2_ENSEMBLE")

app = FastAPI(title="Warlord Base 1 Stage 2 Ensemble Bridge", version="2.0.0")

PROMPT_TEMPLATE_PATH = r"C:\Warlord_Inc\Warlord_WASP\Prompts\Base1\stage2_audit.txt"
CHECKPOINT_DIR = r"C:\Warlord_Inc\Warlord_WASP\Backend\Checkpoints"
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

DEFAULT_MODELS = [
    "anthropic/claude-3.5-sonnet",
    "openai/gpt-4o",
    "google/gemini-pro-1.5",
    "deepseek/deepseek-chat"
]

class Stage2EnsembleRequest(BaseModel):
    checkpoint_file: str = Field(..., description="Absolute path to stage1 checkpoint file")
    models: List[str] = Field(default=DEFAULT_MODELS, description="List of OpenRouter model IDs to audit simultaneously")

class HardenedPillarItem(BaseModel):
    domain_id: str
    domain_name: str
    owner: str
    functional_objective: str
    constraints: List[str]
    dependencies: List[str]
    rhythm_multiplier: float = 1.0
    audit_notes: Optional[str] = ""

class CriticalFlag(BaseModel):
    domain_id: str
    severity: str
    issue: str
    remedy: str

class SingleModelAuditResult(BaseModel):
    model: str
    status: str
    error_message: Optional[str] = None
    audit_status: Optional[str] = None
    audit_score: Optional[float] = None
    hardened_pillars: List[HardenedPillarItem] = []
    critical_flags: List[CriticalFlag] = []

class EnsembleAuditReport(BaseModel):
    pipeline_stage: int = 2
    stage1_source_checkpoint: str
    ensemble_checkpoint_file: str = ""
    timestamp: str
    total_models_dispatched: int
    models_completed: int
    results: List[SingleModelAuditResult]

def load_prompt_template(path: str) -> str:
    if not os.path.exists(path):
        logger.error(f"Missing prompt artifact at: {path}")
        raise FileNotFoundError(f"Missing prompt artifact at: {path}")
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

async def audit_with_model(
    client: httpx.AsyncClient, 
    model_id: str, 
    prompt_text: str, 
    api_key: str
) -> SingleModelAuditResult:
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5002",
        "X-Title": "Warlord Base 1 Auditor Ensemble"
    }
    payload = {
        "model": model_id,
        "temperature": 0.2,
        "response_format": {"type": "json_object"},
        "messages": [{"role": "user", "content": prompt_text}]
    }

    try:
        response = await client.post(OPENROUTER_URL, headers=headers, json=payload, timeout=90.0)
        response.raise_for_status()
        raw_res = response.json()
        content_str = raw_res["choices"][0]["message"]["content"]
        parsed = json.loads(content_str)

        pillars = parsed.get("hardened_pillars", [])
        for p in pillars:
            if p.get("rhythm_multiplier") is None:
                p["rhythm_multiplier"] = 1.0

        return SingleModelAuditResult(
            model=model_id,
            status="SUCCESS",
            audit_status=parsed.get("audit_status", "UNKNOWN"),
            audit_score=float(parsed.get("audit_score", 0.0)),
            hardened_pillars=[HardenedPillarItem(**p) for p in pillars],
            critical_flags=[CriticalFlag(**f) for f in parsed.get("critical_flags", [])]
        )
    except Exception as exc:
        logger.error(f"Model {model_id} audit failure: {str(exc)}")
        return SingleModelAuditResult(
            model=model_id,
            status="FAILED",
            error_message=str(exc)
        )

@app.post("/api/pipeline/stage2", response_model=EnsembleAuditReport)
async def execute_stage2_ensemble(req: Stage2EnsembleRequest) -> Dict[str, Any]:
    logger.info("Stage 2 Multi-Frontier Ensemble Audit triggered.")

    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY environment variable missing.")

    if not os.path.exists(req.checkpoint_file):
        raise HTTPException(status_code=404, detail=f"Stage 1 checkpoint not found at: {req.checkpoint_file}")

    with open(req.checkpoint_file, "r", encoding="utf-8") as f:
        stage1_data = json.load(f)

    audit_template = load_prompt_template(PROMPT_TEMPLATE_PATH)
    stage1_json_str = json.dumps(stage1_data, indent=2)
    assembled_prompt = f"{audit_template}\n\n{stage1_json_str}\n"

    async with httpx.AsyncClient() as client:
        tasks = [
            audit_with_model(client, model_id, assembled_prompt, api_key)
            for model_id in req.models
        ]
        results = await asyncio.gather(*tasks)

    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    checkpoint_filename = f"stage2_ensemble_{timestamp}.json"
    checkpoint_filepath = os.path.join(CHECKPOINT_DIR, checkpoint_filename)

    completed_count = sum(1 for r in results if r.status == "SUCCESS")

    report = EnsembleAuditReport(
        pipeline_stage=2,
        stage1_source_checkpoint=req.checkpoint_file,
        ensemble_checkpoint_file=checkpoint_filepath,
        timestamp=timestamp,
        total_models_dispatched=len(req.models),
        models_completed=completed_count,
        results=results
    )

    report_dict = report.model_dump()
    with open(checkpoint_filepath, "w", encoding="utf-8") as f:
        json.dump(report_dict, f, indent=2)

    logger.info(f"Ensemble audit complete ({completed_count}/{len(req.models)} succeeded). Checkpoint written to: {checkpoint_filepath}")
    return report_dict

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("stage2_bridge:app", host="127.0.0.1", port=5002, reload=False)