const { Command } = require('klasa');

class SubscribeCommand extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			description: 'Subscribe to the server\'s announcement',
			aliases: ['sub']
		});
	}

	async run(msg) {
		const { announcement } = msg.guild.settings;
		const announcementRole = msg.guild.roles.get(announcement.role);
		if (!announcementRole) return msg.send('Subscriber role is not set in the server!');
		if (msg.member.roles.has(announcementRole.id)) return msg.send('You are already subscribed!');
		await msg.member.roles.add(announcementRole).catch(() => { throw 'I am unable to add the role'; });
		return msg.send('You have successfully subscribed to this server\'s announcement. You will get notified when a new announcement is made!');
	}

}

module.exports = SubscribeCommand;
