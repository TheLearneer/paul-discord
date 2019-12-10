const { Monitor } = require('klasa');

class AFKMonitor extends Monitor {

	constructor(...args) {
		super(...args, {
			ignoreOthers: false,
			ignoreEdits: false
		});
	}

	async run(msg) {
		const afkResponse = [];
		if (!msg.guild) return;
		for (const user of msg.mentions.users.values()) {
			if (user.bot || user.id === msg.author.id) continue;
			const { settings } = user;
			if (!settings.afk.enabled) continue;
			afkResponse.push(`**${user.tag}** is currently AFK with the following message:\n${settings.afk.message}\n`);
		}
		if (afkResponse.length) await msg.send(`${msg.author} please keep a note that:\n\n${afkResponse.join('\n')}`);
	}

}

module.exports = AFKMonitor;
