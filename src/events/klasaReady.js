const { Event } = require('klasa');

class KlasaReadyEvent extends Event {

	async run() {
		const { tasks } = this.client.schedule;
		if (!tasks.some(task => task.taskName === 'giveaway')) {
			await this.client.schedule.create('giveaway', '*/5 * * * *');
		}
	}

}

module.exports = KlasaReadyEvent;
