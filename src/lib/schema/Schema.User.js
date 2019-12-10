const { Client } = require('klasa');

Client.defaultUserSchema

	.add('afk', afk => afk
		.add('enabled', 'Boolean', { default: false })
		.add('message', 'String', { default: 'I am busy with something. Please do not disturb!' }));
