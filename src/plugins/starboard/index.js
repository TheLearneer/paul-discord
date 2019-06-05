const { Client: { plugin } } = require('klasa');

module.exports = {
	Client: require('./lib/Client'),
	Starboard: require('./lib/Starboard'),
	[plugin]: require('./lib/Client')[plugin]
};
