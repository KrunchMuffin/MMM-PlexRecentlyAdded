Module.register("MMM-PlexRecentlyAdded", {});
/**
 * MMM-PlexRecentlyAdded
 * PlexRecentlyAdded module for MagicMirror2.
 *
 * @author Derek B <dbinaz@gmail.com>
 * * Orignally taken from Derek Nicol <1420397+derekn@users.noreply.github.com>
 * @license https://opensource.org/licenses/MIT
 */

Module.register('MMM-PlexRecentlyAdded', {
    defaults: {
        host: 'host.com',
        apiKey: 'tautulli API key',
        apiVersion: '2',
        updateFrequency: 15,
        hideOnNoActivity: false,
        animationSpeed: 500,
        recentCount: 3, // how many recently added items to show
        mediaTypeIcons: {
            movie: 'far fa-ticket-alt',
            episode: 'far fa-tv',
            season: 'far fa-tv',
            artist: 'far fa-music',
        }
       // mediaType: 'movie,episode,season' // movie, episode, season, artist
    },

    getStyles: function () {
        return [
            'MMM-PlexRecentlyAdded.css',
        ]
    },

    start: function () {
        Log.info(`Starting module: ${this.name}`);

        this.config.host = this.config.host.trim().replace(/\/$/, '');
        this.config.updateFrequency = this.config.updateFrequency * 60 * 1000;
        this.history_data = null;

        this.sendSocketNotification('GET_RECENT', this.config);
    },

    getDom: function () {
        let wrapper = document.createElement('div');
        wrapper.className = 'medium';

        if (!this.history_data) {
            wrapper.innerHTML = '<span class="loading dimmed">loading&hellip;</span>';
        } else if (typeof this.history_data === 'string') {
            wrapper.innerHTML = `<span class="error">${this.history_data}</span>`;
        } else if (!this.history_data.recently_added.length) {
            if (this.config.hideOnNoActivity && !this.hidden) {
                this.hide();
            }
            wrapper.innerHTML = '<span class="no-activity dimmed">nothing new</span>';
        } else {
            for (const row of this.history_data.recently_added) {
                if (row.media_type === 'episode' || row.media_type === 'movie') {
                    let mediaTitle = '';
                    let imgSrc = '';
                    if (row.media_type === 'episode') {
                        mediaTitle = row.grandparent_title + ': ' + row.full_title + ' (S' + row.parent_media_index + 'E' + row.media_index + ')';
                        imgSrc = this.config.host + '/api/v' + this.config.apiVersion + '?cmd=pms_image_proxy&apikey=' + this.config.apiKey + '&img=' + row.grandparent_thumb + '&width=125&height=125&fallback=poster&refresh=true';
                    } else if (row.media_type === 'movie') {
                        mediaTitle = row.full_title + ' (' + row.year + ')';
                        imgSrc = this.config.host + '/api/v' + this.config.apiVersion + '?cmd=pms_image_proxy&apikey=' + this.config.apiKey + '&img=' + row.thumb + '&width=125&height=125&fallback=poster&refresh=true';
                    }
                    wrapper.innerHTML += `
                        <div class="activity-row" data-user-id="${row.rating_key}">
                          <div class="row">
                            <div class="poster-column-wrapper">
                              <div class="poster-column">
                                <img src="${imgSrc}" alt="${row.full_title}">
                              </div>
                            </div>
                            <div class="column">
                              <div class="info-column">
                                <div class="activity">
                                    <i class="state-icon bright fa ${this.config.mediaTypeIcons[row.media_type || 'far play']}"></i>
                                    <span class="user-name bright">${mediaTitle}</span>
                                </div>
                                <div class="details small">
                                    <span class="duration">Added On: ${moment.unix(row.added_at).format('MMM Do, Y h:mma')} - Length: ${this.convertMS(row.duration)}</span>
                                </div>
                              </div>
                            </div>
                          </div>                        
                        </div>`;
                }
            }
            if (this.hidden) {
                this.show()
            }
        }

        return wrapper;
    },

    getHeader: function () {
        return this.data.header ;
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === 'SET_RECENT') {
            this.history_data = payload;
            this.updateDom(this.config.animationSpeed);
        }
    },

    convertMS: function (ms) {
        let dur = moment.duration(parseInt(ms));

        return `${String(dur._data.hours + 'h ' + dur._data.minutes + 'm')}`;
    },
});
