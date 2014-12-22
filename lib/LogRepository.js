/**
 * Created by Andres Monroy (HyveMynd) on 12/21/14.
 */
var assert = require('assert');
var OrientDbStrategy = require('./OrientDbStrategy');

var LogRepository = function(strategy){
    return require('./repository')({tableName: 'Log', strategy: strategy});
};

module.exports = LogRepository;