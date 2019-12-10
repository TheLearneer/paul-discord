const { Event } = require('klasa');
const Starboard = require('../lib/structures/Starboard');
const Giveaway = require('../lib/structures/Giveaway');

class MessageReactionRemoveEvent extends Event {

	async run(res, user) {
		if (res.message.partial) await res.message.fetch().catch(() => null);
		switch (res.emoji.name) {
			case '⭐':
				Starboard.handleReactionRemove(res, user);
				break;
			case '🎉':
				Giveaway.handleReactionRemove(res, user);
				break;
		}
	}

}

module.exports = MessageReactionRemoveEvent;
