const { Client } = require('klasa');
const path = require('path');

// Guild Schema extension...
Client.defaultGuildSchema
	.add('starboard', starboard => starboard
		.add('enabled', 'Boolean', { default: false })
		.add('channel', 'TextChannel')
		.add('noSelfStar', 'Boolean', { default: false })
		.add('minimumStars', 'Integer', { default: 3 }));

class StarboardClient extends Client {

	constructor(options) {
		super(options);
		this.constructor[Client.plugin].call(this);
	}

	static [Client.plugin]() {
		const coreDirectory = path.join(__dirname, '../');
		this.events.registerCoreDirectory(coreDirectory);
	}

}

module.exports = StarboardClient;
