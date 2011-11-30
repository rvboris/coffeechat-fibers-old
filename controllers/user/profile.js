var sync = require('sync');

module.exports = function (app) {
    return function(req, res) {
        if (!req.isXMLHttpRequest || req.session.user.id == '0') return res.send(401);

        if (!req.params.name) {
            app.set('log').debug('user name param not found');
            return res.send(404);
        }

        sync(function() {
            var profileUser = app.User.findOne.sync(app.User, { name: req.params.name });
            var me = app.User.findById.sync(app.User, req.session.user.id);

            if (!profileUser || !me) {
                app.set('log').debug('user not found');
                return res.send(404);
            }

            res.send({
                name: profileUser.name,
                pic: profileUser.pic,
                status: profileUser.status,
                gender: profileUser.gender,
                messages: profileUser.stats.messages,
                points: profileUser.points,
                isIgnore: me.ignore.indexOf(profileUser.name) > -1
            });
        }, function(err) {
            if (err) {
                app.set('log').error(err.stack);
                return res.send(500);
            }
        });
    }
};
