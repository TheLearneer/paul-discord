const { Event } = require('klasa');
const Starboard = require('../lib/Starboard');

class StarRemoveEvent extends Event {

	run(res, user) {
		return Starboard.handleReactionRemove(res, user);
	}

}

module.exports = StarRemoveEvent;
