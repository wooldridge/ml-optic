var config = {};

config.path = "/PATH/TO/ml-optic/"; // include trailing "/"

config.host = "localhost";

config.database = {
  "name": "ml-optic",
};

config.server = {
  "odbcPort": 8569,
  "restPort": 8570
};

config.auth = {
  user: 'USERNAME',
  pass: 'PASSWORD',
  sendImmediately: false
};

config.schemaDatabaseSetup = {
  "database-name": config.database.name + '-schema'
};

config.databaseSetup = {
  "database-name": config.database.name,
  "schema-database": config.schemaDatabaseSetup["database-name"],
  "triple-index": true
};

config.schemaForestSetup = {
  "forest-name": config.database.name + '-schema-1',
  "database": config.database.name + '-schema'
}

config.forestSetup = {
  "forest-name": config.database.name + '-1',
  "database": config.database.name
}

config.odbcSetup = {
  "group-name": "Default",
  "server-name": config.database.name + "-odbc",
  "server-type": "odbc",
  "root": "Modules",
  "content-database": config.database.name,
  "port": config.server.odbcPort
}

config.restSetup = {
  "rest-api": {
    "name": config.database.name + "-rest",
    "database": config.database.name,
    "modules-database": config.database.name + "-modules",
    "port": config.server.restPort,
    "error-format": "json"
  }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = config;
}
