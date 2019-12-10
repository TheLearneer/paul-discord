const { MessageEmbed } = require('discord.js');
const { ScheduledTask, Duration } = require('klasa');

class Giveaway {

	constructor(client) {
		Object.defineProperty(this, 'client', { value: client });
		this.id = ScheduledTask._generateID(client);
		this.guild = null;
		this.channel = null;
		this.message = null;
		this.duration = null;
		this.prize = null;
		this.users = [];
		this.winners = [];
		this.winnerCount = 1;
		this.startTimestamp = null;
		this.endTimestamp = null;
	}

	setPrize(prize) {
		this.prize = prize;
		return this;
	}

	setWinnerCount(winnerCount) {
		this.winnerCount = winnerCount;
		return this;
	}

	setChannel(channelID) {
		this.channel = channelID;
		return this;
	}

	setDuration(duration) {
		this.duration = duration;
		return this;
	}

	setMessage(messageID) {
		this.message = messageID;
		return this;
	}

	setGuild(guildID) {
		this.guild = guildID;
		return this;
	}

	setStartTime(time) {
		this.startTimestamp = time;
		return this;
	}

	setEndTime() {
		this.endTimestamp = Date.now();
		return this;
	}

	setID() {
		this.id = ScheduledTask._generateID(this.client);
		return this;
	}

	toJSON() {
		return {
			id: this.id,
			guild: this.guild,
			channel: this.channel,
			message: this.message,
			duration: this.duration,
			prize: this.prize,
			users: this.users,
			winners: this.winners,
			winnerCount: this.winnerCount,
			startTimestamp: this.startTimestamp,
			endTimestamp: this.endTimestamp
		};
	}

	load(giv) {
		this.id = giv.id;
		this.guild = giv.guild;
		this.channel = giv.channel;
		this.message = giv.message;
		this.duration = giv.duration;
		this.prize = giv.prize;
		this.users = giv.users;
		this.winners = giv.winners;
		this.winnerCount = giv.winnerCount;
		this.startTimestamp = giv.startTimestamp;
		this.endTimestamp = giv.endTimestamp;

		return this;
	}

	buildEmbed() {
		return new MessageEmbed()
			.setColor('RANDOM')
			.setTitle(`Giveaway #${this.id}`)
			.setDescription([
				'React with :tada: to participate in this giveaway.',
				'',
				`Prize: **${this.prize}**`
			])
			.addField('Time Remaining', Duration.toNow(this.startTimestamp + this.duration));
	}

	buildEmbedEnd() {
		const winnerList = this.winners.length ? this.winners.map(win => this.client.users.get(win)) : [];

		return new MessageEmbed()
			.setColor('RANDOM')
			.setTitle(`Giveaway #${this.id}`)
			.setDescription('Giveaway has successfully ended! Congratulations to the winner(s)..')
			.addField('Winner(s)', winnerList.length ?
				winnerList.map(win => `**${win.tag}** (\`${win.id}\`)`).join(', ') :
				'No one participated in the giveaway!')
			.setTimestamp();
	}

	async drawWinners() {
		if (this.users.length < 1) return { success: false, reason: 'No one participated in the giveaway!' };
		const { settings } = this.client;
		const guild = this.client.guilds.get(this.guild);
		let remainingUsers = [];
		const givIndex = settings.giveaway.findIndex(giv => giv.id === this.id);
		for (const _user of this.users) remainingUsers.push(_user);
		while (this.winners.length < this.winnerCount) {
			if (remainingUsers.length < 1) break;
			const winner = remainingUsers[Math.floor(Math.random() * remainingUsers.length)];
			if (guild.members.has(winner)) this.winners.push(winner);
			remainingUsers = remainingUsers.filter(rem => rem !== winner);
		}
		this.endTimestamp = Date.now();
		await settings.update('giveaway', this.toJSON(), { arrayPosition: givIndex });
		return { success: true };
	}

	async rerollWinners(userToReroll) {
		if (this.users.length < 1) return { success: false, reason: 'No one participated in the giveaway!' };
		const { settings } = this.client;
		const guild = this.client.guilds.get(this.guild);
		if (userToReroll && !this.winners.includes(userToReroll)) return { success: false, reason: 'User is not a winner!' };
		let remainingUsers = [];
		const givIndex = settings.giveaway.findIndex(giv => giv.id === this.id);
		for (const user of this.users) {
			if (!userToReroll && !this.winners.includes(user)) remainingUsers.push(user);
			if (userToReroll && user !== userToReroll) remainingUsers.push(user);
		}
		if (remainingUsers.length < 1) return { success: false, reason: 'No more participants available!' };
		if (userToReroll) this.winners = this.winners.filter(win => win !== userToReroll);
		else this.winners = [];
		while (this.winners.length < this.winnerCount) {
			if (remainingUsers.length < 1) break;
			const winner = remainingUsers[Math.floor(Math.random() * remainingUsers.length)];
			if (guild.members.has(winner)) this.winners.push(winner);
			remainingUsers = remainingUsers.filter(rem => rem !== winner);
		}
		this.endTimestamp = Date.now();
		await settings.update('giveaway', this.toJSON(), { arrayPosition: givIndex });
		return { success: true };
	}

	async handleTask() {
		const guild = this.client.guilds.get(this.guild);
		if (!guild) return;
		const channel = guild.channels.get(this.channel);
		if (!channel) {
			await this.removeGiveaway();
			return;
		}
		const givMsg = await channel.messages.fetch(this.message).catch(() => null);
		if (!givMsg) {
			await this.removeGiveaway();
			return;
		}
		if (!this.endTimestamp && Date.now() < this.startTimestamp + this.duration) {
			const newEmbed = this.buildEmbed();
			if (givMsg.embeds[0].fields[0].value !== newEmbed.fields[0].value) await givMsg.edit(newEmbed).catch(() => null);
			return;
		}
		if (!this.endTimestamp && Date.now() >= this.startTimestamp + this.duration) {
			await this.drawWinners();
			const embedFinal = this.buildEmbedEnd();
			await givMsg.edit(embedFinal).catch(() => null);
			return;
		}
		if (this.endTimestamp && Date.now() > this.endTimestamp + (1000 * 60 * 60 * 48)) {
			await this.removeGiveaway();
			return;
		}
	}

	removeGiveaway() {
		const givObject = this.client.settings.giveaway.find(giv => giv.id === this.id);
		this.client.settings.update('giveaway', givObject, { action: 'remove' });
	}

	static async handleReactionAdd(res, user) {
		if (user.bot) return;
		const { message } = res;
		const { settings } = message.client;
		const giveaway = settings.giveaway.find(giv => giv.message === message.id);
		if (!giveaway) return;
		if (giveaway.endTimestamp) return;
		if (giveaway.users.includes(user.id)) return;
		const givIndex = settings.giveaway.findIndex(giv => giv === giveaway);
		giveaway.users.push(user.id);
		await settings.update('giveaway', giveaway, { arrayPosition: givIndex });
	}

	static async handleReactionRemove(res, user) {
		if (user.bot) return;
		const { message } = res;
		const { settings } = message.client;
		const giveaway = settings.giveaway.find(giv => giv.message === message.id);
		if (!giveaway) return;
		if (!giveaway.users.includes(user.id)) return;
		const givIndex = settings.giveaway.findIndex(giv => giv === giveaway);
		await settings.update('giveaway', giveaway, { arrayPosition: givIndex });
	}

}

module.exports = Giveaway;
