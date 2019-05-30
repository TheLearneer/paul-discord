const { Command } = require('klasa');

class HistoryCommandModeration extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			usage: '[User:User]'
		});
	}

	async run(msg, [user = msg.author]) {
		// Getting all the logs of users...
		const logs = msg.guild.settings.modlogs.data.filter(log => log.user === user.id);
		// User details...
		const details = [`\`USER\` - **${user.tag}** _(${user.id})_`, ''];
		// Adding details...
		if (logs.length) {
			details.push([
				`\`Bans:\` **${logs.filter(log => log.action.toLowerCase() === 'ban').length}**`,
				`\`Kicks:\` **${logs.filter(log => log.action.toLowerCase() === 'kick').length}**`,
				`\`Mutes:\` **${logs.filter(log => log.action.toLowerCase() === 'mute').length}**`
			].join('\n'));
		} else {
			details.push('This user is all clean!');
		}
		// Sending details to the channel...
		return msg.send(details);
	}

}

module.exports = HistoryCommandModeration;
