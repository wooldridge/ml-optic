var config = {};

config.path = "/PATH/TO/ml-optic/"; // include trailing "/"

config.host = "localhost";

config.server = {
  "port": 8569
};

config.database = {
  "name": "ml-optic",
  "port": 8569
};

config.auth = {
  user: 'USERNAME',
  pass: 'PASSWORD',
  sendImmediately: false
};

config.databaseSetup = {
  "database-name": config.database.name
};

config.schemaDatabaseSetup = {
  "database-name": config.database.name + '-schema'
};

config.forestSetup = {
  "forest-name": config.database.name + '-1',
  "database": config.database.name
}

config.schemaForestSetup = {
  "forest-name": config.database.name + '-schema-1',
  "database": config.database.name + '-schema'
}

config.restSetup = {
  "rest-api": {
    "name": config.database.name + "-rest",
    "database": config.database.name,
    "modules-database": config.database.name + "-modules",
    "port": config.database.port,
    "error-format": "json"
  }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = config;
}
