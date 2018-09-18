module.exports = {
  postgres:
    process.env.DATABASE_URL ||
    'postgres://postgres:example@127.0.0.1/postgres',
  sessionSecret: process.env.SESSION_SECRET || 'Your_Session_Secret_goes_here',
  bbApiToken: process.env.BB_API_TOKEN || 'Your_Bunchbox_API_Token_goes_here',
  bbWebhookSecret:
    process.env.BB_WEBHOOK_SECRET || 'Your_Bunchbox_Webhook_Secret_goes_here',
  bbExperimentId: process.env.BB_EXP_ID || 'yourExperimentId',
  sessionTable: 'session'
}
