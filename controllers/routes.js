module.exports = function(app) {
    app.use(app.router);

    app.use(function(req, res) {
        res.send(404);
    });

    app.error(function(err) {
        app.set('log').critical(err.stack);
        process.exit(1);
    });

    // Filter static content
    if (app.set('argv').env === 'production') {
        var httpProxy = require('http-proxy');
        var proxy = new httpProxy.RoutingProxy();

        app.get(/\.[js|css|gif|png|jpg|mp3|ogg|eot|svg|ttf|woff|swf|ico]+$/, function(req, res) {
            proxy.proxyRequest(req, res, {
                host: '127.0.0.1',
                port: 4000
            });
        });
    }

    app.get('/', app.set('helpers').user.session, require('./index/index.js')(app));
    app.get('/c/:channel', app.set('helpers').user.session, require('./index/channel.js')(app));
    app.get('/recovery/:key', require('./index/recovery.js')(app));
    app.get('/ulogin', require('./index/ulogin.js')(app));
    app.get('/about', require('./index/about.js')(app));
    app.get('/contact', require('./index/contact.js')(app));
    app.get('/archive/:channel?/:monthyear?/:day?/:page?', require('./index/archive.js')(app));
    app.get('/message/:message', require('./index/message.js')(app));
    app.get('/admin', app.set('helpers').user.session, app.set('helpers').user.rootAccess, require('./admin/index.js')(app));
    app.get('/admin/users/:name?/:page?', app.set('helpers').user.session, app.set('helpers').user.rootAccess, require('./admin/users/index.js')(app));
    app.get('/admin/messages/:text?/:page?', app.set('helpers').user.session, app.set('helpers').user.rootAccess, require('./admin/messages/index.js')(app));

    app.post('/oauth', require('./index/oauth.js')(app));
    app.post('/channel/list', require('./channel/list.js')(app));
    app.post('/channel/:channel', require('./channel/index.js'));
    app.post('/channel/:channel/messages', require('./channel/messages.js')(app));
    app.post('/channel/:channel/users', require('./channel/users.js')(app));
    app.post('/channel/:channel/info', app.set('helpers').user.session, require('./channel/info.js')(app));
    app.post('/user/:name/profile', app.set('helpers').user.session, require('./user/profile.js')(app));
    app.post('/user/login', require('./user/login.js')(app));
    app.post('/user/logout', app.set('helpers').user.session, require('./user/logout.js'));
    app.post('/user/account', app.set('helpers').user.session, require('./user/account.js')(app));
    app.post('/user/settings', app.set('helpers').user.session, require('./user/settings.js')(app));
    app.post('/user/status', app.set('helpers').user.session, require('./user/status.js')(app));
    app.post('/user/private', app.set('helpers').user.session, require('./user/private.js')(app));
    app.post('/user/ignore', app.set('helpers').user.session, require('./user/ignore.js')(app));
    app.post('/user/forgot', require('./user/forgot.js')(app));
    app.post('/user/:key/pic', require('./user/pic.js')(app));
    app.post('/recovery/:key', require('./index/recovery.js')(app));
    app.post('/contact', require('./index/contact.js')(app));
    app.post('/admin/users/delete', app.set('helpers').user.session, app.set('helpers').user.rootAccess, require('./admin/users/delete.js')(app));
};