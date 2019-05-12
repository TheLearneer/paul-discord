const { BaseCluster } = require('kurasuta');
const { keys } = require('../config');

class Cluster extends BaseCluster {

	launch() {
		this.client.login(keys.token);
	}

}

module.exports = Cluster;
