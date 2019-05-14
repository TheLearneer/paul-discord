const { Client } = require('klasa');

Client.defaultGuildSchema

	// Channels for various systems...
	.add('channels', channels => channels
		.add('starboard', 'TextChannel'))

	.add('starboard', starboard => starboard
		.add('enabled', 'Boolean', { default: false })
		.add('minimumCount', 'Integer', { default: 3 })
		.add('noSelfStar', 'Boolean', { default: false }));
