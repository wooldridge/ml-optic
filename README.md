# ml-optic

Test of the MarkLogic Optic API.

1. Copy `config_sample.js` to `config.js` and edit for your environment
(/PATH/TO, HOSTNAME, USERNAME, PASSWORD). Create databases and servers and
load example documents into the databases by running the following:

  `node setup.js`

2. The `queries` directory includes example Optic queries. Run them like
this:

  `node query.js selectAll.json`

3. To delete the databases and servers, run the following:

  `node teardown.js`
