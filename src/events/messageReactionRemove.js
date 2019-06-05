const { Event } = require('klasa');

class MessageReactionRemoveEvent extends Event {

	run(res, user) {
		// Performing action based on emoji...
		switch (res.emoji.name) {
			// Star emote for starboard...
			case '⭐':
				return this.client.emit('starRemove', res, user);
		}
		// Everything is success, time for silent exit...
		return;
	}

}

module.exports = MessageReactionRemoveEvent;
