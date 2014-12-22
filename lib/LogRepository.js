/**
 * Created by Andres Monroy (HyveMynd) on 12/21/14.
 */
var assert = require('assert');
var OrientDbStrategy = require('./OrientDbStrategy');

var LogRepository = function(){
    return require('./repository')('Log', OrientDbStrategy('membership'));
};

module.exports = LogRepository;