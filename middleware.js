const bunyan = require('bunyan');
const onFinished = require('on-finished');
const { removeTokensFromQuery, removeTokensFromUrl } = require('./lib/utils');

/**
 * middleware
 * Logging middleware which logs to stdout always to a file in production
 *
 * @param {Object.<String>}
 * @return {Function}
 */
module.exports = function middleware({
  name,
  path: '/var/log/application.log'
}) {

  if (!name) {
    throw new Error('Please provide a name');
  }

  const streams = [{ stream: process.stdout }];

  if (process.env.NODE_ENV === 'production') {
    streams.push({
      type: 'rotating-file',
      path: path,
      period: '1h',
      count: 5
    });
  }

  const logger = bunyan.createLogger({
    name: name,
    streams: streams,
    serializers: bunyan.stdSerializers,
  });

  return function logRequest(req, res, next) {
    const startTime = new Date();

    const cleanUrl = removeTokensFromUrl(req.url);

    const request = {
      url: cleanUrl,
      method: req.method,
      params: removeTokensFromQuery(req.query),
      connection: {
        remoteAddress: req.connection.remoteAddress,
        remotePort: req.connection.remotePort,
      },
    };

    // Copy headers, removing cookies from the noise
    request.headers = Object.assign({}, req.headers);
    delete request.headers.cookie;

    onFinished(res, () => {
      const finishTime = new Date();
      const time = finishTime.toJSON();
      const responseTime = finishTime.getTime() - startTime.getTime();

      const response = {
        statusCode: res.statusCode,
        responseTime,
      };

      if (req.errorLog) {
        response.error = req.errorLog;
      }

      const stats = !req.trackingData ? {} : {
        responseTime,
        externalRequestTime: req.trackingData.externalRequestTime,
        processingTime: responseTime - req.trackingData.externalRequestTime,
        images: req.trackingData.images,
      };

      const msg = `${req.method} ${cleanUrl} ${res.statusCode} - ${responseTime}ms`;
      const info = {
        '@timestamp': time,
        time,
        request,
        response,
        stats,
      };

      logger.info(info, msg);
    });

    next();
  };
};
