/**
 * Created by Andres Monroy (HyveMynd) on 12/21/14.
 */
var Oriento = require('oriento');
var config = require('../config');
var assert = require('assert');

var OrientoStrategy = function(databaseName){
    assert.ok(config && config.server, "Server configuration file must be defined");
    assert.ok(databaseName, 'Database name must be defined.');
    var server = Oriento(config.server);
    var db = server.use(databaseName);
    var strategy = {};

    strategy.create = function (className, args) {
        return db.insert().into(className).set(args).one();
    };

    strategy.update = function (className, setArgs, whereArgs) {
        return db.update(className).set(setArgs).where(whereArgs).limit(1).scalar();
    };

    strategy.remove = function (className, args) {
        return db.delete().from(className).where(args).limit(1).scalar();
    };
    
    strategy.where = function (className, whereArgs) {
        return db.select().from(className).where(whereArgs).all();
    };

    strategy.all = function (className) {
        return db.select().from(className).where({}).all();
    };

    strategy.find = function (id) {
        return db.record.get(id);
    };

    strategy.first = function (className, whereArgs) {
        return db.select().from(className).where(whereArgs).one();
    };

    strategy.clear = function (className) {
        return db.query('delete from ' + className);
    };

    strategy.raw = function () {
        return db;
    };

    return strategy;
};

module.exports = OrientoStrategy;