const { Task } = require('klasa');
const GiveawayHandler = require('../lib/structures/Giveaway');

class GiveawayTask extends Task {

	async run() {
		for (const giv of this.client.settings.giveaway) {
			const Giveaway = new GiveawayHandler(this.client).load(giv);
			await Giveaway.handleTask();
		}
	}

}

module.exports = GiveawayTask;
