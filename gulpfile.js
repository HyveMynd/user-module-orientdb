/**
 * Created by Andres Monroy (HyveMynd) on 12/20/14.
 */
var gulp = require('gulp');
var Oriento = require('oriento');
var config = require('./config');
var assert = require('assert');
var Promise = require('bluebird');

gulp.task('installDb', function (done) {
    assert.ok(config.server, new Error('Must define a server configuration file.'));
    var server = Oriento(config.server);

    // Create server
    server.create({
        name: 'membership',
        type: 'document',
        storage: 'plocal'
    }).then(function (db) {
        var classes = ['User', 'Log', 'Session'];
        var promises = classes.map(function (name) {
            db.class.create(name);
        });

        Promise.all(promises).then(function () {
            done();
        }).error(function (e) {
            done(e);
        });
    }).error(function (e) {
        done(e);
    });
});