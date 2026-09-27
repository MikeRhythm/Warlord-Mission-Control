"""
WARLORD BASE 1 // KAGGLE DUAL-T4 INFERENCE WORKER
TARGET RUNTIME: Kaggle Notebook (Dual T4 GPUs, Internet Access ON)
FUNCTION: Expose FastAPI endpoint via ngrok tunnel, execute Stage 1 Forensic
          Deconstruction prompts across both T4s using vLLM, and return raw JSON.
GOVERNANCE: Warlord ROE Tier 1 - Tier 5
"""

import os
import sys
import uvicorn
import nest_asyncio
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from pyngrok import ngrok
from vllm import LLM, SamplingParams

# Apply nest_asyncio for running uvicorn inside Jupyter/Kaggle environments
nest_asyncio.apply()

app = FastAPI(title="Warlord Kaggle Dual-T4 Deconstruction Engine", version="1.0.0")

# Model configuration: Fast, high-accuracy instruction model fitting comfortably within Dual T4 VRAM
MODEL_NAME = "Qwen/Qwen2.5-7B-Instruct"

print("[WARLORD WORKER] Initializing vLLM on Dual T4 GPUs (Tensor Parallel = 2)...")
llm = LLM(
    model=MODEL_NAME,
    tensor_parallel_size=2,
    gpu_memory_utilization=0.90,
    max_model_len=4096,
    trust_remote_code=True
)
print("[WARLORD WORKER] Engine loaded successfully.")

class DeconstructPayload(BaseModel):
    prompt: str = Field(..., description="Full assembled Stage 1 prompt with schema")
    temperature: float = Field(default=0.2, ge=0.0, le=1.0)
    max_tokens: int = Field(default=2048)

@app.post("/kaggle/deconstruct")
def handle_deconstruct(payload: DeconstructPayload):
    try:
        # Enforce deterministic temperature locking (ROE Tier 2)
        safe_temp = max(0.2, min(payload.temperature, 0.4))
        
        sampling_params = SamplingParams(
            temperature=safe_temp,
            max_tokens=payload.max_tokens,
            top_p=0.95
        )

        outputs = llm.generate([payload.prompt], sampling_params)
        raw_output_text = outputs[0].outputs[0].text.strip()

        # Clean markdown code blocks if emitted by the LLM
        if raw_output_text.startswith("```json"):
            raw_output_text = raw_output_text[7:]
        if raw_output_text.startswith("```"):
            raw_output_text = raw_output_text[3:]
        if raw_output_text.endswith("```"):
            raw_output_text = raw_output_text[:-3]
        raw_output_text = raw_output_text.strip()

        return raw_output_text

    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Inference execution failed: {str(exc)}")

def start_worker():
    # Retrieve ngrok token from Kaggle environment or prompt
    ngrok_token = os.environ.get("NGROK_AUTHTOKEN")
    if not ngrok_token:
        print("[CRITICAL] NGROK_AUTHTOKEN environment variable is missing.")
        print("Set it in Kaggle Secrets or run: ngrok.set_auth_token('YOUR_TOKEN')")
        return

    ngrok.set_auth_token(ngrok_token)
    
    # Terminate any stale tunnels
    ngrok.kill()
    
    # Open HTTP tunnel on port 8000
    public_tunnel = ngrok.connect(8000, bind_tls=True)
    tunnel_url = public_tunnel.public_url
    
    print("\n" + "=" * 70)
    print("WARLORD KAGGLE WORKER READY FOR BASE 1 CONNECTION")
    print(f"INGRESS TUNNEL URL: {tunnel_url}")
    print(f"FULL ENDPOINT URL:  {tunnel_url}/kaggle/deconstruct")
    print("=" * 70 + "\n")
    print("Copy the FULL ENDPOINT URL and assign it to KAGGLE_WORKER_URL on Base 1.\n")

    # Run FastAPI server on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)

if __name__ == "__main__":
    start_worker()