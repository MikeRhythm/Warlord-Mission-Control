# TOOL: SMTP Outbound Dispatcher
**Owner:** Jack (Marketing & Growth)  
**Host Dependency:** `npm install nodemailer`  
**Operational Target:** Cold email delivery and outreach execution

## Purpose
Directly sends authenticated, plain-text outreach emails via any SMTP relay (Google Workspace, private server, SES). Automatically logs message IDs and recipients to `MCNC_Logs/email_dispatch.log`.

## Environment Variables (.env)
* `SMTP_HOST`
* `SMTP_PORT`
* `SMTP_USER`
* `SMTP_PASS`
* `SMTP_FROM`

## Usage Example
```javascript
const { sendOutboundMail } = require('./smtp_dispatcher');

sendOutboundMail({
  to: 'target@domain.com',
  subject: 'Algorithmic execution infrastructure',
  bodyText: 'Plain text payload...'
}).then(console.log);