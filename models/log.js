/**
 * Created by Andres Monroy (HyveMynd) on 9/19/14.
 */
var assert = require('assert');
var utils = require('util');
var debug = require('debug');

var Logger = function (LogRepository) {
    assert.ok(subject, "Subject must be defined");
    var log = {};
    log.subject = subject;
    log.timeStamp = Date.now();

    var saveLogToDb = function (text) {
        log.message = text;
        debug(log);
        LogRepository.create(log).done();
    };

    this.log = function (msg, objs) {
        var logText = utils.format(msg, objs);
        saveLogToDb(logText);
    };

    return this;
};

module.exports = Logger;