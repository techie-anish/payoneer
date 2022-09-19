/**
 * Payoneer Request handler.
 *
 * @module PYRequest
 */

const rp = require('request-promise');
const parseXML = require('xml2js').parseString;

/**
 * PYRequest
 */
class PYRequest {
  /**
   * @constructor
   *
   * @param {Object} config - Common configuration. You must suplly the
   *                          following parameters: username, apiPassword,
   *                          partnerId.
   */
  constructor(config) {
    this.config = config;
    this.credentials = {
      p1: this.config.username,
      p2: this.config.apiPassword,
      p3: this.config.partnerId
    };
  }

  /**
   * Payoneer post.
   *
   * @param {string} mname - The method name (eg 'GetVersion').
   * @param {Object} parameters - The method parameters.
   *
   * @returns {Promise} A new Promise. If there is no errors, the result
   *                    will be a JavaScript object.
   */
  post(mname, parameters) {
    let qs = Object.assign(this.credentials, { mname: mname }, parameters);

    let options = {
      uri: this.config.uri,
      method: 'POST',
      port: 443,
      qs: qs
    };

    console.log('Request:\n', options, '\n');

    let response = rp(options);

    return new Promise(function(success, reject) {
      response.then(function(data) {
        parseXML(data, function(error, result) {
          if (error) {
            reject(new Error(error));
          }
          if (result.PayoneerResponse && result.PayoneerResponse.Code) {
            let error = result.PayoneerResponse;
            reject(new Error(`${error.Code} - ${error.Description}`));
          }
          success(result);
        });
      })
      .catch(function(error) {
        reject(error);
      });
    });
  }
}

module.exports = PYRequest;
