const { Extendable } = require('klasa');
const { Message } = require('discord.js');

class MessageExtender extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [Message] });
	}

	/**
	 * Get image URL from either message attachment or message content URL.
	 * @since 0.4.0
	 * @returns {URL}
	 */
	getImage() {
		// Regex to capture image files...
		const imgRegex = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|jpeg|webp|gif|png)/i;
		// Getting image URL from the direct attachment to the message...
		if (this.attachments.size && imgRegex.test(this.attachments.first().url)) return imgRegex.exec(this.attachments.first().url)[0];
		// Getting image URL from the message content...
		else if (imgRegex.test(this.content)) return imgRegex.exec(this.content)[0];
		// Oops, there is no image...
		else return null;
	}

	/**
	 * Await for reply from the message author.
	 * @since 0.3.0
	 * @async
	 * @param {string} question The question to be asked
	 * @param {Object} options Customization options
	 * @param {number} [options.time = 30000] Time to wait for reply
	 * @param {Function} [options.filter] Filter function for the awaitMessages
	 * @param {boolean} [options.returnContent = true] Whether to return content of message or not
	 * @returns {Promise<string|false>}
	 */
	async awaitReply(question, options = {}) {
		if (!options.hasOwnProperty('time')) options.time = 30000;
		if (!options.hasOwnProperty('filter')) options.filter = (msg) => msg.author.id === this.author.id;
		if (!options.hasOwnProperty('returnContent')) options.returnContent = true;
		// Sending the question...
		await this.send(question);
		// Awaiting reply from user...
		return this.channel.awaitMessages(options.filter, { max: 1, time: options.time, errors: ['time'] })
			.then(messages => options.returnContent ? messages.first().content : messages.first())
			.catch(() => false);
	}

	/**
	 * Ask yes or not to the message author.
	 * @since 0.3.0
	 * @async
	 * @param {string} question The question to be asked
	 * @param {Object} options Customization options
	 * @param {boolean} [options.reaction = true] Whether to ask using emoji or not
	 * @returns {Promise<boolean>}
	 */
	async ask(question, options = {}) {
		if (!options.hasOwnProperty('reaction')) options.reaction = true;
		// Sending the question...
		const message = await this.send(question);
		// Emoji based yes/no if options has true value and bot has permission...
		if (options.reaction === true && this.channel.permissionsFor(this.guild.me).has('ADD_REACTIONS')) return awaitReaction(message, this.author.id);
		// Text based yes/no otherwise...
		return awaitMessage(message, this.author.id);
	}

}

const awaitReaction = async (msg, userID) => {
	// Yes and No emotes...
	await msg.react('🇾');
	await msg.react('🇳');
	// Result of reaction from user...
	const data = await msg.awaitReactions((rec, user) => user.id === userID && ['🇾', '🇳'].includes(rec.emoji.toString()), { time: 20000, max: 1 });
	// Check to see if user reacted or not...
	if (data.size === 0) throw null;
	// Returning the result...
	return data.firstKey() === '🇾';
};

const awaitMessage = async (msg, userID) => {
	// Yes and No equivalents...
	const yes = ['yes', 'y', 'ye', 'yup', 'yeah', 'yea'];
	const no = ['no', 'n', 'nop', 'nah', 'nope'];
	// Result of message from user...
	const data = await msg.channel.awaitMessages((res) => res.author.id === userID && (yes.includes(res.content.toLowerCase()) || no.includes(res.content.toLowerCase())), { max: 1, time: 20000 });
	// Check to see if user replied or not...
	if (data.size === 0) throw null;
	// Returning the result...
	return yes.includes(data.first().content.toLowerCase());
};

module.exports = MessageExtender;
