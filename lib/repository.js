/**
 * Created by Andres Monroy (HyveMynd) on 12/20/14.
 */
var assert = require('assert');
var Promise = require('bluebird');

var Repository = function(args) {

    // Check for correct args
    assert.ok(!!args.strategy, 'Database strategy must be defined');
    assert.ok(!!args.tableName, 'Database table name must be defined');

    // Init
    var repo = {};
    repo.tableName = args.tableName;
    repo.strategy = args.strategy;

    // Ensure the strategy contains all functions
    assert.ok(repo.strategy.create, 'Create function must be defined');
    assert.ok(repo.strategy.update, 'Update function must be defined');
    assert.ok(repo.strategy.remove, 'Delete function must be defined');
    assert.ok(repo.strategy.find, 'Find function must be defined');
    assert.ok(repo.strategy.where, 'Where function must be defined');
    assert.ok(repo.strategy.all, 'All function must be defined');
    assert.ok(repo.strategy.first, 'First function must be defined');
    assert.ok(repo.strategy.clear, 'Clear function must be defined');
    assert.ok(repo.strategy.raw, 'Raw function must be defined');

    Promise.promisifyAll(repo.strategy);

    repo.create = function (args) {
        return repo.strategy.create(repo.tableName, args);
    };

    repo.update = function (args, where) {
        return repo.strategy.update(repo.tableName, args, where);
    };

    repo.remove = function (args) {
        return repo.strategy.remove(repo.tableName, args);
    };

    repo.find = function (id) {
        return repo.strategy.find(id);
    };

    repo.all = function () {
        return repo.strategy.all(repo.tableName);
    };

    repo.where = function (where) {
        return repo.strategy.where(repo.tableName, where);
    };

    repo.first = function (where) {
        return repo.strategy.first(repo.tableName, where);
    };

    repo.clear = function () {
        return repo.strategy.clear(repo.tableName);
    };
    
    return repo;
};

module.exports = Repository;