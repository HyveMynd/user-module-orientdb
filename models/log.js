/**
 * Created by Andres Monroy (HyveMynd) on 9/19/14.
 */
var assert = require('assert');
var bunyan = require('bunyan');
var utils = require('util');
var LogRepo = require('../lib/LogRepository')('membership');
var debug = require('debug');

var LogConfig = function (subject) {
    assert.ok(subject, "Subject must be defined");
    var self = this;
    var log = {};
    log.subject = subject;
    log.timeStamp = Date.now();

    var saveLogToDb = function (text) {
        log.msg = text;
        LogRepo.create(log).done();
    };

    self.log = function (msg, objs) {
        var logText = utils.format(msg, objs);
        saveLogToDb(logText);
    };

    return self;
};

module.exports = LogConfig;