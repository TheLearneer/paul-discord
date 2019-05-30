const { Command } = require('klasa');

class CaseCommandModeration extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			usage: '<Case:Integer>',
			aliases: ['case-details']
		});
	}

	async run(msg, [caseNo]) {
		// Fetching the case details...
		const { success, error, details } = this.fetchCaseDetails(msg, caseNo);
		// Sending the failure message if fetching case deails fails...
		if (!success) throw error;
		// Getting user and moderator information...
		const [user, moderator] = await Promise.all([this.client.users.fetch(details.user), this.client.users.fetch(details.moderator)]);
		// Sending the formatted case details...
		return await msg.sendMessage([
			`**Case ${details.case}** - \`${details.action.toUpperCase()}\``,
			'',
			`**Reason**: ${details.reason}`,
			'',
			`**User**: ${user.tag} \`(${user.id})\``,
			`**Moderator**: ${moderator.tag}`
		]);
	}

	fetchCaseDetails(msg, caseNo) {
		// Getting guild settings...
		const { modlogs: { enabled, data } } = msg.guild.settings;
		// Checking if modLogs is enabled...
		if (!enabled) return { success: false, error: 'This guild has modLogs disabled!' };
		// Checking if provided caseNo is a valid one...
		if (caseNo < 1 || caseNo > data.length) return { success: false, error: 'Invalid Case number!' };
		// Returning the case details...
		return { success: true, details: data.find(modLog => modLog.case === caseNo) };
	}

}

module.exports = CaseCommandModeration;
