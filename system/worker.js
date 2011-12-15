var express      = require('express');
var connect      = require('connect');
var jade         = require('jade');
var faye         = require('faye');
var stylus       = require('stylus');
var mongoose     = require('mongoose');
var redisStore   = require('connect-redis')(express);
var log          = require('log');
var sync         = require('sync');
var dnode        = require('dnode');
var rbytes       = require('rbytes');
var mime         = require('mime');
var httpProxy    = require('http-proxy');
var aes          = require('../helpers/aes.js');
var EventEmitter = require('events').EventEmitter;
var nconf        = require('nconf');
var app          = express.createServer();
var subServer    = express.createServer();
var proxy        = new httpProxy.RoutingProxy();

module.exports = function(argv) {
    sync(function() {
        var Loader = function() {
            this.preInit();
            this.init();
            this.postInit();
        };

        Loader.prototype.preInit = function() {
            app.set('argv', argv);
            process.argv.NODE_ENV = app.set('argv').env;
            nconf.use('file', { file: __dirname + '/../config/' + app.set('argv').env + '.json' });
            app.set('host', app.set('argv').env == 'production' ? nconf.get('hostname') : (nconf.get('hostname') + ':' + app.set('argv').port));
        };

        Loader.prototype.init = function() {
            app.use(require('../helpers/detect.js')(app.set('host')));

            switch (app.set('argv').env) {
                case 'development':
                    this.developmentSetup();
                    break;
                case 'production':
                    this.productionSetup();
            }

            this.mimes();
            this.exceptions();
            this.views();
            this.middleware();
            this.mongo();
        };

        Loader.prototype.postInit = function() {
            this.helpers();
            this.faye();
            this.events();
        };

        Loader.prototype.developmentSetup = function() {
            app.set('log', require('../helpers/logger.js')(log.DEBUG));
            app.set('log').info('development mode');

            app.use(express.logger({ format: '\x1b[1m:method\x1b[0m \x1b[33m:url\x1b[0m :response-time ms' }));
            app.use(express['static'](__dirname + '/../public/stylesheets'));
            app.use(stylus.middleware({
                src    : __dirname + '/../assets/stylus',
                dest   : __dirname + '/../public/stylesheets',
                compile: function(str, path) {
                    return stylus(str).set('filename', path).set('compress', true);
                }
            }));
            app.use(express['static'](__dirname + '/../public'));
        };

        Loader.prototype.productionSetup = function() {
            app.set('log', require('../helpers/logger.js')(log.INFO));
            app.set('log').info('production mode');

            app.use(express.vhost('hg.*', subServer));
            app.use(express.vhost('m.*', app));

            subServer.all('*', function(req, res) {
                if (req.subdomains[0] === 'hg') proxy.proxyRequest(req, res, { host: '127.0.0.1', port: 4545 });
            });
        };

        Loader.prototype.mimes = function() {
            mime.define({ 'audio/ogg': ['ogg'], 'audio/x-mp3': ['mp3'] });
        };

        Loader.prototype.exceptions = function() {
            app.set('log').debug('handle exceptions');
            app.use(express.errorHandler({ dumpExceptions: true }));
            process.on('uncaughtException', function(err) {
                app.set('log').error(err.stack);
            });
        };

        Loader.prototype.views = function() {
            app.set('log').debug('setup redis');
            app.set('views', __dirname + '/../assets/jade');
            app.set('view engine', 'jade');
            app.set('view options', { layout: false });
        };

        Loader.prototype.middleware = function() {
            app.set('log').debug('setup middleware');
            app.use(express.bodyParser());
            app.use(express.cookieParser());
        };

        Loader.prototype.mongo = function() {
            app.set('log').debug('setup mongo');
            mongoose.connect(nconf.get('mongodb'));

            app.set('models', require('./models.js'));
            app.set('models').define.sync(app.set('models'), app, mongoose);

            app.User = mongoose.model('User');
            app.Channel = mongoose.model('Channel');
            app.Subscription = mongoose.model('Subscription');
            app.Message = mongoose.model('Message');
            app.PasswordRecovery = mongoose.model('PasswordRecovery');
        };

        Loader.prototype.helpers = function() {
            app.set('log').debug('setup helpers');
            app.set('helpers', {
                channel: require('../helpers/channel.js')(app),
                user   : require('../helpers/user.js')(app),
                lang   : require('../helpers/lang.js'),
                plugins: require('../helpers/plugins.js'),
                utils  : require('../helpers/utils.js')
            });
        };

        Loader.prototype.faye = function() {
            app.set('log').debug('setup faye');
            app.set('faye', {
                timeout: nconf.get('faye').timeout,
                bayeux : new faye.NodeAdapter({
                    mount  : nconf.get('faye').bayeux.mount,
                    timeout: nconf.get('faye').bayeux.timeout,
                    engine : {
                        type     : 'redis',
                        host     : nconf.get('redis').host,
                        port     : nconf.get('redis').port,
                        password : nconf.get('redis').pass,
                        namespace: nconf.get('faye').bayeux.store.namespace,
                        database : nconf.get('faye').bayeux.store.database
                    }
                })
            });
            app.set('faye').bayeux.addExtension(require('./core.js')(app));

        };

        Loader.prototype.events = function() {
            app.set('log').debug('setup events');
            var events = require('./events.js');
            app.set('events', events.sync(events, app));
        };

        Loader.prototype.synchronize = function() {
            app.set('log').debug('synchronizing...');
            var tKey = rbytes.randomBytes(24).toHex();
            this.dnode(this.syncEvents(tKey), tKey);
        };

        Loader.prototype.syncEvents = function(tKey) {
            var starter = new EventEmitter;

            starter.on('serverToken', function(key, syncServer) {
                app.set('log').debug('server token received successful');
                app.set('serverToken', aes.dec(key, tKey));
                syncServer.keys.getServerKey(tKey, function(key) {
                    starter.emit('serverKey', key, syncServer);
                });
            });

            starter.on('serverKey', function(key, syncServer) {
                app.set('log').debug('server key received successful');
                app.set('serverKey', aes.dec(key, tKey));
                syncServer.keys.getSessionKey(tKey, function(key) {
                    starter.emit('sessionKey', key, syncServer);
                });
            });

            starter.on('sessionKey', function(key, syncServer) {
                app.set('log').debug('session key received successful');
                app.set('sessionKey', aes.dec(key, tKey));
                app.use(express.session({
                    store : new redisStore(nconf.get('redis')),
                    secret: app.set('sessionKey'),
                    cookie: nconf.get('session').cookie
                }));

                require('../controllers/routes.js')(app);
                app.set('log').debug('routes loaded');

                syncServer.getChannels(function(channels) {
                    starter.emit('channels', channels, syncServer);
                });
            });

            starter.on('channels', function(channels, syncServer) {
                sync(function() {
                    return app.set('helpers').channel.getChannelObjects.sync(app.set('helpers').channel, channels);
                }, function(err, channels) {
                    if (err) return app.set('log').error(err.stack);

                    if (channels.length === 0) {
                        return app.set('log').error('channels not found');
                    }

                    app.set('log').debug('channels received successful');
                    app.set('channels', channels);

                    syncServer.getUsers(function(users) {
                        starter.emit('users', users, syncServer);
                    });
                });
            });

            starter.on('users', function(users, syncServer) {
                sync(function() {
                    return app.set('helpers').user.getUserObjects.sync(app.set('helpers').user, users);
                }, function(err, users) {
                    if (err) return app.set('log').error(err.stack);

                    if (users.length === 0) {
                        return app.set('log').error('users not found');
                    }

                    app.set('log').debug('users received successful');
                    app.set('users', users);
                    app.set('systemUserIds', []);

                    for (var userName in app.set('users')) {
                        app.set('systemUserIds').push(app.set('users')[userName].id);
                    }

                    starter.emit('start', syncServer);
                });
            });

            starter.on('start', function(syncServer) {
                app.set('syncServer', syncServer);
                app.set('faye').bayeux.attach(app);

                if (app.set('argv').env == 'production') {
                    app.listen(app.set('argv').port, '127.0.0.1');
                } else {
                    app.listen(app.set('argv').port);
                }

                app.set('log').info('worker pid ' + process.env.NODE_WORKER_ID + ' started on port ' + app.set('argv').port);
            });

            return starter;
        };

        Loader.prototype.dnode = function(starter, tKey) {
            dnode({
                publish: function(channel, data) {
                    data.token = app.set('serverToken');
                    app.set('faye').bayeux.getClient().publish(channel, data);
                },
                event  : function(plugin, command) {
                    var args = Array.prototype.slice.call(arguments);
                    args.unshift('syncEvent');
                    app.set('events').emit.apply(app.set('events'), args);
                }
            }).connect(app.set('argv').sync, '127.0.0.1', function(syncServer) {
                    syncServer.keys.getServerToken(tKey, function(key) {
                        starter.emit('serverToken', key, syncServer);
                    });
                });
        };

        return new Loader();
    }, function(err, loader) {
        if (err) return console.log(err.stack);

        loader.synchronize();
    });
};