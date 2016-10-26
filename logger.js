const bunyan = require('bunyan');
const fluentL = require('fluent-logger');

module.exports = function createLogger({ name, output, host, port }) {
  if (!name) {
    throw new Error('Please provide a name');
  }

  let stream = process.stdout;

  if (output === 'td-agent-forward') {
    const sender = fluentL.createFluentSender('', {
      host,
      port,
      timeout: 3.0,
      levelTag: false,
      reconnectInterval: 600000,
    });
    stream = sender.toStream('application.logs');
  } else {
    stream = process.stdout;
  }

  const logger = bunyan.createLogger({
    name,
    streams: [{ stream }],
    serializers: bunyan.stdSerializers,
  });

  logger._info = logger.info;
  logger.info = function(data, msg) {
    data.timestamp = new Date();
    return this._info(data, msg);
  };

  return logger;
};
