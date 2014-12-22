/**
 * Created by Andres Monroy (HyveMynd) on 12/21/14.
 */
var assert = require('assert');

var UserRepository = function(strategy){
    return require('./repository')({tableName: 'User', strategy: strategy});
};

module.exports = UserRepository;