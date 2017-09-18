# @bufferapp/logger

[![NPM Version](https://img.shields.io/npm/v/@bufferapp/logger.svg)](https://www.npmjs.com/package/@bufferapp/logger)
[![Build Status](https://travis-ci.org/bufferapp/buffer-js-logger.svg?branch=master)](https://travis-ci.org/bufferapp/buffer-js-logger)

Provides standard middleware and functions for logging to stdout. In our production cluster these
logs will be indexed in our application-logs Elasticsearch cluster as well as get backed up in s3.

## Install

```
npm install @bufferapp/logger -SE
```

## Usage

To log something, use the logger's `info` method which takes 2 arguments, an object for
structured logging and a string for a message:

```js
logger.info(<Object>, <String>);
```

To use as a normal logger, require and create the logger:

```js
const logger = require('@bufferapp/logger')({ name: 'Some-Worker' });

function run(data) {
  // log something one-off...
  logger.info({
    metadata: {
      service: data.service,
    },
    stats: {
      processingTime: data.time,
      count: data.count,
    }
  }, `Successfully processed ${data.count} items`);
}
```

### Middleware

```js
const logMiddleware = require('@bufferapp/logger/middleware');

app = express();
app.use(logMiddleware({ name: 'My-App' }));
// ...other middleware and route handlers
```

#### Metadata

Add application metadata to your logs using the `getMetadata` option.

```js
app.use(logMiddleware({
  getMetadata: (req) => {
    return {
      userId: req.session.userId,
      profileId: req.query.profileId,
    };
  };
}));
```

#### Stats

Add application stats to your logs. You receive the request object and the response time in
milliseconds. For example, you can add tracking metrics to a `req.trackingData` attribute and
then handle them in your `getStats` method:

```js
app.use(logMiddleware({
  name: 'My-App',
  getStats: (req, responseTime) => {
    return {
      responseTime,
      processingTime: responseTime - req.trackingData.externalRequestTime,
      imagesScanned: req.trackingData.imagesScanned,
    };
  };
}));
// In your request handler
app.get('/get-images', (req, res) => {
  req.trackingData = {};
  getImages(req.url, (images) => {
    req.trackingData.imagesScanned = images.length;
    res.json(images);
  });
});
```
