var sync = require('sync');

module.exports = function (app) {
    return function (req, res) {
        sync(function () {
            var user = req.session.user.id != '0' ? app.User.findById.sync(app.User, req.session.user.id) : req.session.user;
            if (!user) {
                app.set('log').debug('user not found');
                return res.send(401);
            }

            res.render(req.mobile ? 'mobile' : 'web', {
                user: app.set('helpers').user.createPrivate(user),
                channels: {
                    main: { id: app.set('mainChannel').id, name: app.set('mainChannel').name }
                },
                serverKey: app.set('serverKey'),
                title: app.set('mainChannel').name,
                env: app.set('argv').env,
                errors: null
            });
        }, function(err) {
            if (err) {
                app.set('log').error(err.stack);
                return res.send(500);
            }
        });
    }
};
