module.exports = {
  postgres: process.env.DATABASE_URL || 'postgres://postgres:example@127.0.0.1/postgres',
  sessionSecret: process.env.SESSION_SECRET || 'Your Session Secret goes here',
  bbApiToken: process.env.BB_API_TOKEN || 'Your Bunchbox API Token goes here',
  bbExperimentId: process.env.BB_EXP_ID || 'yourExperimentId',
  sessionTable: 'session'
}
