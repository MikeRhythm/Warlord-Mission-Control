# RESEARCH DOSSIER // Google AQua: Ambient Quality Agent

### 1. CORE NUGGET
Google AQua (Ambient Quality Agent) is an AI system designed to monitor and improve the performance of other AI agents by identifying "silent failures" – mistakes that do not trigger explicit errors but lead to incorrect or suboptimal outcomes in customer conversations. It operates as an "outer loop" quality assurance mechanism, reading agent conversations, checking them against predefined and custom goals, grouping similar failures, double-checking findings with a separate AI, and tracking improvements over time. AQua provides specific, actionable feedback by pinpointing the exact line in an agent's instructions that needs modification.

Key operational dependencies and architectural patterns:
*   **Ambient Monitoring**: AQua sits off to the side of the agent-customer interaction, passively observing conversations without interfering or altering the agent's behavior.
*   **Conversation Ingestion**: It processes up to 1,000 recent conversations to identify patterns.
*   **Goal-Based Checking**: Conversations are evaluated against a 9-point checklist of common AI mistakes and user-defined goals written in plain English.
*   **Problem Grouping**: Identifies and groups similar failures into "constellations" of problems, reducing a large number of individual issues into a manageable handful of fixable categories (e.g., "Double Booking," "Dropped Destination," "Made-Up Employee ID," "Said 'Done,' Never Checked," "Rounded Receipts").
*   **Double-Check Mechanism**: A second, independent AI with a fresh memory re-evaluates identified problems against the original conversations to prevent false positives or "invented problems" by the first AI.
*   **Actionable Fixes**: Provides the exact line in the agent's instructions (e.g., `agent_instructions.txt - line 12`) and suggests a precise fix (e.g., changing "Try to keep amounts exact" to "You must keep amounts exact"). The user must approve the fix; AQua does not auto-implement.
*   **Performance Tracking**: Monitors the pass rate of conversations and visualizes trends, highlighting when performance degrades (e.g., due to model updates or tool changes) and exactly what broke.
*   **Silent Failure Focus**: Specifically targets issues where the AI agent confidently provides an incorrect or incomplete response without generating an error, which would otherwise go unnoticed until a customer complains or a downstream system flags an inconsistency.
*   **"The Must Test" Principle**: A core philosophy emphasizing the use of imperative language ("Always," "Never," "Must") in AI instructions to prevent agents from treating critical rules as optional suggestions.

### 2. CODE / IMPLEMENTATION
**AQua Open Source Repository (Google Cloud ADK):**
`github.com/google/adk-recipes/core/python/ambient-quality-agent`

**Example Prompt Template for "The Must Test" (Conceptual):**
Original instruction: `Help the user with their expense. Please try to keep the exact amount.`
Suggested fix: `Help the user with their expense. Please MUST keep the exact amount.`
(Or, more explicitly: `Always file the exact amount from the receipt. Never round. This must happen every time.`)

**Example Goals for Chatbot Evaluation (Plain English):**
*   `Never confirm anything you haven't checked.`
*   `Never make up a name, number or date.`
*   `Never promise something that isn't in our policy.`
*   `Always hand over to a human when someone is upset.`

**AQua Setup (Google Cloud ADK):**
Your developer adds AQua with a few commands; nothing in your agent's core code changes.

**AQua Demo Mode (Localhost):**
Runs on a laptop without a Google Cloud account, typically accessible via `localhost:8080`.

**Silent Failure Audit Skill for Claude (Non-Google Cloud Implementation):**
This is a conceptual "skill" that can be implemented using Claude (or similar LLM) to perform the "Check" and "Group" steps.
1.  **Read**: Export your last hundred chatbot conversations (e.g., `chats_export/chat_001.txt`, `chat_002.txt`, etc.).
2.  **Check**: Provide the exported conversations to Claude along with your plain English goals.
3.  **Group**: Ask Claude to group the failures by type and count them (e.g., "Made-up details x7", "Unchecked confirmations x5", "Out-of-policy promises x4").
4.  **Double-check**: Open a new chat with Claude (fresh memory) and ask it to re-check each identified problem against the actual conversations, discarding any that don't hold up.
5.  **Track**: Save the generated report (e.g., `report_week_1.md`) and compare it weekly to track progress (New, Coming back, Fixed).

### 3. SUPERSEDES
*   **Manual Conversation Review**: Replaces the need for human agents to manually read through thousands of chatbot conversations to identify subtle errors.
*   **Error-Log Dependent Debugging**: Addresses "silent failures" that do not manifest as traditional errors in system logs, which were previously undetectable by standard monitoring tools.
*   **Ambiguous Instruction Writing**: Highlights and encourages the replacement of "soft words" (e.g., "try to," "should," "ideally," "where possible") in AI agent instructions with imperative commands ("always," "never," "must") to prevent misinterpretation by the AI.
*   **Reactive Problem Solving**: Shifts from reacting to customer complaints or downstream financial discrepancies to proactively identifying and fixing issues before they escalate or spread.

None documented for specific legacy tools or previous architectural patterns within Google Cloud beyond general manual review processes.