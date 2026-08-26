# LOCAL MODEL SPECIFICATION // LFM 2.5 GRUNT WORKER

## 1. TECHNICAL PARAMETERS & HARDWARE SPECIFICATION
* **Model Name:** Liquid Foundation Model 2.5 (LFM 2.5)
* **Parameter Scale:** 2.6 Billion (2.6B)
* **Quantization Format:** q4_k_m (Optimized for 8GB+ VRAM local GPU execution)
* **File Footprint:** ~1.7 GB storage allocation
* **Runtime Environment:** Local Ollama Daemon (Base 1 Hardware)
* **Design Architecture:** Non-decoder/Edge-optimized hybrid architecture developed by Liquid AI, built for high-speed local inference and low-latency token processing.

---

## 2. OPERATIONAL DOMAIN & PURVIEW
* **Primary Role:** Local Grunt Worker & Rapid Text Preprocessor.
* **Core Function:** Handles lightweight local text scrubbing, regex filtering, offline prompt token compression, and rapid structural formatting before data ever touches mid-management or frontier models.
* **Hardware Protection:** Operates entirely on-device, shielding local system resources and ensuring zero cloud API costs for routine, high-frequency local tasks.

---

## 3. OPERATIONAL BOUNDARIES & LIMITATIONS
* **No Frontier Logic:** The 2.6B parameter scale is engineered for speed and edge execution, not complex strategic reasoning, deep financial mathematics, or production-grade frontend assembly. 
* **Escalation Path:** If a local parsing or text-transformation task exceeds the logical capacity of the LFM Grunt, the request must be instantly escalated upstream to Llama 3.3 70B via Nvidia NIM.