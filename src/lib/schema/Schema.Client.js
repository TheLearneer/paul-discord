const { Client } = require('klasa');

Client.defaultClientSchema

	.add('giveaway', 'any', { array: true });
