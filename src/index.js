const { ShardingManager } = require('kurasuta');
const { join } = require('path');

const client = require('./lib/Client');
const { clientOptions, keys } = require('../config');

const sharder = new ShardingManager(join(__dirname, 'main'), {
	client,
	clientOptions,
	token: keys.token
});

sharder.spawn().catch((err) => console.log(err));
