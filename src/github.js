var prompt      = require('prompt');
var config      = require('./config');
var credentials = config.readConfig();

module.exports = {
  credentials: function (cb) {
    if (credentials.github.username && credentials.github.password) {
      return cb();
    }

    console.log('Setup your github account:'.warn);

    var properties = [
      {
        name: 'username',
        required: true
      },
      {
        name: 'password',
        hidden: true,
        required: true
      }
    ];

    prompt.start();

    prompt.get(properties, function (err, result) {
      credentials.github.username = result.username;
      credentials.github.password = result.password;

      config.saveData(credentials, function () {
        console.log('Github credentials saved!'.info);

        return cb();
      });
    });
  }
}
