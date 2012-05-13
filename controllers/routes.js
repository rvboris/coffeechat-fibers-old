module.exports = function (app) {
    app.use(app.router);

    app.use(function (req, res) {
        res.send(404);
    });

    app.use(function (err, req, res, next) {
        app.set('log').critical(err.stack);
        res.send(500);
    });

    // Filter static content
    if (app.set('argv').env === 'production') {
        var httpProxy = require('http-proxy');
        var proxy = new httpProxy.RoutingProxy();

        app.get(/\.[js|css|gif|png|jpg|mp3|ogg|eot|svg|ttf|woff|swf|ico]+$/, function (req, res) {
            proxy.proxyRequest(req, res, {
                host: '127.0.0.1',
                port: 4000
            });
        });
    }

    app.get(
        '/',
        app.set('helpers').user.session,
        require('./index/index.js')(app)
    );
    app.get(
        '/c/:channel',
        app.set('helpers').user.session,
        require('./index/channel.js')(app)
    );
    app.get(
        '/recovery/:key',
        require('./index/recovery.js')(app)
    );
    app.get(
        '/ulogin',
        require('./index/ulogin.js')(app)
    );
    app.get(
        '/about',
        require('./index/about.js')(app)
    );
    app.get(
        '/contact',
        require('./index/contact.js')(app)
    );
    app.get(
        '/archive/:channel?/:monthyear?/:day?/:page?',
        require('./index/archive.js')(app)
    );
    app.get(
        '/message/:message',
        require('./index/message.js')(app)
    );

    app.post(
        '/oauth',
        app.set('helpers').user.xhrAccess,
        require('./index/oauth.js')(app)
    );
    app.post(
        '/create',
        app.set('helpers').user.xhrAccess,
        app.set('helpers').user.session,
        app.set('helpers').user.userAccess,
        require('./index/create.js')(app)
    );
    app.post(
        '/channel/list',
        app.set('helpers').user.xhrAccess,
        require('./channel/list.js')(app)
    );
    app.post(
        '/channel/:channel',
        app.set('helpers').user.xhrAccess,
        require('./channel/index.js')
    );
    app.post(
        '/channel/:channel/messages',
        app.set('helpers').user.xhrAccess,
        require('./channel/messages.js')(app)
    );
    app.post(
        '/channel/:channel/users',
        app.set('helpers').user.xhrAccess,
        require('./channel/users.js')(app)
    );
    app.post(
        '/user/forgot',
        app.set('helpers').user.xhrAccess,
        require('./user/forgot.js')(app)
    );
    app.post(
        '/user/:key/pic',
        require('./user/pic.js')(app)
    );
    app.post(
        '/recovery/:key',
        app.set('helpers').user.xhrAccess,
        require('./index/recovery.js')(app)
    );
    app.post(
        '/contact',
        app.set('helpers').user.xhrAccess,
        require('./index/contact.js')(app)
    );
    app.post(
        '/channel/:channel/info',
        app.set('helpers').user.xhrAccess,
        app.set('helpers').user.session,
        app.set('helpers').user.userAccess,
        require('./channel/info.js')(app)
    );
    app.post(
        '/channel/:channel/description',
        app.set('helpers').user.xhrAccess,
        require('./channel/description.js')(app)
    );
    app.post(
        '/user/:name/profile',
        app.set('helpers').user.xhrAccess,
        app.set('helpers').user.session,
        app.set('helpers').user.userAccess,
        require('./user/profile.js')(app)
    );
    app.post(
        '/user/login',
        app.set('helpers').user.xhrAccess,
        app.set('helpers').user.session,
        require('./user/login.js')(app)
    );
    app.post(
        '/user/logout',
        app.set('helpers').user.xhrAccess,
        app.set('helpers').user.session,
        app.set('helpers').user.userAccess,
        require('./user/logout.js')
    );
    app.post(
        '/user/account',
        app.set('helpers').user.xhrAccess,
        app.set('helpers').user.session,
        app.set('helpers').user.userAccess,
        require('./user/account.js')(app)
    );
    app.post(
        '/user/settings',
        app.set('helpers').user.xhrAccess,
        app.set('helpers').user.session,
        app.set('helpers').user.userAccess,
        require('./user/settings.js')(app)
    );
    app.post(
        '/user/status',
        app.set('helpers').user.xhrAccess,
        app.set('helpers').user.session,
        app.set('helpers').user.userAccess,
        require('./user/status.js')(app)
    );
    app.post(
        '/user/private',
        app.set('helpers').user.xhrAccess,
        app.set('helpers').user.session,
        app.set('helpers').user.userAccess,
        require('./user/private.js')(app)
    );
    app.post(
        '/user/ignore',
        app.set('helpers').user.xhrAccess,
        app.set('helpers').user.session,
        app.set('helpers').user.userAccess,
        require('./user/ignore.js')(app)
    );

    // Admin routes
    app.get(
        '/admin',
        app.set('helpers').user.session,
        app.set('helpers').user.userAccess,
        app.set('helpers').user.rootAccess,
        require('./admin/index.js')(app)
    );
    app.get(
        '/admin/users/:name?/:page?',
        app.set('helpers').user.session,
        app.set('helpers').user.userAccess,
        app.set('helpers').user.rootAccess,
        require('./admin/users/index.js')(app)
    );
    app.get(
        '/admin/messages/:text?/:page?',
        app.set('helpers').user.session,
        app.set('helpers').user.userAccess,
        app.set('helpers').user.rootAccess,
        require('./admin/messages/index.js')(app)
    );
    app.get(
        '/admin/tasks',
        app.set('helpers').user.session,
        app.set('helpers').user.userAccess,
        app.set('helpers').user.rootAccess,
        require('./admin/tasks.js')(app)
    );

    app.post(
        '/admin/users/delete',
        app.set('helpers').user.xhrAccess,
        app.set('helpers').user.session,
        app.set('helpers').user.userAccess,
        app.set('helpers').user.rootAccess,
        require('./admin/users/delete.js')(app)
    );
    app.post(
        '/admin/messages/delete',
        app.set('helpers').user.xhrAccess,
        app.set('helpers').user.session,
        app.set('helpers').user.userAccess,
        app.set('helpers').user.rootAccess,
        require('./admin/messages/delete.js')(app)
    );
};