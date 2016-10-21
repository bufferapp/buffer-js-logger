/* eslint-env mocha */
/* eslint padded-blocks: 0 max-len: 0 */
const { assert } = require('chai');
const expect = require('chai').expect;
const StdoutCapture = require('./helpers/stdout');
const runServer = require('./helpers/testHelper').runServer;
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

  it('should return instance of logger for td-agent forward', () => {
    runServer({}, function(server, finish) {
      const logger = createLogger({ name: 'Test', output: 'td-agent-forward', port: server.port });
      assert.isObject(logger);
      assert.isFunction(logger.info);
    });
  });

  it('should log to stdout', () => {
    const logger = createLogger({ name: 'Test-stdout' });
    stdout.capture();
    logger.info({ metadata: { type: 'test' } }, 'Test message');
    const output = stdout.stop();
    assert.lengthOf(output, 1, 'it should output a single line');
  });

  it('should log to td-agent forward', function(done){
    runServer({}, function(server, finish) {
      const logger = createLogger({ name: 'Test-forward', output: 'td-agent-forward', port: server.port });
      logger.info({ metadata: { type: 'test' } }, 'Test message');
      setTimeout(function(){
        finish(function(data) {
          expect(data[0].tag).to.be.equal('application.logs');
          expect(data[0].data).exist;
          done();
        });
      }, 1000);
    });
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

  it('should log in a json encoded outout to td-agent forward', function(done){
    runServer({}, function(server, finish) {
      const logger = createLogger({ name: 'Test-forward', output: 'td-agent-forward', port: server.port });
      logger.info({ metadata: { type: 'test' } }, 'Test message');
      setTimeout(function(){
        finish(function(data) {
          try {
            JSON.parse(data[0].data.message);
          } catch (err) {
            assert.fail(null, null, 'Could not parse output as valid JSON');
          }
          done();
        });
      }, 1000);
    });
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

  it('should log correctly structured json to td-agent forward', function(done){
    const name = 'Test-json';
    const type = 'test';
    const msg = 'Test message';
    runServer({}, function(server, finish) {
      const logger = createLogger({ name: name, output: 'td-agent-forward', port: server.port });
      logger.info({ metadata: { type } }, msg);
      setTimeout(function() {
        finish(function(data) {
          const outputData = JSON.parse(data[0].data.message);
          assert.equal(outputData.name, name);
          assert.equal(outputData.metadata.type, type);
          assert.equal(outputData.msg, msg);
          done();
        });
      }, 1000);
    });
  });

  it('should log a timestamp field', () => {
    const name = 'Test-timestamp';
    const logger = createLogger({ name });
    stdout.capture();
    const before = new Date();
    logger.info({ metadata: { type: 'test' } }, 'Test message');
    const after = new Date();
    const output = stdout.stop();
    const outputData = JSON.parse(output[0]);
    assert.property(outputData, 'timestamp');
    assert.isString(outputData.timestamp, 'timestamp should be json string');
    const timestamp = new Date(outputData.timestamp);
    assert.instanceOf(timestamp, Date, 'timestamp can be parsed');
    assert.isAtLeast(timestamp, before, 'should be in range');
    assert.isAtMost(timestamp, after, 'should be in range');
  });

  it('should log a timestamp field to td-agent forward', function(done) {
    const name = 'Test-timestamp';
    runServer({}, function(server, finish) {
      const logger = createLogger({ name: name, output: 'td-agent-forward', port: server.port });
      const before = new Date();
      logger.info({ metadata: { type: 'test' } }, 'Test message');
      const after = new Date();
      setTimeout(function() {
        finish(function(data) {
          const outputData = JSON.parse(data[0].data.message);
          assert.property(outputData, 'timestamp');
          assert.isString(outputData.timestamp, 'timestamp should be json string');
          const timestamp = new Date(outputData.timestamp);
          assert.instanceOf(timestamp, Date, 'timestamp can be parsed');
          assert.isAtLeast(timestamp, before, 'should be in range');
          assert.isAtMost(timestamp, after, 'should be in range');
          done();
        });
      }, 1000);
    });
  });
});
