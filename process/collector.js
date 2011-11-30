var sync = require('sync');

module.exports = function (app) {
    var recipient;
    var run = false;
    var cycle;

    function stop() {
        app.set('log').debug('collector stop');
        clearInterval(cycle);
        run = false;
    }

    return function (client, timeout) {
        recipient = client;

        if (run) return;
        run = true;

        app.set('log').debug('collector start');

        cycle = setInterval(function () {
            app.set('log').debug('find outdated subscriptions');

            sync(function () {
                if (app.Subscription.count.sync(app.Subscription, {}) == 0) return stop();

                var subscriptions = app.Subscription.find.sync(app.Subscription, {
                    time: { $lt: new Date(new Date().getTime() - ((timeout) * 1000) * 2) }
                });

                if (!subscriptions || subscriptions.length == 0) return;

                app.set('log').debug(subscriptions.length + ' results found outdated subscriptions');

                var subscriptionsChannels = [];
                var subscriptionsCount = [];
                var usersChannels = [];

                for (var i = 0; i < subscriptions.length; i++) {
                    var user = app.User.findById.sync(app.User, subscriptions[i].userId.toHexString());

                    if (!usersChannels[subscriptions[i].channelId]) {
                        usersChannels[subscriptions[i].channelId] = [];
                    }

                    usersChannels[subscriptions[i].channelId].push({ name: user.name });
                    subscriptionsChannels.push(subscriptions[i].channelId.toHexString());

                    if (!subscriptionsCount[subscriptions[i].channelId]) {
                        subscriptionsCount[subscriptions[i].channelId] = app.Subscription.count.sync(app.Subscription, { channelId: subscriptions[i].channelId });
                    }

                    recipient.event('userUnsubscribe', user.id, subscriptions[i].id, i);
                }

                subscriptionsChannels = app.set('helpers').channel.group(subscriptionsChannels);

                for (i = 0; i < subscriptionsChannels.length; i++) {
                    (function (i) {
                        setTimeout(function () {
                            recipient.publish('/channel/' + subscriptionsChannels[i].id + '/users', {
                                action: 'dis',
                                users: usersChannels[subscriptionsChannels[i].id]
                            });

                            app.set('log').debug(usersChannels[subscriptionsChannels[i].id].length + ' users in list updated');
                        }, 100 + (50 * i));
                    })(i);

                    subscriptionsChannels[i].diff *= -1;
                    subscriptionsChannels[i].count = subscriptionsCount[subscriptionsChannels[i].id] + subscriptionsChannels[i].diff;

                    app.set('log').debug(usersChannels[subscriptionsChannels[i].id].length + ' users unsubscribed');
                }

                recipient.publish('/channel-list', {
                    action: 'upd',
                    channels: subscriptionsChannels
                });

                app.set('log').debug(subscriptionsChannels.length + ' channel in list updated');
            }, function (err) {
                if (err) {
                    app.set('log').error(err.stack);
                    return stop();
                }
            });
        }, timeout * 1000);
    };
};