/* eslint-env mocha */
/* eslint padded-blocks: 0 max-len: 0 */
const { assert } = require('chai');
const StdoutCapture = require('./helpers/stdout');
const createLogger = require('../logger');

const stdout = new StdoutCapture();

describe('logger', () => {

  it('should export function', () => {
    assert.isFunction(createLogger);
  });

  it('should return instance of logger', () => {
    const logger = createLogger({ name: 'Test' });
    assert.isObject(logger);
    assert.isFunction(logger.info);
  });

  it('should log to stdout', () => {
    const logger = createLogger({ name: 'Test-stdout' });
    stdout.capture();
    logger.info({ metadata: { type: 'test' } }, 'Test message');
    const output = stdout.stop();
    assert.lengthOf(output, 1, 'it should output a single line');
  });

  it('should log in a json encoded output', () => {
    const name = 'Test-json';
    const logger = createLogger({ name });
    stdout.capture();
    logger.info({ metadata: { type: 'test' } }, 'Test message');
    const output = stdout.stop();
    try {
      JSON.parse(output[0]);
    } catch (err) {
      assert.fail(null, null, 'Could not parse output as valid JSON');
    }
  });

  it('should log correctly structured json', () => {
    const name = 'Test-json';
    const type = 'test';
    const msg = 'Test message';
    const logger = createLogger({ name });
    stdout.capture();
    logger.info({ metadata: { type } }, msg);
    const output = stdout.stop();
    const outputData = JSON.parse(output[0]);
    assert.equal(outputData.name, name);
    assert.equal(outputData.metadata.type, type);
    assert.equal(outputData.msg, msg);
  });

});
