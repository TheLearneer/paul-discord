/* eslint-disable no-prototype-builtins */
const { Extendable } = require('klasa');
const { Message } = require('discord.js');

class MessageExtender extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [Message] });
	}

	getImage() {
		const imgRegex = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|jpeg|webp|gif|png)/i;
		if (this.attachments.size && imgRegex.test(this.attachments.first().url)) return imgRegex.exec(this.attachments.first().url)[0];
		else if (imgRegex.test(this.content)) return imgRegex.exec(this.content)[0];
		else return null;
	}

	async awaitReply(question, options = {}) {
		if (!options.hasOwnProperty('time')) options.time = 30000;
		if (!options.hasOwnProperty('filter')) options.filter = (msg) => msg.author.id === this.author.id;
		if (!options.hasOwnProperty('returnContent')) options.returnContent = true;
		if (!options.hasOwnProperty('send')) options.send = true;
		if (options.send) await this.send(question);
		else await this.channel.send(question);
		return this.channel.awaitMessages(options.filter, { max: 1, time: options.time, errors: ['time'] })
			.then(messages => options.returnContent ? messages.first().content : messages.first())
			.catch(() => false);
	}

	async ask(question, options = {}) {
		if (!options.hasOwnProperty('reaction')) options.reaction = true;
		const message = await this.send(question);
		if (options.reaction === true && this.channel.permissionsFor(this.guild.me).has('ADD_REACTIONS')) return awaitReaction(message, this.author.id);
		return awaitMessage(message, this.author.id);
	}

}

const awaitReaction = async (msg, userID) => {
	await msg.react('🇾');
	await msg.react('🇳');
	const data = await msg.awaitReactions((rec, user) => user.id === userID && ['🇾', '🇳'].includes(rec.emoji.toString()), { time: 20000, max: 1 });
	if (data.size === 0) throw null;
	return data.firstKey() === '🇾';
};

const awaitMessage = async (msg, userID) => {
	const yes = ['yes', 'y', 'ye', 'yup', 'yeah', 'yea'];
	const no = ['no', 'n', 'nop', 'nah', 'nope'];
	const data = await msg.channel.awaitMessages((res) => res.author.id === userID && (yes.includes(res.content.toLowerCase()) || no.includes(res.content.toLowerCase())), { max: 1, time: 20000 });
	if (data.size === 0) throw null;
	return yes.includes(data.first().content.toLowerCase());
};

module.exports = MessageExtender;
