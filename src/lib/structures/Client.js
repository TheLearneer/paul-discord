const { Client } = require('klasa');

// Schema files...
require('../schema/Schema.User.js');

/**
 * The extended Klasa Client to handle next level features.
 * @extends {KlasaClient}
 * @since 0.1.0
 */
class PaulClient extends Client {

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
