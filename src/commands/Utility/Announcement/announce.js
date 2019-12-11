const { Command } = require('klasa');

class AnnounceCommand extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			description: 'Make an announcement in the server',
			requiredPermission: ['MANAGE_GUILD'],
			usage: '[Mention:Boolean] <Announcement:...String>',
			usageDelim: ' '
		});
	}

	async run(msg, [mention = true, announcementMsg]) {
		const { announcement } = msg.guild.settings;
		const announcementChannel = msg.guild.channels.get(announcement.channel);
		if (!announcementChannel) return msg.send('Announcement channel is not set!');
		let wasMentionable = true;
		const announcementRole = msg.guild.roles.get(announcement.role);
		if (mention && announcementRole && !announcementRole.mentionable) {
			wasMentionable = false;
			await announcementRole.edit({ mentionable: true }, '[BOT ACTION] Making temporarily mentionable for Announcement!').catch(() => null);
		}
		await announcementChannel.send([
			`:information_source: Announcement by **${msg.author.tag}** :information_source:`,
			'',
			announcementMsg,
			'',
			mention && announcementRole ? `**----->** ${announcementRole} **<-----**` : ''
		].join('\n'));
		if (!wasMentionable && announcementRole.mentionable) {
			await announcementRole.edit({ mentionable: false }, '[BOT ACTION] Reverting mentionability after Announcement!').catch(() => null);
		}
		return msg.send(`Successfully made announcement in ${announcementChannel}`);
	}

}

module.exports = AnnounceCommand;
