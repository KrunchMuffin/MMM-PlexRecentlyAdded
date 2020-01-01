/**
 * MMM-PlexRecentlyAdded node helper
 */
const NodeHelper = require('node_helper');
const request = require('request');

module.exports = NodeHelper.create({
    getRecent: function(config) {
        let req = request.defaults({'agentOptions': {'rejectUnauthorized': false}});
        req.get(`${config.host}/api/v${config.apiVersion}?apikey=${config.apiKey}&cmd=get_recently_added&count=${config.recentCount}`, (err, res, body) => {
            let data = JSON.parse(body);

            if (err || res.statusCode !== 200) {
                data = data.response.message || 'there was an error';
                console.error('MMM-PlexRecentlyAdded: ' + data);
            } else {
                data = data.response.data;
            }

            this.sendSocketNotification('SET_RECENT', data);
            setTimeout(() => { this.getRecent(config) }, config.updateFrequency);
        });
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'GET_RECENT') {
            this.getRecent(payload);
        }
    },
});