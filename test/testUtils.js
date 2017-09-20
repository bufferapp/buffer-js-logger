/* eslint-env mocha */
/* eslint padded-blocks: 0 max-len: 0 */
const { assert } = require('chai');
const {
  removeTokensFromQuery,
  removeTokensFromUrl,
  pick,
  getRequestDataToLog,
} = require('../lib/utils');

describe('utils', () => {

  describe('removeTokensFromQuery', () => {

    it('should remove sensitive tokens from a given query object', () => {
      assert.deepEqual(removeTokensFromQuery({ access_token: '1234' }), { access_token: '*' });
      assert.deepEqual(removeTokensFromQuery({ token: '5678' }), { token: '*' });
    });

    it('should not touch non token params', () => {
      assert.deepEqual(removeTokensFromQuery({ access_token: '1234', id: 100 }), { access_token: '*', id: 100 });
      assert.deepEqual(removeTokensFromQuery({ token: '5678', client_id: 'ABCD' }), { token: '*', client_id: 'ABCD' });
    });

    it('should handle undefined query argument', () => {
      assert.deepEqual(removeTokensFromQuery(undefined), {});
    });

  });

  describe('removeTokensFromUrl', () => {

    it('should remove sensitive tokens from a given url', () => {
      assert.equal(removeTokensFromUrl('http://api.test.com/something?access_token=1234'),
        'http://api.test.com/something?access_token=*');
      assert.equal(removeTokensFromUrl('http://api.test.com/ok.json?my_token=ABCD'),
        'http://api.test.com/ok.json?my_token=*');
    });

    it('should not remove non-sensitive params from the query string', () => {
      assert.equal(removeTokensFromUrl('http://api.test.com/something?access_token=1234&url=http%3A%2F%2Ftoken.com'),
        'http://api.test.com/something?access_token=*&url=http%3A%2F%2Ftoken.com');
      assert.equal(removeTokensFromUrl('http://api.test.com/ok.json?token=1234&client_id=987654321'),
        'http://api.test.com/ok.json?token=*&client_id=987654321');
    });

    it('should do nothing to urls without tokens', () => {
      assert.equal(removeTokensFromUrl('http://test.com/?url=http%3A%2F%2Fok.com'),
        'http://test.com/?url=http%3A%2F%2Fok.com');
      assert.equal(removeTokensFromUrl('http://test.com/ok/path'),
        'http://test.com/ok/path');
    });

  });

  describe('pick', () => {

    it('should only return object with specified keys', () => {
      const obj = {
        good: 'should remain',
        bad: 'should be gone',
      };
      const picked = pick(obj, ['good']);
      assert.deepEqual(picked, { good: 'should remain' });
    });

  });

  describe('getRequestDataToLog', () => {

    it('should filter out headers', () => {
      const req = {
        url: '/path?key=val',
        method: 'GET',
        connection: {
          remoteAddress: '::ffff:172.18.0.12',
          remotePort: 40234,
        },
        headers: {
          host: 'buffer.com',
          'user-agent': 'Mozilla/5.0',
          referer: 'https://twitter.com',
          'cache-control': 'no-cache',
          'x-real-ip': '172.18.0.1',
          'x-forwarded-for': '172.18.0.1',
          'x-something-bogus': false,
        },
      };
      const data = getRequestDataToLog(req);
      assert.deepEqual(data.headers, {
        host: 'buffer.com',
        'user-agent': 'Mozilla/5.0',
        referer: 'https://twitter.com',
        'cache-control': 'no-cache',
        'x-real-ip': '172.18.0.1',
        'x-forwarded-for': '172.18.0.1',
      });
    });

    it('should grab the data we want to track', () => {
      const req = {
        url: '/path?key=val',
        path: '/path?key=val',
        method: 'GET',
        query: {
          key: 'val',
        },
        connection: {
          remoteAddress: '::ffff:172.18.0.12',
          remotePort: 40234,
        },
        headers: {
          'user-agent': 'Mozilla/5.0',
          cookie: 'ok',
        },
      };
      const data = getRequestDataToLog(req);
      assert.deepEqual(data, {
        url: '/path?key=val',
        method: 'GET',
        connection: {
          remoteAddress: '::ffff:172.18.0.12',
          remotePort: 40234,
        },
        headers: {
          'user-agent': 'Mozilla/5.0',
        },
        params: {},
      });
    });

    it('should filter out params that are not specified', () => {
      const req = {
        url: '/path?keep=1&remove=0',
        method: 'GET',
        query: {
          keep: 1,
          remove: 0,
        },
        connection: {
          remoteAddress: '::ffff:172.18.0.12',
          remotePort: 40234,
        },
        headers: {},
      };
      const data = getRequestDataToLog(req, ['keep']);
      assert.deepEqual(data.params, { keep: 1 });
    });

    it('should handle requests with unparsed query objects', () => {
      const req = {
        url: '/path?key=val',
        method: 'GET',
        connection: {
          remoteAddress: '::ffff:172.18.0.12',
          remotePort: 40234,
        },
        headers: {
          cookie: 'ok',
        },
      };
      const data = getRequestDataToLog(req, ['key']);
      assert.equal(data.params.key, 'val');
    });

  });

});
