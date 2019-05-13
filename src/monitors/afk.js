const { Monitor } = require('klasa');

class AFKMonitor extends Monitor {

	constructor(...args) {
		super(...args, {
			ignoreOthers: false,
			ignoreEdits: false
		});
	}

	async run(msg) {
		// Array to hold afk message response for all the mentioned users...
		const afkResponse = [];

		// Exit if message is not in a guild...
		if (!msg.guild) return;

		// Going through all the mentioned users in the message...
		for (const user of msg.mentions.users.values()) {
			// Exit further checks for user if is self or a bot...
			if (user.bot || user.id === msg.author.id) continue;
			// Getting the user's setting...
			const { settings } = user;
			// Exit further checks for user if afk status is disabled...
			if (!settings.afk.enabled) continue;
			// Adding the user's AFK message to the afk response list...
			afkResponse.push(`**${user.tag}** is currently AFK with the following message:\n${settings.afk.message}\n`);
		}

		// Informing the message author about afk responses...
		if (afkResponse.length) await msg.send(`${msg.author} please keep a note that:\n\n${afkResponse.join('\n')}`);
	}

}

module.exports = AFKMonitor;
