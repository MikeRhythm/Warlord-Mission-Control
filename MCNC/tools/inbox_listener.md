# TOOL: Inbound IMAP Reply Listener
**Owner:** Jack (Marketing & Growth)  
**Host Dependencies:** `npm install imapflow mailparser`  
**Operational Target:** Lead response detection & automated triage staging

## Purpose
Connects via secure IMAP to scan unread inbound messages. Parses thread headers (`inReplyTo`), triages intent (`POSITIVE`, `QUESTION`, `OBJECTION`, `UNSUBSCRIBE`), and stages incoming leads directly into `vault/Marketing/Pending_Replies/` for Monty review and Commander sign-off.

## Execution
```javascript
const { checkInboxReplies } = require('./inbox_listener');

checkInboxReplies().then(results => {
  console.log(`Triaged ${results.processedCount} inbound replies.`);
});