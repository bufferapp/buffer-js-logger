const bunyan = require('bunyan');

module.exports = function createLogger({ name }) {
  if (!name) {
    throw new Error('Please provide a name');
  }

  const logger = bunyan.createLogger({
    name,
    streams: [{ stream: process.stdout }],
    serializers: bunyan.stdSerializers,
  });

  logger._info = logger.info;
  logger.info = function(data, msg) {
    data.timestamp = new Date();
    return this._info(data, msg);
  };

  return logger;
};
