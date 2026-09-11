# WARLORD RULES OF ENGAGEMENT: AGENT TOOL & SKILL ACQUISITION
**Classification:** SOP / Governance Architecture  
**Target Path:** `vault/Archive/ROE_Agent_Tool_and_Skill_Acquisition.md`  
**Operational Scope:** Jack (Marketing/Ops), Monty (Coordination), Charlie (Eng), Tess (Quant)

---

## 1. PURPOSE & INTENT
This directive establishes an uncompromising operational filter to prevent tool sprawl, subscription traps, and system bloatware across Base 1. 

No tool, script, API, or multi-agent skill shall be integrated into the Warlord MCNC stack without passing the deterministic qualification criteria defined below.

---

## 2. THE THREE LAWS OF TOOL SELECTION

### Law I: Operational Utility Over Novelty
A candidate tool must address an active, repetitive operational friction point (e.g., cold email dispatch, syntax verification, headless scraping, markdown formatting). 
- If an existing native Node.js or Python library solves the problem in under 50 lines of code, third-party wrappers and SaaS subscriptions are **PROHIBITED**.

### Law II: Protocol Independence & Local Execution
Tools must run on Base 1 infrastructure or connect via direct, unmetered REST/WebSocket protocols.
- **DISQUALIFIED:** Closed ecosystems requiring proprietary cloud orchestration or opaque SaaS platforms.
- **MANDATED:** Clean stdin/stdout, standard CLI binaries, native Python/Node.js packages, or transparent API keys.

### Law III: Deterministic Agent Autonomy
Every tool must be callable by an LLM agent via a structured JSON schema:
- Must accept standard typed arguments.
- Must return unambiguous JSON or raw string outputs.
- Must fail predictably with standard error status codes rather than hanging or opening interactive GUI prompts.

---

## 3. TRIAGE CRITERIA: PASS / FAIL BENCHMARKS

| Category | PASS Criteria (Eligible) | FAIL Criteria (Immediate Rejection) |
| :--- | :--- | :--- |
| **Architecture** | Lightweight CLI, direct REST API, native NPM/PyPI module. | Heavy graphical installers, closed desktop containers, opaque blobs. |
| **Cost / Licensing** | Open-source (MIT/Apache/BSD) or pay-per-use raw API keys. | Monthly recurring subscription traps, locked feature tiers, token paywalls. |
| **Maintenance** | Zero-dependency or standard enterprise dependencies. | Fragile multi-step toolchains, brittle unmaintained GitHub repos. |
| **Agent Interface** | Pure JSON payload in, pure structured data out. | Requires human mouse clicks, visual Captchas, or browser session babysitting. |
| **Domain Fit** | Immediate utility for active Warlord objectives (e.g., Marketing/Email). | Generic "cool demo" features with no immediate pipeline role. |

---

## 4. DIVISION OF LABOR FOR AGENT SKILLS

* **Jack (Marketing & Growth Lead):**
  - Permitted: Transactional email dispatch, list hygiene/MX checkers, headless offer scrapers, copy formatters.
  - Objective: High-volume deliverability, outreach automation, competitor auditing.

* **Monty (Chief of Staff & Orchestrator):**
  - Permitted: File routing, inter-agent message passing, task queue dispatchers, Obsidian indexing.
  - Objective: Command orchestration, zero-state stability, pipeline enforcement.

* **Charlie (Code & Systems Lead):**
  - Permitted: Compilers (MetaEditor CLI, Node runners), linting, directory patching, git tools.
  - Objective: Atomic compiling, error triage, zero NaN poisoning.

* **Tess (Quant Lead):**
  - Permitted: Math/array transforms, tick parsers, volatility metrics (deferred until server launch).
  - Objective: Precision execution, deterministic telemetry.

---

## 5. EVALUATION VERDICT PROTOCOL
When auditing videos, whitepapers, or GitHub repositories, the system must issue one of three explicit verdicts:

1. **PASS // WIRE TO BASE 1:** Clear utility, adheres to Laws I–III. Proceed directly to building the atomic tool bridge.
2. **HOLD // VAULT REFERENCE:** Useful concept or algorithmic model, but no immediate deployment need. Archive notes to `vault/`.
3. **FAIL // BLOATWARE:** Fails one or more Laws. Reject immediately with specific disqualified vectors noted.