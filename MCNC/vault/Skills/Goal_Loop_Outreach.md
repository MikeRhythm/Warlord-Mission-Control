#### `Goal_Loop_Outreach.md`
```markdown
# SKILL: Goal-Loop Contract & Execution Protocol
**Owner:** Jack (Marketing & Growth)  
**Classification:** Procedural Playbook  
**Target Domain:** Marketing & Outreach Automation

## Executive Summary
Enforces an iterative execution loop with verifiable exit metrics. It prevents agents from returning partial work or halting tasks before quantitative quotas are met.

## When to Trigger
* Generating outreach candidate lists.
* Competitor funnel extraction.
* Data compilation where a specific quota must be achieved.

---

## AGENT INSTRUCTION PROTOCOL

When executing a Goal-Loop assignment, operate under this five-part contract:

### 1. The Metric Quota
Identify the target count (e.g., $N = 50$ verified contacts). Do not exit execution until `count >= N`.

### 2. Verification Gate
Every extracted record must satisfy all required fields:
- Target Name / Entity
- Direct Asset / Domain URL
- Validated Contact Route (Email/Form/Profile)
- Relevance Vector (Why they match the campaign)

### 3. Iteration Engine
If an execution pass returns fewer than $N$ validated items:
1. Log current progress: `[PROGRESS: X / N items acquired]`.
2. Adjust search parameters, modify query keywords, or expand source directories.
3. Re-run extraction cycle.
4. Continue looping until quota is reached or error thresholds are triggered.

### 4. Zero-Fluff Data Structuring
Deliver the final payload in pure, structured Markdown table or CSV format. Exclude conversational commentary, apologies, and process descriptions.

### 5. Final Confirmation
End output strictly with:
`[GOAL MET: N/N VERIFIED RECORDS ACQUIRED]`