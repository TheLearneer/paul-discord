const { MessageEmbed } = require('discord.js');

/**
 * Handle reactionAddEvent for starboard.
 * @since 0.4.0
 * @async
 * @param {*} res Reaction object from messageReactionAdd event
 * @param {*} user User object from messageReactionAdd event
 */
async function handleReactionAdd(res, user) {
	// Early check to see if reaction is by bot...
	if (user.bot) {
		// Removing bot's reaction...
		await res.users.remove(user);
		// No need to proceede with further checks...
		return;
	}
	// Getting message and reaction count from res...
	const { count, message } = res;
	// Getting guild's settings...
	const { settings } = message.guild;
	// Checking if starboard is enabled or not...
	if (!settings.starboard.enabled) return;
	// Getting starboard channel...
	const starboardChannel = message.guild.channels.get(settings.channels.starboard);
	// Checking if starboard channel is available...
	if (!starboardChannel) return;
	// Checking NSFW compatibily of message with starboard channel...
	if (message.channel.nsfw && !starboardChannel.nsfw) return;
	// Checking if user is trying to star own messages...
	if (message.author.id === user.id) {
		// Removing user's reaction...
		await res.users.remove(user);
		// Warning user not to star own message if setting is enabled in server...
		if (settings.starboard.noSelfStar) await message.channel.send(`${message.author} You cannot star your own messages!`).then(msg => msg.delete({ timeout: 5000 }));
		// No need to proceeded with further checks...
		return;
	}
	// Checking if message has enough stars for starboard...
	if (count < settings.starboard.minimumCount) return;
	// Getting the embed...
	const embed = buildEmbed(message, count);
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
async function handleReactionRemove(res, user) {
	// Not to proceede with further checks if reaction is by user...
	if (user.bot) return;
	// Getting message and reaction count from res...
	const { count, message } = res;
	// Getting guild's settings...
	const { settings } = message.guild;
	// Checking if starboard is enabled or not...
	if (!settings.starboard.enabled) return;
	// Getting starboard channel...
	const starboardChannel = message.guild.channels.get(settings.channels.starboard);
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
	const embed = buildEmbed(message, count);
	// Deleting message from starboard if star count goes below minimum required...
	if (count < settings.starboard.minimumCount) await starredMsg.delete();
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
function buildEmbed(message, starCount) {
	// building embed for embed with various information...
	const embed = new MessageEmbed()
		.setColor('#FFAC33')
		.setDescription(`[► View The Original Message](${message.url})`)
		.addField('Author', `${message.author} \`(${message.author.tag})\``, true)
		.addField('Channel', `${message.channel} \`(${message.channel.name})\``, true)
		.setThumbnail(message.author.displayAvatarURL())
		.setFooter(`${getStar(starCount)} ${starCount} | ${message.id}`)
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
function getStar(count) {
	// Various emoji based on star count...
	if (count < 5) return '⭐';
	if (count < 15) return '🌟';
	if (count < 30) return '🌠';
	if (count < 50) return '✨';
	if (count < 75) return '🎆';
	if (count < 100) return '☄';
	return '🌌';
}


module.exports = { handleReactionAdd, handleReactionRemove };
