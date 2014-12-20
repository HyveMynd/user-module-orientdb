/**
 * Created by HyveMynd on 7/20/14.
 */
var r = require('rethinkdb');
var assert = require('assert');
var async = require('async');
var db = require('revision');

module.exports = function(grunt){

    grunt.initConfig({
        jshint: {
            files : [ 'server/**/*.js' ]
        }
    });

	grunt.registerTask("installDb", function(){
		var done = this.async();
        var config = { db: 'membership'}; //defaults to localhost:28015
        db.install(config, ['users', 'logs', 'sessions', 'registrations'], function (err, result) {
            assert.ok(err === null, err);
            done();
        });
	});

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

};