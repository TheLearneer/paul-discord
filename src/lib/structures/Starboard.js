const { MessageEmbed } = require('discord.js');

class Starboard {

	static async handleReactionAdd(res, user) {
		if (user.bot) {
			await res.users.remove(user);
			return;
		}
		if (res.message.partial) await res.message.fetch();
		const { count, message } = res;
		const { starboard } = message.guild.settings;
		if (!starboard.enabled) return;
		const starboardChannel = message.guild.channels.get(starboard.channel);
		if (!starboardChannel) return;
		if (message.channel.nsfw && !starboardChannel.nsfw) return;
		if (message.author.id === user.id) {
			await res.users.remove(user);
			if (starboard.noSelfStar) await message.channel.send(`${message.author} You cannot star your own messages!`).then(msg => msg.delete({ timeout: 5000 }));
			return;
		}
		if (count < starboard.minimumStars) return;
		const embed = Starboard.buildEmbed(message, count);
		const _fetchedMessages = await starboardChannel.messages.fetch({ limit: 50 });
		const starredMsg = _fetchedMessages.find(msg => msg.embeds[0] && msg.embeds[0].type === 'rich' && msg.embeds[0].footer && msg.embeds[0].footer.text.split('| ')[1] === message.id);
		if (starredMsg) await starredMsg.edit({ embed });
		else await starboardChannel.send({ embed });
		return;
	}

	static async handleReactionRemove(res, user) {
		if (user.bot) return;
		if (res.message.partial) await res.message.fetch();
		const { count, message } = res;
		const { starboard } = message.guild.settings;
		if (!starboard.enabled) return;
		const starboardChannel = message.guild.channels.get(starboard.channel);
		if (!starboardChannel) return;
		if (message.channel.nsfw && !starboardChannel.nsfw) return;
		if (message.author.id === user.id) return;
		const _fetchedMessages = await starboardChannel.messages.fetch({ limit: 50 });
		const starredMsg = _fetchedMessages.find(msg => msg.embeds[0] && msg.embeds[0].type === 'rich' && msg.embeds[0].footer && msg.embeds[0].footer.text.split('| ')[1] === message.id);
		if (!starredMsg) return;
		const embed = Starboard.buildEmbed(message, count);
		if (count < starboard.minimumStars) await starredMsg.delete();
		else await starredMsg.edit({ embed });
		return;
	}

	static buildEmbed(message, starCount) {
		const embed = new MessageEmbed()
			.setColor('#FFAC33')
			.setDescription(`[► View The Original Message](${message.url})`)
			.addField('Author', `${message.author} \`(${message.author.tag})\``, true)
			.addField('Channel', `${message.channel} \`(${message.channel.name})\``, true)
			.setThumbnail(message.author.displayAvatarURL())
			.setFooter(`${Starboard.getStarEmoji(starCount)} ${starCount} | ${message.id}`)
			.setTimestamp(message.createdAt);
		if (message.content) embed.addField('Message', message.content.shorten(1000));
		const attachment = message.getImage();
		if (attachment) embed.setImage(attachment);
		return embed;
	}

	static getStarEmoji(count) {
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
