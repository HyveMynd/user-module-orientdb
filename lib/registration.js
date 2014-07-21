/**
 * Created by HyveMynd on 7/20/14.
 */
var User = require("../models/user");
var Application = require("../models/application");

var RegResult = function(){
	return {
		success: false,
		message: null,
		user: null
	};
};

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

exports.applyForMembership = function(args){
	var regResult = new RegResult();
	var app = new Application(args);

	// valid inputs
	validateInputs(app);
	// validate pass and email
	// check if email exists
	// create a new user
	// hash the pass
	// create a log
	if (app.isValid()){
		regResult.success = true;
		regResult.message = "Welcome";
		regResult.user = new User(args);
	}

	return regResult;
};