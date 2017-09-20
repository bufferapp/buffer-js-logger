const { parse, format } = require('url');

/**
 * removeTokensFromQuery
 * Given a query string object, replace any access tokens with an asterisk
 *
 * @param {Object} query
 * @return {Object}
 */
const removeTokensFromQuery = function(query) {
  if (!query) {
    return {};
  }
  Object.keys(query).forEach((param) => {
    if (param.indexOf('token') > -1) {
      query[param] = '*';
    }
  });
  return query;
};
module.exports.removeTokensFromQuery = removeTokensFromQuery;


/**
 * removeTokensFromUrl
 * Given a url, replace any access tokens with an asterisk
 *
 * @param {String} url
 * @return {String}
 */
const removeTokensFromUrl = function(url) {
  const parts = parse(url, true);
  parts.query = removeTokensFromQuery(parts.query);
  delete parts.search;
  return format(parts);
};
module.exports.removeTokensFromUrl = removeTokensFromUrl;

/**
 * pick
 * Given an object and array of keys, return an object with only the specified fields
 *
 * @param {Object} obj
 * @param {Array} keys
 * @return {Object}
 */
const pick = function(obj, keys = []) {
  return keys.reduce((picked, key) => {
    if (key in obj) {
      picked[key] = obj[key];
    }
    return picked;
  }, {});
};
module.exports.pick = pick;


const headersToLog = [
  'user-agent',
  'referer',
  'cache-control',
];
/**
 * getRequestDataToLog
 * Given a http request object, return the proper structure to log
 *
 * @param {http.ClientRequest} req
 * @return {Object}
 */
const getRequestDataToLog = function(req, params = []) {
  const cleanUrl = removeTokensFromUrl(req.url);
  const query = req.query || parse(req.url, true).query;

  const request = {
    url: cleanUrl,
    method: req.method,
    params: removeTokensFromQuery(pick(query, params)),
    connection: {
      remoteAddress: req.connection.remoteAddress,
      remotePort: req.connection.remotePort,
    },
  };

  // Copy only headers we wish to log
  request.headers = pick(Object.assign({}, req.headers), headersToLog);

  return request;
};
module.exports.getRequestDataToLog = getRequestDataToLog;
