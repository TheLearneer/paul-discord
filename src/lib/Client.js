const { Client } = require('klasa');

// Prototype files...
require('./prototype/Prototype.String');

// Schema files...
require('./schema/Schema.Client');
require('./schema/Schema.Guild');
require('./schema/Schema.User');

class PaulClient extends Client {

	get supportServer() {
		return '<https://discord.gg/WMXeCbD>';
	}

}

module.exports = PaulClient;
