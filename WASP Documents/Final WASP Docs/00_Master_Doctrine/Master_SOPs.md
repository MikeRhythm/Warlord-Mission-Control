kkWARLORD MASTER STANDARD OPERATING PROCEDURES (SOP)
SOP 01: THE ADVERSARIAL LOOP EXECUTION
Trigger: Any task requiring code generation, UI design, or structural writing.

Define the Bar: The dispatching agent or Warlord explicitly states the "Definition of Done" (DoD).

Builder Execution: The assigned Builder Agent executes the draft/code.

Judge Evaluation: A separate Judge Agent (using a frontier model) evaluates the output strictly against the DoD.

The Pivot: If the Judge flags errors, the exact feedback trace is routed back to the Builder. This loops automatically.

Termination: The loop only terminates when the Judge outputs a 100% pass score, or the 3-Strike Time-Debt limit is reached (escalating to Warlord).

SOP 02: SUPER KANBAN HANDOFFS
Trigger: An agent completes its specialized phase of a multi-agent pipeline and must pass the ticket.

State Snapshot: The outgoing agent finalizes its artifact.

The Handoff Brief: The agent writes a strict, concise summary containing:

Completed Actions: What was successfully executed.

Failed Attempts: What was tried and abandoned (to prevent the next agent from repeating the error).

Next Action Required: The explicit directive for the incoming specialist.

Pipeline Shift: The ticket is moved to the next agent's queue.

SOP 03: OBSIDIAN TELEMETRY LOGGING (SEARCHABLE CONTINUITY)
Trigger: The conclusion of any significant task, architectural decision, or critical failure.

Format: The agent opens the relevant project Markdown file within the MCNC_State Obsidian vault.

Data Entry: The agent logs a timestamped entry detailing:

The core objective.

The executed solution.

The structural rationale (Why this path was chosen over alternatives).

Tagging: The agent applies relevant metadata tags (e.g., #architecture, #error-log, #mql5-logic) to ensure the QMD hybrid-search engine can retrieve it instantly.

SOP 04: NEW SKILL CREATION (THE COMPOUNDING LOOP)
Trigger: An agent successfully navigates a novel, complex, and highly repeatable workflow.

Extraction: The agent distills the entire workflow into a clinical, step-by-step recipe.

Formatting: The agent formats this recipe into a skill.md file. It must include:

Skill Name & Purpose.

Trigger conditions.

Required local tools/dependencies.

Step-by-step execution logic.

Storage: The skill.md file is permanently saved to the MCNC_State/skills/ directory for universal access by all Warlord agents.