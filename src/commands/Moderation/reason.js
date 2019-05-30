const { Command } = require('klasa');
const ModLog = require('../../lib/modules/moderation/ModLog');

class ReasonCommandModeration extends Command {

	constructor(...args) {
		super(...args, {
			name: 'reason',
			runIn: ['text'],
			usage: '<case:integer> <reason:...string>',
			usageDelim: ' '
		});
	}

	async run(msg, [caseNo, reason]) {
		// Creating modLog object...
		const logDetail = new ModLog(msg.guild).load(caseNo);
		// Updating modLog reason...
		await logDetail.updateReason(reason);
		// Sending command success details to the user...
		return msg.send(`Successfully updated reason for modLog Case \`${caseNo}\` to ${logDetail.reason}.`);
	}

}

module.exports = ReasonCommandModeration;
