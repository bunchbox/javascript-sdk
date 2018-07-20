# Bunchbox SDK

The JavaScript SDK for [Bunchbox](https://bunchbox.co/).

## Getting Started

### Prerequisites

The SDK currently supports all versions of Node from Node v7 onwards.

### Installing

Add `@bunchbox/bunchbox-sdk` to your package.json:

```bash
npm i bunchbox/javascript-sdk
```

## Usage

First, initialize the BunchboxSDK with your API token:

```js
const bb = new BunchboxSdk('$yourApiToken')
```

To bucket a visitor into a variant activate the experiment

```js
const variantId = await bb.activate({
  userId: '43026325619819',
  experimentId: '5b475fb051ceab0190f68719'
})
```

Subsequently the ID of the variant to which the user has been assigned to is
returned.

To track events for conversion metrics:

```js
await bb.track({ experimentId: '5b475fb051ceab0190f68719', goalIdentifier: 'bb:g01' })
```

### User IDs

The SDK requires you to provide custom user IDs for all calls to `activate` and
`track` in order to uniquely identify the participants in your experiments.
Generally speaking, any string you like may be used as `userId`. However, it is
important to keep the user IDs unique among the population used for
experiments. Well suited, for example, are first-party cookies, device IDs or
universal user identifiers (UUID).

**Note:** Please pay attention to anonymizing the user IDs since they are send
to the Bunchbox servers exactly as you provide them.

### Synchronization

To stay in-sync the SDK needs be notified when an update to an active
`server-side` experiment happened. Therefore it is recommended to setup a webhook
which gets triggered each time the SDK needs to be updated. Alternatively, you
may trigger a reload of the SDK periodically.

#### Webhooks

To create a Webhook navigate to `Account Settings > Webhooks` and add the URL
our service should ping. Your supplied endpoint will receive a POST request
whenever necessary.

A typical payload will look like this:

```json
{
  "accountId": "$yourAccountId",
  "ts": 1531989556143,
  "event": "update"
}
```

After being notified by the Bunchbox servers your Endpoint should trigger a
reload of the SDK:

```js
bb.reloadTestingFile() // Here, bb is an instance of BunchboxSdk
```

#### Securing webhooks

We strongly recommend to verify that requests send to your Endpoint originated
from the Bunchbox servers. For this reason Bunchbox generates a secret key
which is used to create a signature of the webhook payload. That signature is
included in the HTTP header `X-BB-Signature`.

The secret key can only be obtained once after the creation of the webhook. To
regenerate it, please recreate the whole webhook.

To verify the signature of the `X-BB-Signature` header you need to create the
HMAC-SHA256 hexdigest of the (stringified) payload. In Node.js the verification
can be done as follows:

```js
const crypto = require('crypto')

const createSignature = (data, key) => {
  const hmac = crypto.createHmac('sha256', key)
  hmac.update(data)
  return hmac.digest('hex')
}

const digest = createSignature(JSON.stringify(thePayload), yourApiKey)

const isValid = crypto.timingSafeEqual(signature, digest)
```

## Error Handling

The `activate` and `track` calls both return a Promise which usually does not
need to be `await`ed. However, it is still important to think about how to
handle rejected Promises. Under normal circumstances those rejections should
never occurs. If, however, network problems arise `track` / `activate`
naturally cannot succeed. Hence, you should put `catch` in place to handle
those situations as you like. One option would be to retry failed calls with
exponential backoff.

## Running the tests

Run the unit test suite with:

```bash
npm test
```

## Running the linter

```bash
npm run lint
```

## Building the docs

To serve the docs at [https://localhost:4001](https://localhost:4001) run:

```bash
npm run docs
```

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available,
see the [tags on this repository](https://github.com/your/project/tags).

## License

This project is licensed under the MIT License - see the
[LICENSE.md](LICENSE.md) file for details
