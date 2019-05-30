const { Extendable } = require('klasa');
const { GuildMember } = require('discord.js');

class GuildMemberExtender extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [GuildMember] });
	}

	/**
	 * Mute the member.
	 * @since 0.5.0
	 * @param {string} reason Reason for muting the member
	 * @param {Object} options Customization options
	 * @param {Duration} options.time Time to mute the member for
	 * @returns {Promise<GuildMember>}
	 */
	async mute(reason, options = {}) {
		// Getting mute role value from guild settings...
		const _muteRoleID = this.guild.settings.roles.muted;
		// Getting actual mute role from the guild...
		let muteRole = this.guild.roles.get(_muteRoleID);
		// Creating mute role if not setup...
		if (!muteRole) {
			// Creating new role...
			muteRole = await this.guild.roles.create({
				data: {
					name: 'Muted',
					permissions: ['READ_MESSAGES']
				},
				reason: 'Locking bad users from sending messages in text channel.'
			});
			// Updating channel permission for the role in all channels...
			for (const channel of this.guild.channels.values()) {
				await channel.updateOverwrite(muteRole, {
					SEND_MESSAGES: false,
					ADD_REACTION: false,
					CONNECT: false
				}, 'Avoiding bad users from sending messages, adding reactions to message and connecting to voice channel.');
			}
			// Updating mute role value to settings...
			this.guild.settings.update('roles.muted', muteRole);
		}
		// Checking if the member already has the muted role...
		if (this.roles.has(_muteRoleID)) throw `**${this.user.tag}** is already muted!`;
		// Checking if the bot client has enough permissions to mute the member...
		if (muteRole.position > this.guild.me.roles.highest.position) throw `I cannot provide \`${muteRole.name}\` role as it's higher than my role!`;
		// Providing the mute role to member...
		await this.roles.add(muteRole, reason);
		// Creating unmute task if it's timed mute...
		if (options && options.time) await this.client.schedule.create('unmute', options.time, { data: { info: `${this.guild.id}.${this.id}` } });
		// Everything is success...
		return this;
	}

	async unmute(reason) {
		// Getting mute role value from guild settings...
		const _muteRoleID = this.guild.settings.roles.muted;
		// Getting actual mute role from the guild...
		const muteRole = this.guild.roles.get(_muteRoleID);
		// Exiting if muteRole doesn't exists...
		if (!muteRole) return;
		// Checking if user is not muted...
		if (!this.roles.has(_muteRoleID)) throw `**${this.user.tag}** is not muted!`;
		// Checking if the bot client has enough permissions to unmute the member...
		if (muteRole.position > this.guild.me.roles.highest.position) throw `I cannot remove \`${muteRole.name}\` role as it's higher than my role!`;
		// Removing the role...
		await this.roles.remove(muteRole, reason);
		// TO-DO Remove the unmute task if it exists...
	}

}

module.exports = GuildMemberExtender;
