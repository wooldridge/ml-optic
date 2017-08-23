var config = require('./config'),
    rp = require('request-promise'),
    marklogic = require('marklogic'),
    fs = require('fs');

var db = marklogic.createDatabaseClient({
  host: 'localhost',
  user: config.auth.user,
  password: config.auth.pass,
  port: config.server.restPort
});

  console.log(db);

function getScript(script) {
  return fs.readFileSync(
    __dirname + '/scripts/' + script, { encoding: 'utf8' }
  );
}

function xqueryEval(src, extVars) {
  return db.xqueryEval({
    source: src,
    variables: extVars
  }).result()
}

function createSchemaDatabase() {
  var options = {
    method: 'POST',
    uri: 'http://' + config.host + ':8002/manage/v2/databases',
    body: config.schemaDatabaseSetup,
    json: true,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: config.auth
  };
  rp(options)
    .then(function (parsedBody) {
      console.log('Schema database created: ' + config.schemaDatabaseSetup["database-name"]);
      createDatabase()
    })
    .catch(function (err) {
      console.log(JSON.stringify(err, null, 2));
    });
}

function createDatabase() {
  var options = {
    method: 'POST',
    uri: 'http://' + config.host + ':8002/manage/v2/databases',
    body: config.databaseSetup,
    json: true,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: config.auth
  };
  rp(options)
    .then(function (parsedBody) {
      console.log('Database created: ' + config.databaseSetup["database-name"]);
      getHost();
    })
    .catch(function (err) {
      console.log(JSON.stringify(err, null, 2));
    });
}

var hostName = '';

function getHost() {
  var options = {
    method: 'GET',
    uri: 'http://' + config.host + ':8002/manage/v2/hosts',
    json: true,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: config.auth
  };
  rp(options)
    .then(function (parsedBody) {
      hostName = parsedBody['host-default-list']['list-items']['list-item'][0].nameref;
      console.log('Host name: ' + hostName);
      createSchemaForest(hostName);
    })
    .catch(function (err) {
      console.log(JSON.stringify(err, null, 2));
    });
}

function createSchemaForest(hostName) {
  config.forestSetup["host"] = hostName;
  var options = {
    method: 'POST',
    uri: 'http://' + config.host + ':8002/manage/v2/forests',
    body: config.schemaForestSetup,
    json: true,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: config.auth
  };
  rp(options)
    .then(function (parsedBody) {
      console.log('Forest created and attached: ' + config.schemaForestSetup["forest-name"]);
      createForest(hostName);
    })
    .catch(function (err) {
      console.log(JSON.stringify(err, null, 2));
    });
}

function createForest(hostName) {
  config.forestSetup["host"] = hostName;
  var options = {
    method: 'POST',
    uri: 'http://' + config.host + ':8002/manage/v2/forests',
    body: config.forestSetup,
    json: true,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: config.auth
  };
  rp(options)
    .then(function (parsedBody) {
      console.log('Forest created and attached: ' + config.forestSetup["forest-name"]);
      createODBC();
    })
    .catch(function (err) {
      console.log(JSON.stringify(err, null, 2));
    });
}

function createODBC() {
  var options = {
    method: 'POST',
    uri: 'http://' + config.host + ':8002/manage/v2/servers?format=json',
    body: config.odbcSetup,
    json: true,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: config.auth
  };
  rp(options)
    .then(function (parsedBody) {
      console.log('ODBC instance created at port: ' + config.odbcSetup["port"]);
      createREST();
    })
    .catch(function (err) {
      console.log(JSON.stringify(err, null, 2));
    });
}

function createREST() {
  var options = {
    method: 'POST',
    uri: 'http://' + config.host + ':8002/v1/rest-apis',
    body: config.restSetup,
    json: true,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: config.auth
  };
  rp(options)
    .then(function (parsedBody) {
      console.log('REST instance created at port: ' + config.restSetup["rest-api"]["port"]);
      //createOptions();
      loadData();
    })
    .catch(function (err) {
      console.log(JSON.stringify(err, null, 2));
    });
}

var dataPath = config.path + 'docs/'
    dataFiles = fs.readdirSync(dataPath),
    count = 0;

function loadData() {
  var currFile = dataFiles.shift();
  count++;
  var buffer;
  buffer = fs.readFileSync(dataPath + currFile);

  var options = {
    method: 'PUT',
    uri: 'http://' + config.host + ':' + config.restSetup["rest-api"]["port"] + '/v1/documents?database=' + config.databaseSetup["database-name"] + '&uri=/' + currFile + '&collection=docs',
    body: buffer,
    auth: config.auth
  };
  rp(options)
    .then(function (parsedBody) {
      console.log('Document loaded: ' + currFile);
      if (dataFiles.length > 0) {
        loadData();
      } else {
        console.log('Data loaded');
        loadTemplates();
      }
    })
    .catch(function (err) {
      console.log(JSON.stringify(err, null, 2));
    });
}

var templatePath = config.path + 'scripts/'
    templateFiles = fs.readdirSync(templatePath);

function loadTemplates() {
  var currFile = templateFiles.shift();
  var buffer;
  buffer = fs.readFileSync(templatePath + currFile);

  var options = {
    method: 'POST',
    uri: 'http://' + config.host + ':8002/v1/eval?database=ml-optic',
    body: buffer,
    auth: config.auth
  };
  rp(options)
    .then(function (parsedBody) {
      console.log('Template loaded: ' + currFile);
      if (templateFiles.length > 0) {
        loadTemplates();
      } else {
        console.log('Templates loaded');
        loadTriples();
      }
    })
    .catch(function (err) {
      console.log(JSON.stringify(err, null, 2));
    });
}

var triplesPath = config.path + 'triples/',
    triplesType = 'text/n3',
    triplesFiles = fs.readdirSync(triplesPath);

function loadTriples() {
  var currFile = triplesFiles.shift(),
      buffer = fs.readFileSync(triplesPath + currFile);
  db.graphs.write({
    contentType: triplesType,
    data: buffer
  }).result(
    function(response) {
      if (triplesFiles.length > 0) {
        console.log('Triples loaded: ' + currFile);
        loadTriples();
      } else {
        console.log('Triples loaded');
      }
    },
    function(error) { console.log(JSON.stringify(error)); }
  );

}

function start() {
  createSchemaDatabase();
}

start();
