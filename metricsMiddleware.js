const createLogger = require('./logger');
const onFinished = require('on-finished');
const { removeTokensFromUrl } = require('./lib/utils');

/**
 * metricsMiddleware
 * Logging middleware which logs to stdout for metrics tracking
 *
 * @param {Object.<String>}
 * @param {Object.<String>}
 * @return {Function}
 */
module.exports = function metricsMiddleware(options) {
  const logger = createLogger(options);

  return function logMetrics(req, res, next) {
    const url = removeTokensFromUrl(req.url);

    onFinished(res, () => {
      const timestamp = new Date().toJSON();
      const info = {
        buffermetrics: true,
        timestamp,
        url,
        metrics: req.bufferMetrics,
      };

      logger.info(info);
    });

    next();
  };
};
