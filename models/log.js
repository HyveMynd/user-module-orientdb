/**
 * Created by Andres Monroy (HyveMynd) on 9/19/14.
 */
var assert = require('assert');
var bunyan = require('bunyan');
var utils = require('util');
var strategy = require('../lib/OrientDbStrategy');
var debug = require('debug');

var LogConfig = function (subject, strategy) {
    assert.ok(subject, "Subject must be defined");
    var LogRepo = require('../lib/LogRepository')(strategy);
    var logConfig = {};
    logConfig.subject = subject;
    logConfig.timeStamp = Date.now();

    var saveLogToDb = function (text) {
        logConfig.msg = text;
        LogRepo.create(logConfig).done();
    };

    logConfig.log = function (msg, objs) {
        var logText = utils.format(msg, objs);
        saveLogToDb(logText);
    };

    return logConfig;
};

module.exports = LogConfig;