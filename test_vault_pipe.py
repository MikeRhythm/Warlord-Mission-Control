import os
import json
import http.client

def run_pipeline_diagnostic():
    print("[+] WARLORD WASP - INITIALIZING VAULT DIAGNOSTIC...")
    
    # 1. Load Registry Configuration
    config_path = "C:\\Warlord_Inc\\Warlord_WASP\\wasp_agent_registry.json"
    if not os.path.exists(config_path):
        print("[-] CRITICAL ERROR: wasp_agent_registry.json missing.")
        return
        
    with open(config_path, "r") as f:
        config = json.load(f)
        
    vault_dir = config["security_vault_path"]
    master_file = config["master_auth_file"]
    full_vault_path = os.path.join(vault_dir, master_file)
    
    print(f"[+] TARGET PATH CONFIRMED: {full_vault_path}")
    
    # 2. Read Universal Master Key
    if not os.path.exists(full_vault_path):
        print(f"[-] CRITICAL ERROR: {master_file} not found in vault.")
        return
        
    with open(full_vault_path, "r") as f:
        api_key = f.read().strip()
        
    if not api_key or "nvapi-" not in api_key:
        print("[-] VALIDATION FAILED: Key is empty or missing 'nvapi-' prefix.")
        return
        
    print("[+] VAULT READ SUCCESSFUL: Clean raw key extracted.")
    
    # 3. Test Handshake via Direct HTTP Connection (No heavy SDKs)
    print("[+] TRANSMITTING HANDSHAKE PACKET TO NVIDIA NIM REGISTRY...")
    
    conn = http.client.HTTPSConnection("integrate.api.nvidia.com")
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Querying the Core Chief model slot to verify access
    payload = json.dumps({
        "model": "meta/llama-3.3-70b-instruct",
        "messages": [{"role": "user", "content": "PING"}],
        "max_tokens": 5
    })
    
    try:
        conn.request("POST", "/v1/chat/completions", payload, headers)
        res = conn.getresponse()
        data = res.read().decode("utf-8")
        
        if res.status == 200:
            print("\n==================================================")
            print("[████████████████] PIPE STATUS: 100% OPERATIONAL")
            print("==================================================")
            print("[+] Handshake acknowledged. Universal key authenticated.")
            print("[+] Connection loop secure. Base 1 has green lights.")
        else:
            print(f"\n[-] HANDSHAKE REJECTED. HTTP Status: {res.status}")
            print(f"[-] Registry response: {data}")
            
    except Exception as e:
        print(f"[-] NETWORK EXCEPTION: Connection timed out or failed. Details: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    run_pipeline_diagnostic()