/**
 * Created by Andres Monroy (HyveMynd) on 9/19/14.
 */
var assert = require('assert');

var Log = function(args){
    assert.ok(subject, "Subject must be defined");
    var log = {};

    log.subject = args.subject;
    log.timeStamp = args.timeStamp || Date.now();
    log.message = args.message || null;

    return log;
};

module.exports = Log;