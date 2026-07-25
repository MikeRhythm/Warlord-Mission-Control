---
name: "wasp-payload-validator"
description: "Validates JSON payloads for trading signals."
status: proposal
version: "v1"
date: "2026-07-15T12:09:46.343Z"
---

# Wasp Payload Validator Skill

This skill validates incoming JSON payloads for trading signals against a predefined schema.

## Tools

- `validate_payload`: Validates a JSON string and returns { valid: boolean, errors: string[] }.

## Support Files

- `scripts/validate.js`: Node.js script that performs the validation.

## Usage

In an OpenClaw session, you can use the `validate_payload` tool by providing a JSON string.

Example input:
```json
{
  "symbol": "EURUSD",
  "action": "BUY",
  "lotSize": 0.1,
  "price": 1.0850
}
```

The tool will return a JSON object indicating validity and any errors.