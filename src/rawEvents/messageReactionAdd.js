const { Piece } = require('klasa');

class RawMessageReactionRemoveEvent extends Piece {

	async run(data) {
		// Checking if the reaction is actually on a guild...
		if (!data.guild_id) return;
		// checking if the message already exists in cache or not...
		// i.e. if the raw event should be proceeded or not...
		const channel = this.client.channels.get(data.channel_id);
		if (channel.messages.has(data.message_id)) return;

		// Getting all the required information and calling the event...
		const user = this.client.users.fetch(data.user_id);
		const msg = await channel.messages.fetch(data.message_id);
		const reaction = msg.reactions.get(data.emoji.id || data.emoji.name);

		// emitting the actual event...
		await this.client.events.get('messageReactionRemove').run(reaction, user);
	}

}

module.exports = RawMessageReactionRemoveEvent;
