/**
 * Created by HyveMynd on 7/20/14.
 */

module.exports = function(grunt){

    grunt.initConfig({
        jshint: {
            files : [ 'server/**/*.js' ]
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

};