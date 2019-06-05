const { Event } = require('klasa');

class MessageReactionAddEvent extends Event {

	run(res, user) {
		if (res.emoji.name !== '⭐') return;
		this.client.emit('starAdd', res, user);
	}

}

module.exports = MessageReactionAddEvent;
