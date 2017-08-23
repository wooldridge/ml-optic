var config = require('./config'),
    rp = require('request-promise');

function handleError(err) {
  if (err.error &&
      err.error.errorResponse &&
      err.error.errorResponse.message) {
    console.log('Error: ' + err.error.errorResponse.message);
  } else {
    console.log(JSON.stringify(err, null, 2));
  }
}

function deleteDatabase() {
  var options = {
    method: 'DELETE',
    uri: 'http://' + config.host + ':8002/manage/v2/databases/' + config.databaseSetup["database-name"] +
         '?forest-delete=data',
    headers: {
      'Content-Type': 'application/json'
    },
    auth: config.auth
  };
  rp(options)
    .then(function (parsedBody) {
      console.log('Database deleted: ' + config.databaseSetup["database-name"]);
      process.exit();
      //deleteSchemaDatabase();
    })
    .catch(function (err) {
      console.log(JSON.stringify(err, null, 2));
    });
}

function deleteSchemaDatabase() {
  var options = {
    method: 'DELETE',
    uri: 'http://' + config.host + ':8002/manage/v2/databases/' + config.schemaDatabaseSetup["database-name"] +
         '?forest-delete=data',
    headers: {
      'Content-Type': 'application/json'
    },
    auth: config.auth
  };
  rp(options)
    .then(function (parsedBody) {
      console.log('Database deleted: ' + config.schemaDatabaseSetup["database-name"]);
      deleteDatabase();
      //process.exit();
    })
    .catch(function (err) {
      console.log(JSON.stringify(err, null, 2));
    });
}

function deleteODBC() {
  var options = {
    method: 'DELETE',
    uri: 'http://' + config.host + ':8002/manage/v2/servers/' + config.database.name + "-odbc" +
         '?group-id=Default',
    json: true,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: config.auth
  };
  rp(options)
    .then(function (parsedBody) {
      console.log('ODBC instance deleted: ' + config.database.name + "-odbc");
      console.log('Restart MarkLogic and then press return to continue');
      process.stdin.once('data', function () {
        deleteREST();
      });
    })
    .catch(function (err) {
      handleError(err)
    });
}

function deleteREST() {
  var options = {
    method: 'DELETE',
    uri: 'http://' + config.host + ':8002/v1/rest-apis/' + config.database.name + "-rest" +
         '?include=content&include=modules',
    json: true,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: config.auth
  };
  rp(options)
    .then(function (parsedBody) {
      console.log('REST instance deleted: ' + config.database.name + "-rest");
      console.log('Restart MarkLogic and then press return to continue');
      process.stdin.once('data', function () {
        deleteSchemaDatabase();
      });
      //process.exit();
    })
    .catch(function (err) {
      handleError(err)
    });
}

function start() {
  //deleteDatabase();
  deleteODBC();
}

start();
