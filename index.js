var cluster = require('cluster');
var master  = require('./system/master.js');
var worker  = require('./system/worker.js');
var argv    = require('optimist')
    ['default']({ port: 3000, sync: 5000, logserver: 4646, env: 'development', workers: 2 })
    ['usage']('Usage: $0 --port [port] --sync [port] --logserver [port] --env [environment] --workers [number]').argv;

cluster.isMaster ? master(argv) : worker(argv);