var config = require('./config'),
    rp = require('request-promise'),
    fs = require('fs');

var args = process.argv.slice(2);

var q = args.length > 0 ? args[0] : 'selectAll.json';

function runQuery() {
  var buffer = fs.readFileSync('queries/' + q);
  var options = {
    method: 'GET',
    uri: 'http://' + config.host + ':' + config.server.restPort +
         '/v1/rows?plan=' + buffer.toString(),
    auth: config.auth
  };
  rp(options)
    .then(function (result) {
      console.log(result);
    })
    .catch(function (err) {
      console.log(JSON.stringify(err, null, 2));
    });

}

runQuery();
