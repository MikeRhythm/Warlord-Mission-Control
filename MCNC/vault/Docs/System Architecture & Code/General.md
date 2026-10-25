# RESEARCH DOSSIER // ArtCraft Project

### 1. CORE NUGGET
The ArtCraft project is an open-source initiative providing clean-room reimplementations of Adobe Creative Cloud applications, developed in Rust. These applications are designed to be free and run across multiple platforms.

### 2. CODE / IMPLEMENTATION
*   **Applications**: PhotoCraft, VectorCraft, FilmCraft, LightCraft, PdfCraft, EffectCraft, DesignCraft, WordCraft.
*   **Development Language**: Rust.
*   **Supported Platforms**: macOS, Windows, Linux, Web.

### 3. SUPERSEDES
Adobe Photoshop, Adobe Illustrator, Adobe Premiere Pro, Adobe Lightroom, Adobe Acrobat Pro, Adobe After Effects, Adobe InDesign (implicitly, by offering free, open-source alternatives).

---

# RESEARCH DOSSIER // REA: Reverse Engineer Anything

### 1. CORE NUGGET
REA (Reverse Engineer Anything) is an open-source toolkit that leverages AI agents (specifically mentioned: Anthropic's Claude Opus 5.5) to reverse-engineer software. Its capabilities include decompiling applications and native binaries, tracing execution, examining evidence, and facilitating the rebuilding of features in alternative technology stacks.

### 2. CODE / IMPLEMENTATION
*   **Setup Command**: `npx rea-agents@latest setup`
*   **Supported Binary Formats**: Stripped ELF (Linux), Mach-O (macOS), PE Format (Windows), DWARF 4 type-layout object.
*   **Supported Runtime Environments**: JVM bytecode (with obfuscated constant pools), ECMA-335 compliant .NET assemblies, bare-metal firmware (architecture-specific instruction sets), OCI container layers (entangled in declarative infrastructure manifests).
*   **Example AI Agent Integration**: Claude Code.
*   **Example Prompt (General Logic Explanation)**: "Use REA to inspect Windows Calculator. Why does 200 + 10% give 228?"

### 3. SUPERSEDES
Traditional manual reverse engineering processes for certain tasks, and potentially proprietary software by enabling feature re-implementation.

---

# RESEARCH DOSSIER // REA Ghidra Integration

### 1. CORE NUGGET
REA integrates with Ghidra, a software reverse engineering (SRE) framework developed by the National Security Agency, to perform read-only static analysis of native executables and dynamic-link libraries across various platforms.

### 2. CODE / IMPLEMENTATION
*   **Analyzed File Types**: `.exe`, `.dll`.
*   **Ghidra Capabilities**: Disassembly, assembly, decompilation, graphing, scripting.

### 3. SUPERSEDES
None documented.

---

# RESEARCH DOSSIER // REA for Adobe Premiere Pro Timeline Reading

### 1. CORE NUGGET
REA can be utilized to investigate the internal mechanisms of proprietary software, such as how Adobe Premiere Pro reads timeline information from `.prproj` files, and then guide an AI agent to re-implement this specific feature in a new programming language like Rust.

### 2. CODE / IMPLEMENTATION
*   **Investigation Prompt**: "Use REA to investigate how my installed Adobe Premiere Pro reads timeline information from .prproj files."
*   **Re-implementation Prompt**: "Read the decompiled Premiere Pro code in ./re-findings and re-implement its .prproj timeline reader in Rust. Same fields, same read order, same version checks."
*   **Example Rust Files Generated**: `src/model.rs`, `src/data_reader.rs`, `src/serialize_in.rs`.
*   **Example Rust Crate Usage**: `use crate::types;`, `use crate::data_reader;`.
*   **Example Rust Execution Command**: `cargo run -- <file.prproj>`

### 3. SUPERSEDES
Adobe Premiere Pro's proprietary `.prproj` timeline reading implementation (by providing a functionally equivalent open-source Rust implementation).

---

# RESEARCH DOSSIER // REA for Supabase Table Editor Analysis

### 1. CORE NUGGET
REA's networking analysis feature can be employed to observe and understand the API interactions and UI changes within web applications, such as Supabase's Table Editor. This capability facilitates the development of custom backend solutions tailored to specific needs.

### 2. CODE / IMPLEMENTATION
*   **Investigation Prompt**: "Investigate Supabase's Table Editor using REA."
*   **Example Browser Endpoint**: `http://127.0.0.1:9222`
*   **Example Studio URL**: `http://127.0.0.1:54323`
*   **Example Source Directories**: `./Upstream and ./postgres-meta`

### 3. SUPERSEDES
None documented.

---

# RESEARCH DOSSIER // Apify MCP Server

### 1. CORE NUGGET
Apify's Multi-Compiler Platform (MCP) server enables AI agents to connect with and leverage a vast marketplace of "Actors" (specialized tools) for tasks such as web scraping, data extraction, and workflow automation. The MCP server optimizes token usage by exposing a minimal set of core tools and running selected Actors in the background.

### 2. CODE / IMPLEMENTATION
*   **MCP Server URL**: `https://mcp.apify.com/`
*   **Claude Code CLI Installation Command**: `apify mcp install claude-code`
*   **Claude Code CLI Connection Command**: `claude mcp add --transport http --scope user apify "https://mcp.apify.com" --header "pi_Ven2"`
*   **Example Prompt (Natural Language)**: "Use Apify to find the 10 most-liked #donkeysofinstagram reels so I can recruit the most desirable asses to Donkr."
*   **Example Token Costs (Loaded on-demand)**:
    *   `mcp_apify_call-actor`: 1.5k tokens
    *   `mcp_apify_fetch-actor-details`: 915 tokens
    *   `mcp_apify_get-dataset-items`: 777 tokens
    *   `mcp_apify_search-actors`: 1.7k tokens

### 3. SUPERSEDES
Manual web scraping and data collection processes for AI agents.