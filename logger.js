const bunyan = require('bunyan');

module.exports = function createLogger(options) {
  const {
    name,
    path = '/var/log/application.log',
  } = options;

  if (!name) {
    throw new Error('Please provide a name');
  }

  const streams = [{ stream: process.stdout }];

  if (process.env.NODE_ENV === 'production') {
    streams.push({
      type: 'rotating-file',
      path,
      period: '5h',
      count: 0,
    });
  }

  const logger = bunyan.createLogger({
    name,
    streams,
    serializers: bunyan.stdSerializers,
  });

  logger._info = logger.info;
  logger.info = function(data, msg) {
    data.timestamp = new Date();
    return this._info(data, msg);
  };

  return logger;
};
