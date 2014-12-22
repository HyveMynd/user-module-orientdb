/**
 * Created by Andres Monroy (HyveMynd) on 12/21/14.
 */
var assert = require('assert');
var OrientDbStrategy = require('./OrientDbStrategy');

var RegistrationRepository = function(){
    return require('./Repository')('Registration', OrientDbStrategy('membership'));
};

module.exports = RegistrationRepository;