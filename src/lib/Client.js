const { Client } = require('klasa');

// Schema files...
require('./schema/Schema.User.js');
require('./schema/Schema.Guild.js');

// Custom store...
const RawEventStore = require('./RawEventsStore');

/**
 * The extended Klasa Client to handle next level features.
 * @extends {KlasaClient}
 * @since 0.1.0
 */
class PaulClient extends Client {

	constructor(clientOptions) {
		super(clientOptions);

		/**
		 * Raw event store of the client.
		 * @typeof Store
		 * @since 0.4.0
		 */
		this.rawEvents = new RawEventStore(this);

		// Registering custom store...
		this.registerStore(this.rawEvents);
	}

	/**
	 * Invite link to the support server of the bot.
	 * @since 0.1.0
	 * @readonly
	 */
	get supportServer() {
		return '<https://discord.gg/WMXeCbD>';
	}

}

module.exports = PaulClient;
