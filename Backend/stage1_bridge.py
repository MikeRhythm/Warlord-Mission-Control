"""
WARLORD BASE 1 // PIPELINE STAGE 1 BRIDGE (DECOUPLED)
ROUTE: /api/pipeline/stage1
FUNCTION: Ingest user prompt, load Stage 1 prompt template, dispatch to Kaggle worker,
          persist output to disk as an immutable checkpoint, and HALT.
GOVERNANCE: Warlord ROE Tier 1 - Tier 5
"""

import os
import json
import logging
import datetime
import requests
from typing import Dict, Any, List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("STAGE1_BRIDGE")

app = FastAPI(title="Warlord Base 1 Stage 1 Bridge", version="2.0.0")

PROMPT_TEMPLATE_PATH = r"C:\Warlord_Inc\Warlord_WASP\Prompts\Base1\stage1_deconstruct.txt"
CHECKPOINT_DIR = r"C:\Warlord_Inc\Warlord_WASP\Backend\checkpoints"
KAGGLE_WORKER_URL = os.getenv("KAGGLE_WORKER_URL", "http://127.0.0.1:8000/kaggle/deconstruct")

class Stage1Request(BaseModel):
    raw_prompt: str = Field(..., min_length=5, description="Raw input statement from Mike")

class PillarItem(BaseModel):
    domain_id: str
    domain_name: str
    owner: str
    functional_objective: str
    constraints: List[str]
    dependencies: List[str]
    rhythm_multiplier: float = 1.0

class Stage1Contract(BaseModel):
    pipeline_stage: int = 1
    checkpoint_file: str = ""
    status: str
    raw_input_digest: str
    dominant_metric: str
    pillars: List[PillarItem]
    unmapped_items: List[str] = []

def load_prompt_template(path: str) -> str:
    if not os.path.exists(path):
        logger.error(f"Missing prompt artifact at: {path}")
        raise FileNotFoundError(f"Missing prompt artifact at: {path}")
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

@app.post("/api/pipeline/stage1", response_model=Stage1Contract)
def execute_stage1(payload: Stage1Request) -> Dict[str, Any]:
    logger.info("Stage 1 forensic deconstruction triggered.")

    try:
        base_template = load_prompt_template(PROMPT_TEMPLATE_PATH)
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))

    assembled_prompt = f"{base_template}\n{payload.raw_prompt.strip()}\n"

    payload_to_worker = {
        "prompt": assembled_prompt,
        "temperature": 0.2,
        "max_tokens": 2048
    }

    try:
        response = requests.post(KAGGLE_WORKER_URL, json=payload_to_worker, timeout=60)
        response.raise_for_status()
        raw_result = response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Kaggle worker unreachable: {str(e)}")
        raise HTTPException(status_code=502, detail=f"Kaggle Worker unreachable: {str(e)}")

    if isinstance(raw_result, str):
        try:
            parsed_data = json.loads(raw_result)
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Worker output is not valid JSON.")
    else:
        parsed_data = raw_result

    # Schema Validation & Rhythm Multiplier fallback
    try:
        contract_data = Stage1Contract(**parsed_data)
        for pillar in contract_data.pillars:
            if pillar.rhythm_multiplier is None:
                pillar.rhythm_multiplier = 1.0
    except Exception as validation_err:
        raise HTTPException(status_code=422, detail=f"Schema validation failure: {str(validation_err)}")

    # Checkpoint Persistence to disk
    os.makedirs(CHECKPOINT_DIR, exist_ok=True)
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    checkpoint_filename = f"stage1_{timestamp}.json"
    checkpoint_filepath = os.path.join(CHECKPOINT_DIR, checkpoint_filename)

    contract_data.checkpoint_file = checkpoint_filepath
    contract_dict = contract_data.model_dump()

    with open(checkpoint_filepath, "w", encoding="utf-8") as f:
        json.dump(contract_dict, f, indent=2)

    logger.info(f"Stage 1 complete. Artifact checkpoint written to: {checkpoint_filepath}")
    return contract_dict

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("stage1_bridge:app", host="127.0.0.1", port=5001, reload=False)