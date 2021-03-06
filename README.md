# Bunchbox SDK

This repositories contains the [Bunchbox](https://bunchbox.co/) SDK for NodeJS. The SDK provides a slim interface to run experiments of type `server-side`. To do so, Bunchbox provides a JSON file that contains all important data to run experiments on the backend side. In order to receive updates, you can provide a web hook URL within our app. As soon as the experiment was updated, Bunchbox notifies you using this webhook. Please see [Synchronization](#synchronization) for further details. Compared to other experiment types, the content of a variant is not defined within the app but needs to be implemented directly within your backend. Bunchbox will only let you know, which variant the current user was bucketed into.

The SDK will - simply said - take care of evaluating optional targeting conditions, bucketing users  into variants based on hashed user IDs and tracking experiment participations and conversions.

Server-Side testing can be implemented by various languages. This SDK serves as an example how to implement Server-Side testing in any other language.

## Getting Started

### Prerequisites

The SDK currently supports all versions of Node.js from v7 onwards.

### Installing

Add `bunchbox/javascript-sdk` to your package.json:

```bash
npm i bunchbox/javascript-sdk
```

## Usage

First, initialize the BunchboxSDK with your API token:

```js
const BunchboxSdk = require('bunchbox-sdk')
const bb = new BunchboxSdk($yourApiToken)
```

To bucket a visitor into a variant activate the experiment

```js
const variantId = await bb.activate({
	clientId: '43026325619819',
	experimentId: '5b475fb051ceab0190f68719'
})
```

Subsequently the ID of the variant to which the user has been assigned to is
returned.

To track events for conversion metrics:

```js
await bb.track({
	clientId: '43026325619819',
	experimentId: '5b475fb051ceab0190f68719',
	goalIdentifier: 'bb:g01'
})
```

### User IDs

The SDK requires you to provide custom user IDs for all calls to `activate` and
`track` in order to uniquely identify the participants in your experiments.
Generally speaking, any string you like may be used as `clientId`. However, it is
important to keep the user IDs unique among the population used for
experiments. Well suited, for example, are first-party cookies, device IDs or
universal user identifiers (UUID).

**Note:** Please pay attention to anonymizing the user IDs since they are sent
to the Bunchbox servers exactly as you provide them.

### Synchronization

To stay in-sync the SDK needs be notified when an update to an active
`server-side` experiment happened. Therefore it is recommended to setup a webhook
which gets triggered each time the SDK needs to be updated. Alternatively, you
may trigger a reload of the SDK periodically.

#### Webhooks

To create a webhook, navigate to `Account Settings > Webhooks` and add the URL
our service should ping. Your supplied endpoint will receive a `POST` request
whenever necessary.

A typical payload will look like this:

```json
{
	"accountId": "$yourAccountId",
	"ts": 1531989556143,
	"event": "update"
}
```

After being notified by the Bunchbox servers your endpoint should trigger a
reload of the SDK:

```js
bb.reloadTestingFile() // Here, bb is an instance of BunchboxSdk
```

#### Securing webhooks

We strongly recommend to verify that requests sent to your endpoint originated
from the Bunchbox servers. For this reason Bunchbox generates a secret key
which is used to create a signature of the webhook payload. That signature is
included in the HTTP header `X-BB-Signature`.

The secret key can only be obtained once after the creation of the webhook. To
regenerate it, you have to create a new webhook.

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

const digest = createSignature(JSON.stringify(thePayload), $yourApiToken)

const isValid = crypto.timingSafeEqual(signature, digest)
```

## Error Handling

The `activate` and `track` calls both return a Promise which basically does not
need to be `await`ed. However, it is still important to think about how to
handle potential Errors e.g. due to network problems / timeouts. The SDK uses a
custom Error type `Failure` which marks non-critical or temporary errors. It is
recommend to check for those kind of errors in a `catch` clause. Please have a
look at the `example/` for an exemplary implementation.

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
