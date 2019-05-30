const { Command } = require('klasa');
const ModLog = require('../../lib/modules/moderation/ModLog');

class BanCommand extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			usage: '<User:User> [days:int{1,7}] [Reason:...String]',
			usageDelim: ' '
		});
	}

	async run(msg, [user, days = 0, reason = null]) {
		// Performing early checks...
		const { success, unableReason } = await this.isBannable(msg, user);
		// Exiting if user is not bannable...
		if (!success) throw unableReason;
		// banning the user...
		await msg.guild.members.ban(user, { reason, days });
		// Generatring modlogs...
		const log = new ModLog(msg.guild)
			.setUser(user.id)
			.setModerator(msg.author.id)
			.setAction('ban')
			.setReason(reason);
		// Adding log details...
		await log.addLogs();
		// Sending confirmation to the user...
		return await msg.send(`**${user.tag}** has been successfully banned${reason ? ` for the reason: ${reason}` : ''}!`);
	}

	async isBannable(msg, user) {
		// Checking if moderator is trying to ban oneself...
		if (user.id === msg.author.id) {
			return {
				success: false,
				unableReason: 'No! No! No! Never do that again!'
			};
		}
		// Checking if moderator is trying to ban bot client...
		if (user.id === this.client.user.id) {
			return {
				success: false,
				unableReason: 'I think you donot need me anymore!'
			};
		}
		// Checking if user is already banned...
		const bannedUsers = await msg.guild.fetchBans();
		if (bannedUsers.has(user.id)) {
			return {
				success: false,
				unableReason: 'This user is already banned!'
			};
		}
		// Getting the member object...
		const memberToBan = msg.guild.members.fetch(user).catch(() => null);
		// Can ban the user if not in guild...
		if (!memberToBan) return { success: true };
		// Checking if bot client is able to ban the member or not...
		if (!memberToBan.bannable) {
			return {
				success: false,
				unableReason: 'I donot have enough permissions to ban this member!'
			};
		}
		// Checking if moderator is able to ban the member or not...
		if (memberToBan.roles.highest.position >= msg.member.roles.highest.position) {
			return {
				success: false,
				unableReason: 'You do not have enough permissions to ban this member!'
			};
		}
		// User is bannable...
		return { success: true };
	}

}

module.exports = BanCommand;
