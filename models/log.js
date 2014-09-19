/**
 * Created by Andres Monroy (HyveMynd) on 9/19/14.
 */
var assert = require('assert');
var bunyan = require('bunyan');
var utils = require('util');

var LogConfig = function (args) {
    assert.ok(args.subject && args.db, "Database and subject must be defined");
    var bunyanLogger = bunyan.createLogger({name: 'kumoplay-membership'});
    var self = this;
    var db = args.db;
    var log = {};
    log.subject = args.subject;
    log.timeStamp = Date.now();

    var saveLogToDb = function (text) {
        log.msg = text;
        db.logs.save(log, function (err) {
            if (err !== null){
                bunyanLogger.error(err, "Could not save log");
            }
        });
    };

    self.fatal = function (msg, objs) {
//        bunyanLogger.fatal(msg, objs);
        var logText = utils.format(msg, objs);
        saveLogToDb(logText);
    };

    self.error = function (msg, objs) {
//        bunyanLogger.error(msg, objs);
        var logText = utils.format(msg, objs);
        saveLogToDb(logText);
    };

    self.warn = function (msg, objs) {
//        bunyanLogger.warn(msg, objs);
        var logText = utils.format(msg, objs);
        saveLogToDb(logText);
    };

    self.info = function (msg, objs) {
//        bunyanLogger.info(msg, objs);
        var logText = utils.format(msg, objs);
        saveLogToDb(logText);
    };

    self.debug = function (msg, objs) {
//        bunyanLogger.debug(msg, objs);
        var logText = utils.format(msg, objs);
        saveLogToDb(logText);
    };

    self.trace = function (msg, objs) {
//        bunyanLogger.trace(msg, objs);
        var logText = utils.format(msg, objs);
        saveLogToDb(logText);
    };

    self.getLogger = function () {
        return bunyanLogger;
    };

    return self;
};

module.exports = LogConfig;