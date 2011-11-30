var sync = require('sync');

module.exports = function(app) {
    return {
        session: function(req, res, next) {
            if (req.session.user && req.session.user.id != '0') {
                sync(function() {
                    var user = app.User.findById.sync(app.User, req.session.user.id);
                    return user ? user.id : '0';
                }, function(err, id) {
                    if (err) {
                        app.set('log').error(err.stack);
                        return next();
                    }
                    req.session.user = { id: id };
                    app.set('log').debug('login through the session');
                    next();
                });
            } else {
                req.session.user = { id: '0' };
                app.set('log').debug('login through the session');
                next();
            }
        },
        createPublic: function(user) {
            return {
                name: user.name,
                gender: user.gender,
                status: user.status
            };
        },
        createPrivate: function(user) {
            return {
                id: user.id,
                pic: user.pic,
                name: user.name,
                email: user.email,
                gender: user.gender,
                status: user.status,
                ignore: user.ignore,
                settings: user.settings
            };
        }
    };
};