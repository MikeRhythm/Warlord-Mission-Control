DOMAIN: AI Tools
NICHE: Jev
TITLE: AITools_Jev

# Jev AI // Canonical Master Dossier
**Category:** Inference Optimization & Model Orchestration  
**Sub-Category:** Fast Classifiers / System 1 Decision Engines  
**Target:** Sub-second routing, guardrails, and context reduction  

---

## 1. Architectural Definition & Core Thesis
* **System 1 vs. System 2:** Developed by TypeSafe AI (founded by ChatGPT co-inventor Diogo Almeida). Traditional frontier models (Claude, GPT-4/o, Gemini Pro) act as "System 2" paragraph-writing engines. Jev is purely a "System 1" reflex engine: it never writes text, cannot output prose, and does not generate explanations.
* **Deterministic Classification:** Accepts three inputs:
  1. *Situation* (the context payload).
  2. *Question* (explicit prompt instruction).
  3. *Allowed Answers* (strict discrete options, benchmark scale, or binary check).
* **Speed & Cost Multipliers:**
  * **Latency:** 20x to 200x faster than standard LLMs (sub-500ms typical execution).
  * **Economics:** ~.04 per million input tokens. Zero output cost because it returns discrete choices/probabilities rather than generated text.

---

## 2. Decision Primitives & Query Modes
1. **Choice Mode:** Selects a single branch from a defined array and returns confidence probabilities for all candidates.
2. **Score Mode:** Computes continuous numerical alignment along custom criteria benchmarks (supports fractional intermediate scores).
3. **Yes/No (Boolean) Mode:** Returns true probability float (.999$ high certainty, ~.5$ ambiguity/uncertainty).
4. **Parallel Batch Ingestion:** Multiple questions evaluated against a single situation are processed in parallel within a single API request with negligible latency overhead.

---

## 3. Production Case Studies & Measured Metrics
* **Token Compaction (Claude Code Plugin):** Dropped active session context from ~1,000,000 tokens to 86,000 tokens in ~1s by scoring tool-call utility and pruning obsolete context.
* **SEO Internal Link Graph:** Rebuilt 586-page internal linking topology in 45.1 seconds for .21 total cost, intentionally refusing to link 139 irrelevant pages.
* **Batch Document Routing:** Sorted 1,008 research papers across 24 bins for .08 total (256ms median time per paper).
* **Voice-Driven Browser Navigation:** Moritz Kremb voice-agent implementation using Playwright evaluated streaming utterance segments incrementally every 445ms without conversational turn-taking delays.

---

## 4. Warlord WASP Operational Applications
* **Dynamic Failover & Model Routing:** Sits as an upstream gatekeeper in front of Gemini, Groq, and NIM endpoints to evaluate prompt complexity before routing.
* **Confidence Gating:** Workflows branch deterministically based on thresholds:
  * Confidence >= 0.60 -> Execute automated pipeline action.
  * Confidence < 0.60 -> Escalate to human review lane.


---

DOMAIN: AI Tools
NICHE: Jev
TITLE: Jev

### Jev Overview
* Jev is an AI model from Type Safe for making decisions about information
* Designed to make fast, structured decisions that software can use directly
* Focuses on judgment tasks, not generating text

### Question Types
* **Null**: Yes or no judgment, returns probability of yes (0-1)
* **Choice**: Picks from a set of options, returns selected option and probabilities
* **Score**: Judges something on a scale, returns score and probabilities

### Input and Output
* **State**: Information to be evaluated (plain text, JSON object, or array)
* **Questions**: What to ask about the state, including type and options/scale
* **Response**: Answers to questions, including probabilities and confidence

### Pricing
* 4.2 cents per million input tokens
* Output tokens are free
* Example: checking 47,000 messages for frustration costs $1

### Use Cases
* Routing customer requests
* Categorizing documents
* Checking passage support for a claim
* Deciding which model to use for a task
* Gaming and interfaces requiring quick decisions

### When Not to Use Jev
* Generating text (e.g., writing replies, summarizing articles, generating code)
* Calculating exact answers in code (e.g., arithmetic, counting, comparing dates)

### Example Code
* TypeScript SDK available
* Example repo provided in description
* Demo code shows how to use Jev for null, choice, and score questions

### Key Metrics
* End-to-end response times: 70-500 milliseconds
* Cost comparison: Jev is roughly 170x cheaper than GPT for decision tasks
* Example response times: 
  + GPT: 8.6 seconds
  + Jev: 114 milliseconds
* Example cost: 
  + GPT: 1.4 cents
  + Jev: less than 100th of a cent