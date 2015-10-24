/**
 * Created by jilles on 23/10/15.
 */
var request = require('request');
var cheerio = require('cheerio');
var Promise = require('promise');

var auth = {
  'user': 'admin',
  'pass': 'password'
};

// The router actions
var actions = {
  block: 'always',
  schedule: 'perschedule',
  unblock: 'never'
};

// Payload
var postData = {
  apply: 'Apply',
  ruleSelect: 0,
  select: -1
};

var getActionAndStatus = function () {

  return new Promise(function (resolve, reject) {

    request({
      url: 'http://192.168.1.1/BKS_service.htm',
      method: 'GET',
      auth: auth
    }, function (err, res, body) {
      if (err) reject(error);

      var $ = cheerio.load(body);
      // We need the id from "fw_serv.cgi?id=XXXXXX"
      var requestAction = $('form[name="frmService"]').attr('action');
      var radioButtons = $('table[style="border-collapse:collapse;width:97%"]')
        .find('tr:nth-child(3)')
        .find('input');

      // We get the current selected value
      var selected;
      radioButtons.each(function () {
        // $(this) equals the element as html object
        var option = $(this);
        if (option.attr('checked')) {
          selected = option.attr('value');
        }
      });

      if (!selected) reject('Could not fetch active router status.');

      resolve({
        selected: selected,
        url: requestAction
      });

    });

  });

};

var setRouterAction = function (action, url) {
  return new Promise(function (resolve, reject) {
    var query = postData;
    query['skeyword'] = action;
    request({
        url: 'http://192.168.1.1/'+ url,
        method: 'POST',
        form: query,
        auth: auth
      },
      function (err, data, response) {
        if (err) {
          reject(err);
        } else {
          resolve('OK');
        }
      });
  });
};

module.exports = {
  getActionAndStatus: getActionAndStatus,
  setRouterAction: setRouterAction,
  actions: actions
};
