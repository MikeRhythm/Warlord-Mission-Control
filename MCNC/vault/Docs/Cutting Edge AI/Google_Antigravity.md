# RESEARCH DOSSIER // Google Antigravity & Gemini 4 Argon

### 1. CORE NUGGET
*   **Gemini 4 Argon:** Google's newest top AI model, specifically designed for complex tasks like software development. It is the first model in the Gemini 4 family.
*   **Antigravity:** Google's application for AI agents. An AI agent within Antigravity is capable of executing tasks on a computer, including writing files, running them, and performing checks, rather than merely generating text.
*   **Combined Capability:** Antigravity, powered by Gemini 4 Argon, functions as a "very smart builder" that can write, run, and check files autonomously.
*   **Performance Metrics (Internal Google Testing):**
    *   Code written by agents increased by over 35%.
    *   Changes that needed to be rolled back decreased by nearly a third (30%).
    *   Successfully untangled 6 million lines of Chrome code (from a 40 million line Chromium codebase) in weeks, a task that would typically take months.
*   **Working Memory:** Gemini 4 Argon possesses a working memory of 1 million tokens (approximately 4 million characters of text), enabling it to process entire project folders before initiating any modifications.
*   **Self-Correction:** The model is built with self-correction capabilities. If a task fails, it reads the error, identifies the root cause, and attempts the task again.
*   **Prerequisites for Argon Access:** A paid Google AI Pro or Ultra plan is required. Free accounts and trial plans do not provide access to Gemini 4 Argon. The Antigravity application must be signed in with the same Google account that holds the paid plan.
*   **Quota/Limits:** Gemini 4 Argon has its own weekly usage quota, separate from Gemini 3.8 Flash. Large builds consume a significant portion of this quota.
*   **Operational Best Practices:**
    *   Run one large build at a time.
    *   Instruct Argon to save its work frequently to prevent loss due to timeouts.
    *   For non-technical users, interaction is in plain English, similar to briefing a human.
    *   Always review Argon's proposed plan and command execution requests before approving them.
    *   Thoroughly check the final output with human eyes before deploying anything live.
    *   Split complex tasks: Use Argon for planning and tricky parts, and Gemini 3.8 Flash for routine work to manage quotas effectively.
    *   Save successful workflows as "skills" for future reuse with single-sentence prompts.

### 2. CODE / IMPLEMENTATION
*   **Model List Command (Terminal):**
    ```bash
    $ agy models
    ```
    (This command displays available AI models, including Gemini 4 Argon if the correct Google account and plan are active.)
*   **Prompt for 3D Micro Racing Game (Desk Grand Prix):**
    ```
    Build a playable 3D micro racing game on a small business owner's cluttered desk, with a tiny toy car, a laptop, a coffee mug, a keyboard you drive across, three rival cars and three laps.
    ```
*   **Prompt for Luxury Watch Website (Meridian One):**
    ```
    Build a cinematic one-page website for a luxury mechanical watch, modelled in 3D, where the watch stays pinned and the camera moves around it as you scroll.
    ```
*   **Prompt for Client Proposal (Bakery Example):**
    ```
    Read the skill, then do a proposal for a bakery based on marta email.txt and notes from call.txt.
    ```
*   **Prompt for Website Rebuild (Plumbing Site):**
    ```
    Rebuild this website so it's extremely fast and beautiful, keep every word exactly the same, and keep every link pointing at the same page.
    ```
*   **General Prompt Structure (Step 3):**
    1.  What you want
    2.  Who it's for
    3.  How you'll know it's finished
    Then add this line at the end:
    ```
    Test it yourself, look at the result, and fix anything broken before you tell me you're done.
    ```
*   **Refinement Prompt (Step 4):**
    ```
    Look at this like a tough customer, list the five weakest things and fix them.
    ```

### 3. SUPERSEDES
*   **Traditional Software Development Workflow:** The "old way" of writing a brief, finding a developer, waiting days, receiving incorrect results, and repeating the cycle is superseded by Antigravity's iterative, AI-driven build and check process.
*   **Basic AI Chat for Code Generation:** The process of using a normal AI chat to get code, pasting it elsewhere, and manually debugging errors is superseded by Antigravity's integrated environment where the AI can write, run, and test code directly.