const { Event } = require('klasa');

class MessageReactionRemoveEvent extends Event {

	run(res, user) {
		if (res.emoji.name !== '⭐') return;
		this.client.emit('starRemove', res, user);
	}

}

module.exports = MessageReactionRemoveEvent;
