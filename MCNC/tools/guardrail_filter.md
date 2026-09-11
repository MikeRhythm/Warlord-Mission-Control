# TOOL: Pre-Tool Execution Guardrail Filter
**Owner:** Charlie (Code & Infrastructure Lead)  
**Type:** Pre-Execution Security Hook (`.js`)  
**Status:** ACTIVE

## Operational Purpose
Acts as an in-line gate before any shell command, file-system purge, or database query executes. It scans payloads against regex patterns to eliminate accidental data wipes, destructive format commands, or forced Git resets.

## Input Schema
```json
{
  "command": "string"
}