const StaticServer = require('../src/index');

const staticServer = new StaticServer({
	port: 9527,
});

staticServer.start();

// staticServer.close();
