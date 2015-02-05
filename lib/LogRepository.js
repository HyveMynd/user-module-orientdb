/**
 * Created by Andres Monroy (HyveMynd) on 12/21/14.
 */
var assert = require('assert');

var LogRepository = function(strategy){
    return require('./repository')('Logger', strategy);
};

module.exports = LogRepository;