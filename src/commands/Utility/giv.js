const { Command, Usage, TextPrompt, Duration, util: { sleep } } = require('klasa');
const Giveaway = require('../../lib/structures/Giveaway');

class GiveawayCommand extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			description: 'Giveaways are always awesome!',
			usage: '[start|list:default]',
			aliases: ['giveaway'],
			subcommands: true
		});
	}

	async start(msg) {
		await msg.channel.send('Make sure to answer the questions below properly to start the giveaway!');
		await sleep(1000);
		// Usages...
		const durationUsage = new Usage(this.client, '<Duration:duration>')
			.customizeResponse('Duration', 'Please enter the duration for the giveaway in a valid format!\n\nExmple: `1day` or `5hours`, `2d5m`');
		const channelUsage = new Usage(this.client, '<Channel:Channel>')
			.customizeResponse('Channel', 'Please enter the name, id or mention the channel where you want to start the giveaway!');
		const winnerUsage = new Usage(this.client, '<Winners:number>')
			.customizeResponse('Winners', 'Please enter a valid number of winners possible for the giveaway!');
		// prompts...
		const durationPrompt = new TextPrompt(msg, durationUsage, { limit: 3 });
		const channelPrompt = new TextPrompt(msg, channelUsage, { limit: 3 });
		const winnerPrompt = new TextPrompt(msg, winnerUsage, { limit: 3 });
		
		const [duration] = await durationPrompt.run('Please enter the duration for the giveaway.\nExample `1day`, `3hrs`, `30m`m `2d5m`')
			.catch(() => { throw 'Creation of giveaway cancelled dur to lack of response'; });
		const [channel] = await channelPrompt.run('Please enter the name, id or mention the channel where you want to start the giveaway!.\nExample `#giveaway`')
			.catch(() => { throw 'Creation of giveaway cancelled dur to lack of response'; });
		const [winnerCount] = await winnerPrompt.run('Please enter the number of winners fore the giveaway. Example `1`, `5`')
			.catch(() => { throw 'Creation of giveaway cancelled dur to lack of response'; });
			
		const prize = await msg.awaitReply('Please enter the prize of the giveaway. Example `steam-key`, `Limited T-shirt`', { send: false });
		if (!prize) throw 'Creation of giveaway cancelled dur to lack of response';

		const givNew = new Giveaway(this.client).setStartTime(Date.now());
		const confirmed = await msg.ask([
			'Are you sure the details below are correct?',
			' ',
			`\`Duration\`: **${Duration.toNow(duration)}**`,
			`\`Prize\`: **${prize}**`,
			`\`Channel\`: **${channel}**`,
			`\`Possible winner(s)\`: ${winnerCount}`
		].join('\n'), { reaction: false });
		if (!confirmed) return await msg.send('Creation of giveaway cancelled!');
		givNew.setChannel(channel)
			.setDuration(duration.getTime())
			.setGuild(msg.guild.id)
			.setPrize(prize)
			.setWinnerCount(winnerCount)
			.setChannel(channel.id);
		const givMessage = await msg.guild.channels.get(channel.id).send(givNew.buildEmbed());
		await givMessage.react('🎉').catch(() => null);
		givNew.setMessage(givMessage.id);
		await this.client.settings.update('giveaway', givNew.toJSON(), { action: 'add' });
		return await msg.channel.send(`Successfully created giveaway with ID \`${givNew.id}\``);
	}

	async list(msg) {
		const activeGivs = this.client.settings.giveaway.filter(giv => giv.guild === msg.guild.id && !giv.endTimestamp);
		if (activeGivs.length < 1) return await msg.send('There are no active giveaway happening in this server!');
		const givDetails = ['Here is the list of giveaway happening in this server', ''];
		for (let i = 0; i < activeGivs.length; i++) {
			const giv = activeGivs[i];
			givDetails.push(`\`#${i + 1}\` **${giv.prize}**`);
			givDetails.push(`• \`Users Participated\`: ${giv.users.length}`);
			givDetails.push(`• \`Time Remaining\`: ${Duration.toNow(giv.duration)}`);
			givDetails.push(' ');
		}
		return await msg.send(givDetails);
	}

}

module.exports = GiveawayCommand;
