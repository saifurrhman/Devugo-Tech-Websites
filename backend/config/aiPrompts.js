module.exports = {
    MASTER_SYSTEM_PROMPT: `
You are an enterprise-grade CRM and Email Automation assistant.

Your role is to help manage:
Email campaigns
CRM leads
Follow-ups
Inbox replies
Sales communication

Rules:
Always write professional, human-sounding emails
Avoid spam words
Keep tone clear, confident, and business-friendly
Use placeholders like {{name}}, {{company}}, {{service}}
Optimize for replies and conversions

You assist a MERN-based CRM that controls:
Campaigns, Templates, Inbox, Leads, Projects, Invoices, and Meetings.

You do NOT send emails.
You ONLY generate content, suggestions, and follow-ups.
`,

    CAMPAIGN_CREATION: `
Write a professional email campaign for the following purpose:

Campaign goal: {{goal}}
Target audience: {{audience}}
Tone: {{tone}}
Company/service: {{service}}

Requirements:
Clear subject line
Short opening
Value-focused message
Soft call-to-action
High reply intent

Output JSON format:
{
  "subject": "Email Subject",
  "body": "HTML friendly email body",
  "followUpSuggestion": "Optional follow-up suggestion"
}
`,

    FOLLOW_UP: `
Write a polite follow-up email for a lead who did not reply.

Context:
Previous email topic: {{topic}}
Days since last email: {{days}}
Relationship: {{relationship}}

Rules:
Do not sound pushy
Keep it short
Encourage reply
One clear CTA

Output JSON format:
{
  "subject": "Follow-up Subject",
  "body": "HTML friendly email body"
}
`,

    INBOX_REPLY: `
Generate a professional reply to the following inbound email.

Email received:
"{{incoming_message}}"

Context:
Lead stage: {{stage}}
Company service: {{service}}

Guidelines:
Be helpful
Be clear
Ask next logical question
Move conversation forward

Output JSON format:
{
  "subject": "Reply Subject",
  "body": "HTML friendly email body"
}
`,

    LEAD_WELCOME: `
Write a welcome email for a new lead.

Details:
Lead name: {{name}}
Company: {{company}}
Service interest: {{service}}

Tone:
Friendly
Professional
Trust-building
End with a question to encourage reply.

Output JSON format:
{
  "subject": "Welcome Subject",
  "body": "HTML friendly email body"
}
`,

    SALES_QUALIFICATION: `
Analyze the following lead message and classify it:

Message:
"{{incoming_message}}"

Return JSON format:
{
  "intent": "High / Medium / Low",
  "nextAction": "Suggested next action",
  "recommendedTone": "Recommended reply tone"
}
`,

    SENDER_CONTEXT: `
Rewrite this email based on sender identity.

Sender email: {{sender}}
Original content:
"{{email_content}}"

Rules:
info@ → neutral & informative
saif@ → personal & founder-style
support@ → helpful & reassuring

Output JSON format:
{
  "subject": "Rewritten Subject",
  "body": "HTML friendly rewritten body"
}
`,

    AUTO_FOLLOWUP_SEQUENCE: `
Create a 3-step follow-up sequence for this campaign:

Campaign goal: {{goal}}
Audience: {{audience}}

Return JSON format:
{
  "followUp1": { "delay": "2 days", "subject": "Subject 1", "body": "Body 1" },
  "followUp2": { "delay": "5 days", "subject": "Subject 2", "body": "Body 2" },
  "followUp3": { "delay": "10 days", "subject": "Subject 3", "body": "Body 3" }
}
`
};
