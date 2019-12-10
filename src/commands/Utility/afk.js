const { Command } = require('klasa');

class AFKCommand extends Command {

	constructor(...args) {
		super(...args, {
			usage: '[enable|disable|update|status:default] [Message:...String]',
			usageDelim: ' ',
			subcommands: true
		});
	}

	async enable(msg) {
		const { settings } = msg.author;
		if (settings.afk.enabled) throw 'Your AFK status is already enabled!';
		await settings.update('afk.enabled', true);
		await msg.send('Your AFK status has been successfully enabled.');
	}

	async disable(msg) {
		const { settings } = msg.author;
		if (!settings.afk.enabled) throw 'You AFK status is already disabled!';
		await settings.update('afk.enabled', false);
		await msg.send('You AFK status has been successfully disabled.');
	}

	async update(msg, [afkMessage]) {
		const { settings } = msg.author;
		if (!afkMessage) {
			afkMessage = await msg.awaitReply('Enter your new AFK message.', { time: 360000 });
			if (!afkMessage) throw 'Action aborted due to lack of response!';
		}
		if (afkMessage === settings.afk.message) throw 'The AFK message you just provided is what you currently have. Please think something new!';
		await settings.update('afk.message', afkMessage).catch(err => console.log(err));
		await msg.send(`Your AFK message has been successfully updated to:\n${afkMessage}`);
	}

	async status(msg) {
		const { settings } = msg.author;
		await msg.send([
			`\`AFK Status:\` **${settings.afk.enabled ? 'Active' : 'Inactive'}**`,
			`\`AFK Response message:\` ${settings.afk.message}`
		].join('\n'));
	}

}

module.exports = AFKCommand;
