const { Event } = require('klasa');
const Starboard = require('../lib/Starboard');

class StarAddEvent extends Event {

	run(res, user) {
		return Starboard.handleReactionAdd(res, user);
	}

}

module.exports = StarAddEvent;
