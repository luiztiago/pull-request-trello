var prompt      = require('prompt');
var request     = require('request');
var config      = require('./config');
var credentials = config.readConfig();

module.exports = {
  credentials: function (cb) {
    if (credentials.trello.token) { return cb(); }

    console.log(' To setup your trello credentials you need to generate a TOKEN.'.warn);
    console.log('   1. Go to https://trello.com/1/authorize?key=' + credentials.appKey + '&name=prtrello&expiration=never&response_type=token'.warn);

    prompt.start();

    prompt.get(['token'], function (err, result) {
      if (err) {
        console.log('OK, bye!'.error);
        process.exit();
      }

      credentials = config.readConfig();
      credentials.trello.token = result.token;
      config.saveData(credentials, function () {
        console.log('Trello credentials saved!'.info);
        console.log('##########################################'.green);
        console.log('Now, run prtrello again to start using this tool'.green);
        console.log('##########################################'.green);

        return cb();
      });
    });
  },

  askID: function (cb) {
    var tempID = config.readConfig().temp.taskId;
    var tempIDText = '[' + tempID + ']';

    prompt.message = '[Trello]'.verbose;
    prompt.start();

    prompt.get({
      properties: {
        taskId: {
          description: 'What is the task ID? '.verbose + tempIDText.magenta
        }
      }
    }, function (err, result) {
      if (err) {
        console.log('OK, bye!'.error);
        process.exit();
      }

      return cb((!result.taskId) ? tempID : result.taskId);
    });
  },

  getCardInfo: function (taskId, cb) {
    credentials = config.readConfig();
    console.log('[Trello]'.verbose + 'Getting trello card information...'.warn);

    request({
      url: 'https://api.trello.com/1/cards/' + taskId + '?fields=name,idList,shortLink,shortUrl&key=' + credentials.appKey + '&token=' + credentials.trello.token,
      method: 'GET',
      json: true
    }, function (error, response, body) {
      if (error) {
        console.log(error.error);
        process.exit();
      }

      if (response.statusCode == 401) {
        console.log('Your token is invalid, please run prtrello -r'.error);
        process.exit();

      } else if (response.statusCode == 400) {
        console.log('This task id is invalid, exiting..'.error);
        process.exit();
      }

      cb(body);
    });
  }
};
