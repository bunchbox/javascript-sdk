# Bunchbox SDK Demo

## Prerequisites

- [PostgreSQL](http://www.postgresql.org/download/) / Docker (via `docker-compose up`)
- [Node.js](http://nodejs.org)

## Getting Started

```bash
$ npm install

$ BB_EXP_ID='yourExperimentId' \
  BB_API_TOKEN='yourBunchboxApiToken' \
  BB_WEBHOOK_SECRET='yourWebhookSecret' \
  npm start
```

The demo app can then be accessed on
[http://localhost:8080/](http://localhost:8080/). Create a user and you'll see
a banner showing which variant you were bucketed into.

### BB_API_TOKEN

The API Token can be created in your Account Settings on
[Bunchbox](https://app.bunchbox.co).

Make sure to save your secret since it can only be shown once.

### BB_WEBHOOK_SECRET

To keep the SDK in-sync with Bunchbox it needs to be notified after each change
to active experiments.

To create a webhook navigate to `Account Settings > Webhooks` and add the URL
`http://localhost:8080/webhooks`.

Make sure to save the webhook secret since it can only be shown once.

### BB_EXP_ID

To test the exemplary project you need to create a custom experiment. The
experiment needs to be of type `server-seide` and it has to be active.

Then the experiment id can be found in the URL of the experiment page:

`https://app.bunchbox.co/.../experiments/$BB_EXP_ID`
