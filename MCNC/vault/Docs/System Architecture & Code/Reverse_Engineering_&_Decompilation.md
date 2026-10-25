# RESEARCH DOSSIER // ArtCraft: Rust-based Adobe Creative Cloud Reimplementation

### 1. CORE NUGGET
ArtCraft is an open-source, clean-room reimplementation of key Adobe Creative Cloud applications, developed entirely in Rust. It provides native applications for macOS, Windows, Linux, and Web platforms, aiming to offer free alternatives to proprietary software.

### 2. CODE / IMPLEMENTATION
*   **Programming Language:** Rust
*   **Target Platforms:** macOS, Windows, Linux, Web
*   **Reimplemented Applications (ArtCraft Suite):**
    *   PhotoCraft (Adobe Photoshop equivalent)
    *   VectorCraft (Adobe Illustrator equivalent)
    *   FilmCraft (Adobe Premiere Pro equivalent)
    *   LightCraft (Adobe Lightroom equivalent)
    *   PdfCraft (Adobe Acrobat Pro equivalent)
    *   EffectCraft (Adobe After Effects equivalent)
    *   DesignCraft (Adobe InDesign equivalent)
    *   WordCraft (Word processing equivalent)
*   **Development Tools (used by Brandon Thomas):** Anthropic's Claude Opus 5.5

### 3. SUPERSEDES
Adobe Creative Cloud applications (Photoshop, Illustrator, Premiere Pro, Lightroom, Acrobat Pro, After Effects, InDesign) due to its open-source nature and free availability.

---

# RESEARCH DOSSIER // REA: Reverse Engineer Anything - AI-Powered Toolkit

### 1. CORE NUGGET
REA (Reverse Engineer Anything) is an open-source toolkit that leverages AI agents to automate and assist in reverse engineering software. It can decompile applications and native binaries, trace execution, examine runtime behavior, and facilitate the rebuilding of features in alternative technology stacks.

### 2. CODE / IMPLEMENTATION
*   **Setup Command:** `npx rea-agents@latest setup`
*   **Example Prompt (Windows Calculator):** `Use REA to inspect Windows Calculator. Why does 200 + 10% give 228?`
*   **Example Prompt (Adobe Premiere Pro Timeline):** `Use REA to investigate how my installed Adobe Premiere Pro reads timeline information from .prproj files.`
*   **Example Prompt (Supabase Table Editor):** `Investigate Supabase's Table Editor using REA.`
*   **Output Examples:** C-like pseudocode, assembly, strings, symbols, calls, references.

### 3. SUPERSEDES
Manual, labor-intensive initial analysis phases of traditional reverse engineering for feature understanding and extraction.

---

# RESEARCH DOSSIER // REA Supported Binary & Code Formats

### 1. CORE NUGGET
REA provides comprehensive support for decompiling and analyzing a wide array of binary and code formats, enabling deep inspection across different operating systems and execution environments.

### 2. CODE / IMPLEMENTATION
*   **Native Binaries:**
    *   Stripped ELF (Executable and Linkable Format) on Linux or Mach-O (Mach object) on macOS.
    *   PE (Portable Executable) format for Windows executables and object files.
    *   Native DWARF 4 type-layout objects.
*   **Managed Code & Bytecode:**
    *   JVM (Java Virtual Machine) bytecode, including obfuscated constant pools.
    *   ECMA-335 compliant .NET assemblies (metadata, CIL instructions, declared native dependencies, build comparisons).
*   **Low-Level & Embedded Systems:**
    *   Bare-metal firmware with architecture-specific instruction sets.
*   **Containerization & Runtime:**
    *   OCI (Open Container Initiative) container layers entangled in declarative infrastructure manifests.
    *   Recorded Linux crashes (raw notes, recorded thread's registers/signals, optional mapping candidates).
*   **Web & Scripting:**
    *   JavaScript/Electron (modules, imports, source maps, IPC, native add-on relationships).
    *   Websites (page structure, scripts, network observations, requested screenshots).
    *   Saved network captures (requests, responses, exposed payloads, source locations from HAR/mitmproxy captures).
*   **Mobile Platforms:**
    *   Android APIs (manifest declarations, classes, decompiled methods).
    *   Android devices (devices, packages, processes, logs, dumps, screen captures, APK/file transfers).

### 3. SUPERSEDES
None documented.

---

# RESEARCH DOSSIER // REA Ghidra Integration for Native Analysis

### 1. CORE NUGGET
REA integrates with Ghidra, a powerful software reverse engineering framework, to perform static analysis of native Windows executables (.exe) and dynamic-link libraries (.dll). This integration allows for a read-only analysis profile, ensuring the integrity of the original binaries.

### 2. CODE / IMPLEMENTATION
*   **Tool:** Ghidra Software Reverse Engineering Framework (developed by National Security Agency).
*   **Analysis Method:** REA imports an immutable copy of the native DLL for static analysis.
*   **Execution Policy:** It does not load the library into the analyst process or execute its entry routine.
*   **Fixture Characteristics:** Source-owned DLL fixtures have no entry routine or imports and expose two exported functions.
*   **Requirements:** The same native snapshot, path-admission, and cleanup requirements apply to EXEs and DLLs.

### 3. SUPERSEDES
None documented.

---

# RESEARCH DOSSIER // Apify MCP Server for AI Agent Automation

### 1. CORE NUGGET
Apify's MCP (Multi-Cloud Platform) server provides a robust ecosystem for AI agents, offering access to thousands of pre-built "Actors" for web scraping, data extraction, and workflow automation. It is designed for token efficiency by exposing a minimal set of core tools and executing complex tasks in the background.

### 2. CODE / IMPLEMENTATION
*   **Connect Claude Code CLI to Apify MCP Server:**
    1.  `apify mcp install claude-code`
    2.  `claude mcp add --transport http --scope user apify "https://mcp.apify.com" --header "X-Apify-Api-Token: Ven2"`
*   **Example Prompt (Instagram Scraping):** `Use Apify to find the 10 most-liked #donkeysofinstagram reels so I can recruit the most desirable asses to Donkr.`
*   **Core MCP Tools (Loaded on-demand):**
    *   `mcp_apify_call-actor` (1.5k tokens)
    *   `mcp_apify_fetch-actor-details` (915 tokens)
    *   `mcp_apify_get-dataset-items` (777 tokens)
    *   `mcp_apify_search-actors` (1.7k tokens)
*   **Available MCP Tools (Partial List):**
    *   `mcp_apify_abort-actor-run`
    *   `mcp_apify_rag-web-browser`
    *   `mcp_apify_web-fetch`
    *   `mcp_apify_fetch-apify-docs`
    *   `mcp_apify_get-actor-run`
    *   `mcp_apify_get-key-value-store-record`
    *   `mcp_apify_search-apify-docs`
    *   `mcp_appa_execute_remedy_plan`
    *   `mcp_claude_ai_Claude_Docs_batch`
    *   `mcp_claude_ai_Claude_Docs_create`
    *   `mcp_claude_ai_Claude_Docs_delete`
*   **Actor Examples:** Instagram Hashtag Scraper, YouTube Scraper, Amazon Product Scraper, Telegram Keyword Search Scraper, TripAdvisor Reviews Scraper API, MercadoLibre Scraper, TrustRadius Review Scraper, Fiverr Listings Scraper, AliExpress Products Scraper, TikTok Shop Data Scraper.
*   **Cost Example:** Running `apify/instagram-hashtag-scraper` in reels mode for a search cost approximately $0.08.

### 3. SUPERSEDES
Manual web scraping, data extraction, and competitive price monitoring for AI-driven applications.