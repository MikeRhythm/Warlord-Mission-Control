/**
 * WARLORD MCNC PRE-TOOL GUARDRAIL FILTER
 * Intercepts and blocks destructive commands before shell/tool execution.
 */

const BLOCKED_PATTERNS = [
  /\brm\s+-(rf|fr|r)\s+[\/\\]/i,
  /\brmdir\s+\/s\s+[\/\\]/i,
  /\bformat\b/i,
  /\bdiskpart\b/i,
  /\bdel\s+\/f\s+\/s\s+\/q\s+[c-z]:\\/i,
  /\bdel\s+\/f\s+\/s\s+\/q\s+[\/\\]/i,
  /\b(drop\s+database|truncate\s+table)\b/i,
  /\bgit\s+push\s+.*--force\b/i,
  /\bgit\s+reset\s+--hard\b/i,
  /:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;/
];

function inspectCommand(command) {
  if (!command || typeof command !== 'string') {
    return { allowed: false, reason: "INVALID_COMMAND_PAYLOAD" };
  }

  const trimmed = command.trim();

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        allowed: false,
        reason: "DESTRUCTIVE_PATTERN_DETECTED",
        matchedPattern: pattern.toString(),
        blockedCommand: trimmed
      };
    }
  }

  return { allowed: true, cleanCommand: trimmed };
}

module.exports = { inspectCommand };