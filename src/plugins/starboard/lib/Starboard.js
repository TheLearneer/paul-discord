const { MessageEmbed } = require('discord.js');

class Starboard {

	/**
	 * Handle reactionAddEvent for starboard.
	 * @since 0.4.0
	 * @async
	 * @param {*} res Reaction object from messageReactionAdd event
	 * @param {*} user User object from messageReactionAdd event
	 */
	static async handleReactionAdd(res, user) {
		// Early check to see if reaction is by bot...
		if (user.bot) {
			// Removing bot's reaction...
			await res.users.remove(user);
			// No need to proceede with further checks...
			return;
		}
		// Fetching the message if it is partial...
		if (res.message.partial) await res.message.fetch();
		// Getting count and message from reaction...
		const { count, message } = res;
		// Getting guild's settings for starboard...
		const { starboard } = message.guild.settings;
		// Exiting if starboard is not enabled...
		if (!starboard.enabled) return;
		// Getting starboard channel...
		const starboardChannel = message.guild.channels.get(starboard.channel);
		// Exiting if starboard channel is not available...
		if (!starboardChannel) return;
		// Exiting if message is from NSFW channel and starboard channel is not NSFW...
		if (message.channel.nsfw && !starboardChannel.nsfw) return;
		// Checking if user starred their own message...
		if (message.author.id === user.id) {
			// Removing the user's reaction...
			await res.users.remove(user);
			// Informing one can't star one's messages...
			if (starboard.noSelfStar) await message.channel.send(`${message.author} You cannot star your own messages!`).then(msg => msg.delete({ timeout: 5000 }));
			// No need to proceeded further so exiting...
			return;
		}
		// Exiting if message doens't have enough stars...
		if (count < starboard.minimumStars) return;
		// Building the starboard embed...
		const embed = Starboard.buildEmbed(message, count);
		// Fetching messages in starboard channel...
		const _fetchedMessages = await starboardChannel.messages.fetch({ limit: 50 });
		// Finding the message in starboard channel for starred message
		const starredMsg = _fetchedMessages.find(msg => msg.embeds[0] && msg.embeds[0].type === 'rich' && msg.embeds[0].footer && msg.embeds[0].footer.text.split('| ')[1] === message.id);
		// Editing the message if it exists...
		if (starredMsg) await starredMsg.edit({ embed });
		// Sending new message if it doesn't exist...
		else await starboardChannel.send({ embed });
		// Everything is processed, time to do a silent exit...
		return;
	}

	/**
	 * Handle reactionRemoveEvent for starboard.
	 * @since 0.4.0
	 * @async
	 * @param {*} res Reaction object from messageReactionRemove event
	 * @param {*} user User object from messageReactionRemove event
	 */
	static async handleReactionRemove(res, user) {
		// Not to proceede with further checks if reaction is by user...
		if (user.bot) return;
		// Fetching the message if it is partial...
		if (res.message.partial) await res.message.fetch();
		// Getting message and reaction count from res...
		const { count, message } = res;
		// Getting guild's settings...
		const { starboard } = message.guild.settings;
		// Checking if starboard is enabled or not...
		if (!starboard.enabled) return;
		// Getting starboard channel...
		const starboardChannel = message.guild.channels.get(starboard.channel);
		// Checking if starboard channel is available...
		if (!starboardChannel) return;
		// Checking NSFW compatibily of message with starboard channel...
		if (message.channel.nsfw && !starboardChannel.nsfw) return;
		// Not to proceede with further checks if reaction is by message author...
		if (message.author.id === user.id) return;
		// Fetching messages in starboard channel...
		const _fetchedMessages = await starboardChannel.messages.fetch({ limit: 50 });
		// Finding the message in starboard channel for starred message
		const starredMsg = _fetchedMessages.find(msg => msg.embeds[0] && msg.embeds[0].type === 'rich' && msg.embeds[0].footer && msg.embeds[0].footer.text.split('| ')[1] === message.id);
		// Exiting if message is not in the hall of fame...
		if (!starredMsg) return;
		// Building the new embed...
		const embed = Starboard.buildEmbed(message, count);
		// Deleting message from starboard if star count goes below minimum required...
		if (count < starboard.minimumStars) await starredMsg.delete();
		// Editing otherwise...
		else await starredMsg.edit({ embed });
		// Everything is processed, time to do a silent exit...
		return;
	}

	/**
	 * Build the embed for starboard channel.
	 * @since 0.4.0
	 * @param {*} message discord.js message instance
	 * @param {number} starCount Number of stars available in the message
	 * @returns {MessageEmbed} Embed ready for starboard channel
	 */
	static buildEmbed(message, starCount) {
		// building embed for embed with various information...
		const embed = new MessageEmbed()
			.setColor('#FFAC33')
			.setDescription(`[► View The Original Message](${message.url})`)
			.addField('Author', `${message.author} \`(${message.author.tag})\``, true)
			.addField('Channel', `${message.channel} \`(${message.channel.name})\``, true)
			.setThumbnail(message.author.displayAvatarURL())
			.setFooter(`${Starboard.getStarEmoji(starCount)} ${starCount} | ${message.id}`)
			.setTimestamp(message.createdAt);
		// Adding the message content as a seperate field if it exists...
		if (message.content) embed.addField('Message', message.content.shorten(1000));
		// Getting image from the message...
		const attachment = message.getImage();
		// Adding image tostarboad embed if any exists...
		if (attachment) embed.setImage(attachment);
		// Returning the embed...
		return embed;
	}

	/**
	 * Get the star emote based on emote count
	 * @since 0.4.0
	 * @param {number} count Star emote count
	 * @returns {string} Emote
	 */
	static getStarEmoji(count) {
		// Various emoji based on star count...
		if (count < 5) return '⭐';
		if (count < 15) return '🌟';
		if (count < 30) return '🌠';
		if (count < 50) return '✨';
		if (count < 75) return '🎆';
		if (count < 100) return '☄';
		return '🌌';
	}

}

module.exports = Starboard;
