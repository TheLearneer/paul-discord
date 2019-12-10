const { Client } = require('klasa');

Client.defaultGuildSchema

	.add('starboard', starboard => starboard
		.add('enabled', 'Boolean', { default: false })
		.add('channel', 'TextChannel')
		.add('noSelfStar', 'Boolean', { default: false })
		.add('minimumStars', 'Integer', { default: 3 }));
