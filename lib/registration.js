/**
 * Created by HyveMynd on 7/20/14.
 */
var User = require("../models/user");
var Application = require("../models/application");
var assert = require('assert');

var RegResult = function(){
	return {
		success: false,
		message: null,
		user: null
	};
};


var Registration  = function (db) {
    var self = this;

    var validateInputs = function(app){
        // make sure email and pass are there
        if(!app.email || !app.password){
            app.invalidate("Email and password are required");
        } else if (app.password !== app.confirm){
            app.invalidate("Passwords do not match");
        } else {
            app.validate();
        }
    };

    var checkIfUserExists = function (app, next) {
        db.users.exists({email: app.email}, next);
    };

    self.applyForMembership = function(args, next){
        var regResult = new RegResult();
        var app = new Application(args);

        // valid inputs
        validateInputs(app);

        // check if email exists
        checkIfUserExists(app, function (err, exists) {
            assert.ok(err === null, err);

            if (!exists){
                // create a new user
                // hash the pass
                // create a log

                regResult.success = true;
                regResult.message = "Welcome";
                regResult.user = new User(args);
            }
            next(null, regResult);
        });
    };

    return self;
};

module.exports = Registration;
