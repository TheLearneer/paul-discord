const { MessageEmbed } = require('discord.js');

/**
 * Modlog creator and handler for guilds.
 */
class ModLog {

	/**
	 * Create a new ModLog instance
	 * @since 0.5.0
	 * @param {*} guild discord.js Guild instance
	 */
	constructor(guild) {
		Object.defineProperty(this, 'guild', { value: guild });
		Object.defineProperty(this, 'client', { value: guild.client });

		/**
		 * ID of the user who is being moderated
		 * @since 0.5.0
		 * @type {string}
		 */
		this.user = null;

		/**
		 * ID of the moderator who performed the action
		 * @since 0.5.0
		 * @type {string}
		 */
		this.moderator = null;

		/**
		 * Action that is performed on the user
		 * @since 0.5.0
		 * @type {"kick"|"ban"|"unban"|"mute"|"unmute"|"warn"|"softban"|"dehoist"}
		 */
		this.action = null;

		/**
		 * Reason for performing the action
		 * @since 0.5.0
		 * @type {string}
		 */
		this.reason = null;

		/**
		 * Case number of the ModLog.
		 * @since 0.5.0
		 * @type {number}
		 */
		this.case = this.guild.settings.modlogs.data.length + 1;
	}

	/**
	 * Set the user who is being moderated
	 * @since 0.5.0
	 * @param {string} userID ID of the user
	 * @returns {ModLog}
	 */
	setUser(userID) {
		this.user = userID;
		return this;
	}

	/**
	 * Set the moderator who is performing the actions
	 * @since 0.5.0
	 * @param {string} moderatorID ID of the moderator
	 * @returns {ModLog}
	 */
	setModerator(moderatorID) {
		this.moderator = moderatorID;
		return this;
	}

	/**
	 * Set the action for the modlog
	 * @since 0.5.0
	 * @param {"kick"|"ban"|"unban"|"mute"|"unmute"|"warn"|"softban"|"dehoist"} action The action performed
	 * @returns {ModLog}
	 */
	setAction(action) {
		this.action = action;
		return this;
	}

	/**
	 * The reason for the modlog
	 * @since 0.5.0
	 * @param {string} reason reason for the action
	 * @returns {ModLog}
	 */
	setReason(reason) {
		this.reason = reason;
		return this;
	}

	/**
	 * Add the logs to the modLog channel and the DB
	 * @since 0.5.0
	 */
	async addLogs() {
		// Building the logs...
		const modLogEmbed = await this._buildEmbed();
		// Getting the guild's settings...
		const { settings } = this.guild;
		// Getting the modLog channel for the guild...
		const modLogChannel = this.guild.channels.get(settings.channels.modlogs);
		// Not to add the logs if channel is not available...
		if (!modLogChannel) return;
		// Sending the modLog to the modLogChannel...
		await modLogChannel.send(modLogEmbed);
		// Adding the ModLog detail to DB as well...
		await settings.update('modlogs.data', this.data, { action: 'add' });
	}

	/**
	 * Update the reason for a modlog case.
	 * @since 0.5.0
	 * @param {string} newReason New reason for the mod case
	 */
	async updateReason(newReason) {
		// Getting the guild's settings...
		const { settings } = this.guild;
		// Getting all the log details...
		const logsAll = settings.modlogs.data;
		// Getting current log details...
		const logIndex = logsAll.findIndex(log => log.case === this.case);
		// Checking if user is providing same reason again...
		if (newReason === this.reason) throw 'Please think something new!';
		// Updating the reason in the object for Embed as well...
		this.setReason(newReason);
		// Getting the modLog channel for the guild...
		const modLogChannel = this.guild.channels.get(settings.channels.modlogs);
		// Not to add the logs if channel is not available...
		if (!modLogChannel) return;
		// Getting the update log embed...
		const modLogEmbed = await this._buildEmbed();
		// Fetching message for the current case number...
		const messages = await modLogChannel.messages.fetch({ limit: 100 });
		const message = messages.find(mes => mes.author.id === this.client.user.id &&
			mes.embeds.length > 0 &&
			mes.embeds[0].type === 'rich' &&
			mes.embeds[0].footer && mes.embeds[0].footer.text === `Case #${this.case}`
		);
		// If message with case details embed exists, editing it...
		if (message) await message.edit(modLogEmbed);
		// Else sending new embed with case details to the modLog channel...
		else await modLogChannel.send(modLogEmbed);
		// Updating the logs (Also Safety checks)...
		if (logIndex !== -1) await settings.update('modlogs.data', this.data, { arrayPosition: logIndex });
	}

	/**
	 * Load the ModLog detail for provided case number
	 * @since 0.5.0
	 * @param {number} caseNo The case number to join
	 * @returns {ModLog}
	 */
	load(caseNo) {
		// Early check to see if a valid number is provided or not...
		if (isNaN(caseNo) || caseNo < 1) throw 'Please provide a valid case number!';
		// Finding the ModLog in DB with provided caseNo...
		const modLogData = this.guild.settings.modlogs.data.find(log => log.case === caseNo);
		// Checking if modLogData exists...
		if (!modLogData) throw `No ModLog with case number \`${caseNo}\` exists in this guild!`;
		// Loading the ModLog data with data found...
		this.case = modLogData.case;
		this.moderator = modLogData.moderator;
		this.user = modLogData.user;
		this.reason = modLogData.reason;
		this.action = modLogData.action;
		// Chainable...
		return this;
	}

	/**
	 * Build the embed with the ModLog details
	 * @since 0.5.0
	 * @returns {Promise<MessageEmbed>}
	 */
	async _buildEmbed() {
		// Getting the moderator...
		const moderator = await this.client.users.fetch(this.moderator);
		// Getting the user...
		const user = await this.client.users.fetch(this.user);

		return new MessageEmbed()
			.setAuthor(moderator.tag, moderator.displayAvatarURL())
			.setDescription([
				`_User_: **${user.tag} \`(${user.id})\`**`,
				`_Moderator_: **${moderator.tag}**`,
				`_Action_: **${this.action}**`
			].join('\n'))
			.addField('Reason', this.reason)
			.setFooter(`Case #${this.case}`)
			.setColor(this.color)
			.setTimestamp();
	}

	get color() {
		switch (this.action.toLowerCase()) {
			case 'kick': return 16729088;
			case 'ban': return 16711680;
			default: return 6710886;
		}
	}

	/**
	 * @typedef {Object} ModLogJSON
	 * @property {string} user ID of the user being moderatred
	 * @property {string} moderator ID of the moderator performing the action
	 * @property {string} reason The reason for performing the action
	 * @property {string} action The action performed
	 */

	/**
	 * Get the JSON data of the ModLog ready to be saved in DB
	 * @since 0.5.0
	 * @returns {ModLogJSON}
	 */
	get data() {
		return {
			user: this.user,
			moderator: this.moderator,
			reason: this.reason,
			action: this.action,
			case: this.case
		};
	}

}

module.exports = ModLog;
