const { Command } = require('klasa');

class UnsubscribeCommand extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			description: 'Unsubscribe to the server\'s announcement',
			aliases: ['unsub']
		});
	}

	async run(msg) {
		const { announcement } = msg.guild.settings;
		const announcementRole = msg.guild.roles.get(announcement.role);
		if (!announcementRole) return msg.send('Subscriber role is not set in the server!');
		if (!msg.member.roles.has(announcementRole.id)) return msg.send('You are not subscribed!');
		await msg.member.roles.remove(announcementRole).catch(() => { throw 'I am unable to remove the role'; });
		return msg.send('You have successfully unsubscribed to this server\'s announcement. You will now not get notified when an announcement is made!');
	}

}

module.exports = UnsubscribeCommand;
