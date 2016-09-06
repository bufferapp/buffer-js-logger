const createLogger = require('./logger');
const onFinished = require('on-finished');
const { removeTokensFromQuery, removeTokensFromUrl } = require('./lib/utils');

/**
 * middleware
 * Logging middleware which logs to stdout always to a file in production
 *
 * @param {Object.<String>}
 * @return {Function}
 */
module.exports = function middleware(options) {
  const logger = createLogger(options);
  const { getStats } = options;

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
      const timestamp = finishTime.toJSON();
      const responseTime = finishTime.getTime() - startTime.getTime();

      const response = {
        statusCode: res.statusCode,
        responseTime,
      };

      if (req.errorLog) {
        response.error = req.errorLog;
      }

      const stats = getStats ? getStats(req, responseTime) : {};

      const msg = `${req.method} ${cleanUrl} ${res.statusCode} - ${responseTime}ms`;
      const info = {
        timestamp,
        request,
        response,
        stats,
      };

      logger.info(info, msg);
    });

    next();
  };
};
