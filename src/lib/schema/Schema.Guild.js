const { Client } = require('klasa');

Client.defaultGuildSchema

	// Channels for various systems...
	.add('channels', channels => channels
		.add('starboard', 'TextChannel')
		.add('modlogs', 'TextChannel'))

	// Roles for various systems...
	.add('roles', roles => roles
		.add('muted', 'Role'))

	// Starboard system...
	.add('starboard', starboard => starboard
		.add('enabled', 'Boolean', { default: false })
		.add('minimumCount', 'Integer', { default: 3 })
		.add('noSelfStar', 'Boolean', { default: false }))

	// ModLog system...
	.add('modlogs', modlogs => modlogs
		.add('enabled', 'Boolean', { default: false })
		.add('data', 'Any', { array: true, configurable: false }));
