var sync = require('sync');

module.exports = function(app) {
    return function(req, res) {
        if (!req.isXMLHttpRequest) return res.send(401);

        if (!req.params.channel) {
            app.set('log').debug('channel param not found');
            return res.send(404);
        }

        sync(function() {
            var query = app.Message.find({ channelId: req.params.channel }).limit(15).sort('time', -1);
            var messages = query.execFind.sync(query);
            if (!messages) return;

            for (var i = 0, messageList = []; i < messages.length; i++) {
                var user = app.User.findById.sync(app.User, messages[i].userId.toHexString());
                var archive = typeof app.set('users')[user.name] !== 'undefined';
                messageList.push({
                    name   : archive ? '$ Архив' : user.name,
                    time   : messages[i].time,
                    text   : messages[i].text,
                    archive: archive
                });
            }

            return messageList;
        }, function(err, messageList) {
            if (err) {
                app.set('log').error(err.stack);
                return res.send(500);
            }

            if (messageList) return res.send(messageList);

            res.send(200);
        });
    }
};
