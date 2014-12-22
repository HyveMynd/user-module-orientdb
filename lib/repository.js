/**
 * Created by Andres Monroy (HyveMynd) on 12/20/14.
 */
var assert = require('assert');
var Promise = require('bluebird');

var Repository = function(tableName, strategy) {
    var self = this;

    // Check for correct args
    assert.ok(strategy, 'Database strategy must be defined');
    assert.ok(tableName, 'Database table name must be defined');

    // Ensure the strategy contains all functions
    assert.ok(strategy.create, 'Create function must be defined');
    assert.ok(strategy.update, 'Update function must be defined');
    assert.ok(strategy.remove, 'Delete function must be defined');
    assert.ok(strategy.find, 'Find function must be defined');
    assert.ok(strategy.where, 'Where function must be defined');
    assert.ok(strategy.all, 'All function must be defined');
    assert.ok(strategy.first, 'First function must be defined');
    assert.ok(strategy.clear, 'Clear function must be defined');
    assert.ok(strategy.raw, 'Raw function must be defined');

    Promise.promisifyAll(strategy);

    self.create = function (args) {
        return strategy.create(tableName, args);
    };

    self.update = function (args, where) {
        return strategy.update(tableName, args, where);
    };

    self.remove = function (args) {
        return strategy.remove(tableName, args);
    };

    self.find = function (id) {
        return strategy.find(id);
    };

    self.all = function () {
        return strategy.all(tableName);
    };

    self.where = function (where) {
        return strategy.where(tableName, where);
    };

    self.first = function (where) {
        return strategy.first(tableName, where);
    };

    self.clear = function () {
        return strategy.clear(tableName);
    };

    return self;
};

module.exports = Repository;