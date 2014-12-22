/**
 * Created by Andres Monroy (HyveMynd) on 12/21/14.
 */
var assert = require('assert');
var OrientDbStrategy = require('./OrientDbStrategy');

var UserRepository = function(){
    return require('./Repository')('User', OrientDbStrategy('membership'));
};

module.exports = UserRepository;