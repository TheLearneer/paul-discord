const { Command } = require('klasa');
const ModLog = require('../../lib/modules/moderation/ModLog');

class KickCommand extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			usage: '<Member:Member> [Reason:...String]',
			usageDelim: ' '
		});
	}

	async run(msg, [member, reason = null]) {
		// Performing early checks...
		const { success, unableReason } = this.isKickable(msg, member);
		// Exiting if member is not kickable...
		if (!success) throw unableReason;
		// Kicking the member...
		await member.kick(reason);
		// Generatring modlogs...
		const log = new ModLog(msg.guild)
			.setUser(member.id)
			.setModerator(msg.author.id)
			.setAction('kick')
			.setReason(reason);
		// Adding log details...
		await log.addLogs();
		// Sending confirmation to the user...
		return await msg.send(`**${member.user.tag}** has been successfully kicked${reason ? ` for the reason: ${reason}` : ''}!`);
	}

	isKickable(msg, memberToKick) {
		// Checking if user is trying to kick oneself...
		if (msg.author.id === memberToKick.id) {
			return {
				success: false,
				unableReason: 'No! No! No! Never do that again!'
			};
		}
		// Checking if user is trying to kick the bot client...
		if (memberToKick.user.id === this.client.user.id) {
			return {
				success: false,
				unableReason: 'You are hurting my feelings!'
			};
		}
		// Checking if the member is kickable...
		if (!memberToKick.kickable) {
			return {
				success: false,
				unableReason: 'I donot have enough permissions to kick this member!'
			};
		}
		// Checking if the moderator has enough permissions to kick the member...
		if (memberToKick.roles.highest.position >= msg.member.roles.highest.position) {
			return {
				success: false,
				unableReason: 'You do not have enough permissions to kick this member!'
			};
		}
		// Member is kickable...
		return { success: true };
	}

}

module.exports = KickCommand;
