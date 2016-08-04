const { parse, format } = require('url');

/**
 * removeTokensFromQuery
 * Given a query string object, replace any access tokens with an asterisk
 *
 * @param {Object} query
 * @return {String}
 */
const removeTokensFromQuery = function(query) {
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
module.exports.removeTokensFromUrl = function(url) {
  const parts = parse(url, true);
  parts.query = removeTokensFromQuery(parts.query);
  delete parts.search;
  return format(parts);
};
