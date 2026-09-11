# TOOL: Email OSINT Probe
**Owner:** Jack (Marketing and Growth)  
**Host Dependency:** pip install holehe  
**Operational Target:** Cold outreach deliverability and lead verification

## Purpose
Checks 120+ platforms via password-recovery and registration endpoints without notifying the target. Confirms active inboxes to protect domain reputation.

## Execution
const { probeEmail } = require('./email_osint_probe');
probeEmail('lead@targetdomain.com').then(console.log);