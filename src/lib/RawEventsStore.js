const { Store, Piece } = require('klasa');

class RawEventStore extends Store {

	constructor(client) {
		super(client, 'rawEvents', Piece);
	}

}

module.exports = RawEventStore;
