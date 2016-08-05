# @bufferapp/logger

Provides logging standard middleware and functions.

Install the node package

```
npm install @bufferapp/logger -SE
```

Basic use as middleware

```js
const logger = require('@bufferapp/logger/middleware');

app = express();
app.use(logger({ name: 'My-App' }));
// ...other middleware and route handlers
```

Add application stats to your logs. You receive the request object and the response time in
milliseconds. For example, you can add tracking metrics to a `req.trackingData` attribute and
then handle them in your `getStats` method:

```js
app.use(logger({
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
