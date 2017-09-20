const createLogger = require('./logger');
const onFinished = require('on-finished');
const { getRequestDataToLog } = require('./lib/utils');

/**
 * middleware
 * Logging middleware which logs to stdout always to a file in production
 *
 * @param {Object.<String>}
 * @return {Function}
 */
module.exports = function middleware(options) {
  const logger = createLogger(options);
  const {
    getMetadata,
    getStats,
    params,
  } = options;

  return function logRequest(req, res, next) {
    const startTime = new Date();
    const request = getRequestDataToLog(req, params);

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

      const metadata = getMetadata ? getMetadata(req) : {};
      const stats = getStats ? getStats(req, responseTime) : {};

      const msg = `${req.method} ${request.url} ${res.statusCode} - ${responseTime}ms`;
      const info = {
        timestamp,
        request,
        response,
        metadata,
        stats,
      };

      logger.info(info, msg);
    });

    next();
  };
};
