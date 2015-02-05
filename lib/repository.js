/**
 * Created by Andres Monroy (HyveMynd) on 12/20/14.
 */
var assert = require('assert');
var Promise = require('bluebird');

/**
 * An interface for accessing a single table within a database defined by the tableName parameter. The given strategy must define
 * all functions and follow the contract specified in their documentation.
 * @param tableName the name of the table to which this repository represents.
 * @param strategy an object defining the implementation of all repository methods.
 * @returns {Repository} The initialized and configured repository.
 * @constructor
 */
var Repository = function(tableName, strategy) {

    // Check for correct args
    assert.ok(!!strategy, 'Database strategy must be defined');
    assert.ok(!!tableName, 'Database table name must be defined');

    // Init
    var repo = this;
    repo.tableName = tableName;
    repo.strategy = strategy;

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

    /**
     * Create a record in the database.
     * @param entity the object to save to the database
     * @returns {bluebird} A Bluebird promise. Contains the created object when resolved
     */
    repo.create = function (entity) {
        return new Promise(function (resolve) {
            return resolve(repo.strategy.create(repo.tableName, entity));
        });
    };

    /**
     * Update the fields matched by the update criteria in the database for any entity matched by the predicate
     * @param updateCriteria matches the fields to update
     * @param predicate matches the entities to search for
     * @returns {bluebird} A bluebird promise. Contains the number of successful updated entities when resolved.
     */
    repo.update = function (updateCriteria, predicate) {
        return new Promise(function (resolve) {
            return resolve(repo.strategy.update(repo.tableName, updateCriteria, predicate));
        });
    };

    /**
     * Removes any entities which match the predicate.
     * @param predicate object which defines predicate
     * @returns {bluebird} A bluebird promise. Contains the number of successfully removed entities when resolved.
     */
    repo.remove = function (predicate) {
        return new Promise(function (resolve) {
            return resolve(repo.strategy.remove(repo.tableName, predicate));
        });
    };

    /**
     * Returns a single entity matching the id, or null if none are found.
     * @param id a unique id
     * @returns {bluebird} A bluebird promise. Contains the entity matching the id when resolved.
     */
    repo.find = function (id) {
        return new Promise(function (resolve) {
            return resolve(repo.strategy.find(id));
        });
    };

    /**
     * Returns all entities in the repository
     * @returns {bluebird} A bluebird promise. When resolved contains a collection of all entities.
     */
    repo.all = function () {
        return new Promise(function (resolve) {
            return resolve(repo.strategy.all(repo.tableName));
        });
    };

    /**
     * Returns all entities matching the predicate.
     * @param predicate an object with keys matching the entity fields to search by.
     * @returns {bluebird} A bluebird promise. When resolved contains the collection of matching entities.
     */
    repo.where = function (predicate) {
        return new Promise(function (resolve) {
            return resolve(repo.strategy.where(repo.tableName, predicate));
        });
    };

    /**
     * Returns the first entity which matches the predicat, or null if none match.
     * @param predicate an object with keys matching the entity fields to search by.
     * @returns {bluebird} A bluebird promise. When resolved contains a single entity matching the predicate.
     */
    repo.first = function (predicate) {
        return new Promise(function (resolve) {
            return resolve(repo.strategy.first(repo.tableName, predicate));
        });
    };

    /**
     * Removes all entities from the database. USE WITH CAUTION
     * @returns {bluebird} A bluebird promise. When resolved contains the number of entities removed.
     */
    repo.clear = function () {
        return new Promise(function (resolve) {
            return resolve(repo.strategy.clear(repo.tableName));
        });
    };
    
    return repo;
};

module.exports = Repository;