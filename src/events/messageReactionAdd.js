const { Event } = require('klasa');
const Starboard = require('../lib/modules/utility/Starboard');

class MessageReactionAddEvent extends Event {

	async run(res, user) {
		// Performing action based on emoji...
		switch (res.emoji.name) {
			// Star emote for starboard...
			case '⭐':
				await Starboard.handleReactionAdd(res, user);
				break;
		}
		// Everything is success, time for silent exit...
		return;
	}

}

module.exports = MessageReactionAddEvent;
