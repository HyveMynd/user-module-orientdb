/**
 * Created by Andres Monroy (HyveMynd) on 12/21/14.
 */
var assert = require('assert');
var OrientDbStrategy = require('./OrientDbStrategy');

var UserRepository = function(){
    var repo = require('./Repository')('membership', 'User', OrientDbStrategy);



    return repo;
};

module.exports = UserRepository;