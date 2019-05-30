const { Command } = require('klasa');
const ModLog = require('../../lib/modules/moderation/ModLog');

class MuteCommand extends Command {

	constructor(...args) {
		super(...args, {
			usage: '[When:time] <Member:Member> [String:...reason]',
			usageDelim: ' '
		});
	}

	async run(msg, [when, member, reason = null]) {
		// Checks for non mutable members...
		const { success, unableReason } = this.isMutable(msg.member, member);
		// Sending the failure message if member is not mutable...
		if (!success) throw unableReason;
		// Muting the member...
		await member.mute(reason, { time: when });
		// Generatring modlogs...
		const log = new ModLog(msg.guild)
			.setAction('mute')
			.setModerator(msg.author.id)
			.setReason(reason)
			.setUser(member.id);
		// Adding log details...
		await log.addLogs();
		// Sending confirmation to the user...
		return await msg.sendMessage([
			`**${member.user.tag}** is successfully muted`,
			when ? ` for ${this.client.functions.getDuration(when)}` : '',
			reason ? ` with reason of: ${reason}` : '',
			'!!!'
		].join(''));
	}

	isMutable(muter, memberToMute) {
		// Checking if the user is trying to mute oneself...
		if (muter.id === memberToMute.id) {
			return {
				success: false,
				unableReason: 'Why do you want to mute yourself ??'
			};
		}
		// Checking if the user is trying to mute the bot...
		if (this.client.user.id === memberToMute.id) {
			return {
				success: false,
				unableReason: 'Why do you want to mute me ?? Have I done something wrong ??'
			};
		}
		// Checking if the user can mute the member...
		if (memberToMute.roles.highest.position >= muter.roles.highest.position) {
			return {
				success: false,
				unableReason: 'You do not have enough permission to mute this member!'
			};
		}
		// Checking if the bot can mute the member...
		if (memberToMute.roles.highest.position >= muter.guild.me.roles.highest.position) {
			return {
				success: false,
				unableReason: 'I do not have enough permissions to mute this member!'
			};
		}
		// Member is mutable...
		return { success: true };
	}

}

module.exports = MuteCommand;
