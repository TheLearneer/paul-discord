const { Event } = require('klasa');
const Starboard = require('../lib/structures/Starboard');
const Giveaway = require('../lib/structures/Giveaway');

class MessageReactionAddEvent extends Event {

	async run(res, user) {
		if (res.message.partial) await res.message.fetch().catch(() => null);
		switch (res.emoji.name) {
			case '⭐':
				Starboard.handleReactionAdd(res, user);
				break;
			case '🎉':
				Giveaway.handleReactionAdd(res, user);
				break;
		}
	}

}

module.exports = MessageReactionAddEvent;
