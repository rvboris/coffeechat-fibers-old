var sync = require('sync');

module.exports = function (app) {
    var name = 'collector';

    return {
        name: name,
        interval: 10, // 10 seconds
        callback: function (recipient, stop, interval) {
            app.set('log').debug('find outdated subscriptions');

            sync(function () {
                if (app.Subscription.count.sync(app.Subscription, {}) === 0) return stop();

                var subscriptions = app.Subscription.find.sync(app.Subscription, {
                    time: { $lt: new Date(new Date().getTime() - ((interval) * 1000) * 2) }
                });

                if (!subscriptions || subscriptions.length === 0) return;

                app.set('log').debug('%s results found outdated subscriptions', subscriptions.length);

                var subscriptionsChannels = [];
                var subscriptionsCount = [];
                var usersChannels = [];
                var commands = [];

                for (var i = 0; i < subscriptions.length; i++) {
                    var user = app.User.findById.sync(app.User, subscriptions[i].userId.toHexString());

                    if (!usersChannels[subscriptions[i].channelId]) {
                        usersChannels[subscriptions[i].channelId] = [];
                    }

                    if (!user.isSystem()) {
                        usersChannels[subscriptions[i].channelId].push({ name: user.name });
                    }

                    subscriptionsChannels.push(subscriptions[i].channelId.toHexString());

                    if (!subscriptionsCount[subscriptions[i].channelId]) {
                        subscriptionsCount[subscriptions[i].channelId] = app.Subscription.count.sync(app.Subscription, {
                            channelId: subscriptions[i].channelId
                        });
                    }

                    recipient.event('system', 'userUnsubscribe', user.id, subscriptions[i].id);
                }

                subscriptionsChannels = app.set('helpers').channel.group(subscriptionsChannels);

                for (i = 0; i < subscriptionsChannels.length; i++) {
                    commands.push({
                        channel: '/channel/' + subscriptionsChannels[i].id + '/users',
                        data: {
                            action: 'dis',
                            users: usersChannels[subscriptionsChannels[i].id]
                        }
                    });

                    if (app.Channel.findById.sync(app.Channel, subscriptionsChannels[i].id, 'hidden').hidden) {
                        subscriptionsChannels = subscriptionsChannels.splice(i, 1);
                        continue;
                    }

                    subscriptionsChannels[i].diff *= -1;
                    subscriptionsChannels[i].count = subscriptionsCount[subscriptionsChannels[i].id] + subscriptionsChannels[i].diff;

                    app.set('log').debug('%s users unsubscribed', usersChannels[subscriptionsChannels[i].id].length);
                }

                recipient.publishBulk(commands, {
                    channel: '/channel-list',
                    data: {
                        action: 'upd',
                        channels: subscriptionsChannels
                    }
                });

                app.set('log').debug('%s channels in list updated', subscriptionsChannels.length);
            }, function (err) {
                if (!err) return;

                app.set('log').error(err.stack);
                stop();
            });
        },
        syncObject: {
            start: function (recipient) {
                app.set('tasks')[name].start(recipient);
            }
        }
    };
};