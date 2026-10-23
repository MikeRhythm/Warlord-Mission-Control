# MISSION CONTROL NERVE CENTER (MCNC) // PROJECT DIRECTORY & Taxonomy DOCTRINE
DOCUMENT CLASSIFICATION: PROJECT_DIRECTORY_DOCTRINE.md
TARGET RUNTIME: TAB 01 EXEC, TAB 02 WAR POOM, & BACKEND PROVISHONERS

---

## 1. PURPOSE & SUPREME GOVERNANCE
This doctrine governs the physical filesystem architecture of all projects under:
`C:\Warlord_Inc\Warlord_WASP\MCNC\Data\Projects\7Project_Name\`

LLM agents are strictly forbidden from proposing arbitrary directory names. Every project directory must select from the Canonical Taxonomy Registry below.

---

## 2. STRUCTURAL INVARIANTS
1. **Pascal_Snake_Case Enforcement:** TitleCase words separated by underscores (e.g., `Assets_And_Artwork`, `Responses_And_Donations`).
2. **Character Sanitization:** No spaces, hyphens (-), or punctuation.
3. **Immutability of Tool Endpoints:** Automated scripts require predictable paths. Leads must ALWAYS reside under `Leads\`.
4. **Manifest Anchoring:** Every project must contain `project_manifest.json` at its root.

---

## 3. CANONICAL TAXONOMY REGISTRY
- **Leads**: Holds contact sheets (`*.csv`).
- **Responses_And_Donations**: Inbound ledger for fundraising projects (e.g., Chief Madothi Fund).
- **Responses_And_Sales**: Inbound ledger for commercial INVAC / sales projects.
- **Assets_And_Artwork**: Logos, banners, graphics, visual design.
- **Web_And_Social**: Landing pages, Social media copy, BackaBuddy links, payment bridges.
- **Source_Artifacts+*: Specialized code, trading models, standalone builds.

---

## 4. TAB 02 PRD INJECTION FORMAT
When Monty or the War Room LMM synthesizes a directive into a PRD, it must output the directory schema as json:
``json
{
  "project_name": "Project_Name_In_Pascal_Snake_Case",
  "required_directories": [
    "Leads",
    "Responses_And_Donations",
    "Assets_And_Artwork",
    "Web_And_Social"
  ]
}
``