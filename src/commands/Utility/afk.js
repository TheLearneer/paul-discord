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
		// Getting the user's setting...
		const { settings } = msg.author;
		// Checking if AFK status is already enabled...
		if (settings.afk.enabled) throw 'Your AFK status is already enabled!';
		// Enabling the AFK status for the user...
		await settings.update('afk.enabled', true);
		// Informing user...
		await msg.send('Your AFK status has been successfully enabled.');
	}

	async disable(msg) {
		// Getting the user's setting...
		const { settings } = msg.author;
		// Checking if AFK status is already disabled...
		if (!settings.afk.enabled) throw 'You AFK status is already disabled!';
		// Disabling the AFK status for the user...
		await settings.update('afk.enabled', false);
		// Informing user...
		await msg.send('You AFK status has been successfully disabled.');
	}

	async update(msg, [afkMessage]) {
		// Getting the user's setting...
		const { settings } = msg.author;
		// Asking for AFK message if none is provided...
		if (!afkMessage) {
			// Getting new AFK message from the user...
			afkMessage = await msg.awaitReply('Enter your new AFK message.', { time: 360000 });
			// Checking if user provided response or not...
			if (!afkMessage) throw 'Action aborted due to lack of response!';
		}
		// Checking if new AFK message is same as old one...
		if (afkMessage === settings.afk.message) throw 'The AFK message you just provided is what you currently have. Please think something new!';
		// Updating the AFK message...
		await settings.update('afk.message', afkMessage).catch(err => console.log(err));
		// Informing user...
		await msg.send(`Your AFK message has been successfully updated to:\n${afkMessage}`);
	}

	async status(msg) {
		// Getting the user's setting...
		const { settings } = msg.author;
		// Informing user...
		await msg.send([
			`\`AFK Status:\` **${settings.afk.enabled ? 'Active' : 'Inactive'}**`,
			`\`AFK Response message:\` ${settings.afk.message}`
		].join('\n'));
	}

}

module.exports = AFKCommand;
