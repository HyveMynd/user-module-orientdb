/**
 * Created by Andres Monroy (HyveMynd) on 12/19/14.
 */
var events = require('events');
var util = require('util');
var assert = require('assert');
var appStrings = require('../strings');
var Application = require('../models/application');
require('date-utils');

var Result = function () {
	return {
		success: false,
		message: null,
		user: null
	}
};

var Verification = function(db){
    var self = this;
    var continueWith = null;
    events.EventEmitter.call(self);
	var logger = new LogConfig({
		subject: "Verification",
		db: db
	});

	function validateInputs(token){
		if (!token){
			self.emit('invalidated', {message: appStrings.invalidToken});
		} else {
			self.emit('valid-input', token);
		}
	}

	function checkIfTokenIsInDatabase(token) {
		db.registrations.first({token: token}, function (err, reg) {
			assert.ok(err === null, err);

			if (!!reg){
				var app = new Application(reg);
				self.emit('token-in-database', app);
			} else {
				self.emit('invalidated', {message: appStrings.invalidToken});
			}
		})
	}

	function checkForValidRegistration(app){
		if (app.expiration.isAfter(new Date())){
			self.emit('valid-token', app);
		} else {
			app.invalidate(appStrings.invalidToken);
			self.emit('invalidated', app);
		}
	}

	var createUser = function (app) {
		var user = new User(app);
		user.signInCount = 1;
		user.status = "approved";
		bcrypt.hash(app.password, null, null, function (err, result) {
			assert.ok(err === null, err);
			user.hashedPassword = result;
			db.users.save(user, function (err, newUser) {
				assert.ok(err === null, err);
				app.user = newUser;
				self.emit('user-created', app);
			});
		});
	};

	function removePreviousRegistration(app){
		db.destroy(app.regApp.id, function (err, result) {
			assert.ok(err === null, err);
			assert.ok(result, 'Could not delete previous registration application');
			self.emit('registration-removed', app);
		});
	}

	function createLog(app) {
		logger.info("Successfully registered user. Application: %j", app);
		self.emit('log-created', app);
	}

	function verificationOk(app) {
		var result = new Result();
		result.success = true;
		result.message = appStrings.emailVerified;
		result.user = app.user;
		self.emit('verified', app);
		if (continueWith){
			continueWith(null, result);
		}
	}

	function verificationFailed(app) {
		var result = new Result();
		result.success = false;
		result.message = app.message;
		self.emit('not-verified', app);
		if (continueWith){
			continueWith(null, result);
		}
	}

	self.verifyEmail = function (token, next) {
		continueWith = next;
		self.emit('verification-started', token);
	};

	// Normal Path
	self.on('verification-started', validateInputs);
	self.on('valid-input', checkIfTokenIsInDatabase);
	self.on('token-in-database', checkForValidRegistration);
	self.on('valid-token', createUser);
	self.on('user-created', removePreviousRegistration);
	self.on('registration-removed', createLog);
	self.on('log-created', verificationOk);

	// Error path
	self.on('invalidated', verificationFailed);

    return self;
};

util.inherits(Verification, events.EventEmitter);
module.exports = Verification;