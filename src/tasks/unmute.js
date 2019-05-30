const { Task } = require('klasa');

class UnmuteTask extends Task {

	async run({ info }) {
		// Getting guild and member ID's...
		const [guild, member] = info.split('.');
		// Getting the guild...
		const fetchedGuild = this.client.guilds.get(guild);
		// Exiting if bot client is not in guild...
		if (!fetchedGuild) return;
		// Getting the member...
		const fetchedMember = await fetchedGuild.members.fetch(member).catch(() => null);
		// Exiting if member is not in guild...
		if (!fetchedMember) return;
		// Removing muted role from member...
		await fetchedMember.roles.remove(fetchedGuild.settings.roles.muted).catch(() => null);
	}

}

module.exports = UnmuteTask;
