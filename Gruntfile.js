/**
 * Created by HyveMynd on 7/20/14.
 */
var db = require('secondthought');
var assert = require('assert');

module.exports = function(grunt){

    grunt.initConfig({
        jshint: {
            files : [ 'server/**/*.js' ]
        }
    });

	grunt.registerTask("installDb", function(){
		var done = this.async();
		db.connect({db: "membership"}, function(err, db){
			db.install(['users', 'logs', 'sessions'], function(err, tableResult){
				assert.ok(err === null, err);
				console.log("Db Installed: " + tableResult);
				done();
			});
		});
	});

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

};