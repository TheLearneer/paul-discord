const { Event } = require('klasa');
const { Constants: { Events } } = require('discord.js');

class RawEvent extends Event {

	async run(packet) {
		const rawEvent = this.client.rawEvents.get(Events[packet.t]);
		if (rawEvent && rawEvent.enabled) rawEvent.run(packet.d);
	}

}

module.exports = RawEvent;
