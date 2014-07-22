/**
 * Created by HyveMynd on 7/20/14.
 */
var r = require('rethinkdb');
var assert = require('assert');
var async = require('async');

module.exports = function(grunt){

    grunt.initConfig({
        jshint: {
            files : [ 'server/**/*.js' ]
        }
    });

	grunt.registerTask("installDb", function(){
		var done = this.async();
        r.connect({host: 'localhost', port: '28015'}, function(err, conn){
			if (err || !conn) {
				throw err;
			}
			r.dbCreate('membership').run(conn, function (err) {
				if (err){
					throw err;
				}
				conn.use('membership');
				async.series([
					function (cb) {
						r.tableCreate('users').run(conn, function () {
							cb();
						});
					},
					function (cb) {
						r.tableCreate('logs').run(conn, function () {
							cb();
						});
					},
					function (cb) {
						r.tableCreate('sessions').run(conn, function () {
							cb();
						});
					}
				], function (err) {
					if (err){
						throw err;
					}
					done();
				});
			});
        });
	});

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

};