/**
 * Created by Andres Monroy (HyveMynd) on 12/21/14.
 */
var assert = require('assert');
var OrientDbStrategy = require('./OrientDbStrategy');

var RegistrationRepository = function(strategy){
    return require('./repository')({tableName: 'Registration', strategy: strategy});
};

module.exports = RegistrationRepository;