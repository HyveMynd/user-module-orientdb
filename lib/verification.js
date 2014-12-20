/**
 * Created by Andres Monroy (HyveMynd) on 12/19/14.
 */
var events = require('events');
var util = require('util');
var assert = require('assert');
var appStrings = require('../strings');
var Application = require('../models/application');
var LogConfig = require('../models/log');
var User = require('../models/user');
var bcrypt = require('bcrypt-nodejs');
require('date-utils');

var Result = function () {
	return {
		success: false,
		message: null,
		user: null
	}
};

var VerificationApp = function (token) {
	return {
		user: null,
		registration: null,
		message: null,
		token: token
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

	function validateInputs(app){
		if (!app.token){
			app.message = appStrings.invalidToken;
			self.emit('invalidated', app);
		} else {
			self.emit('valid-input', app);
		}
	}

	function checkIfTokenIsInDatabase(app) {
		db.registrations.first({token: app.token}, function (err, reg) {
			assert.ok(err === null, err);

			if (!!reg){
				app.registration = reg;
				self.emit('token-in-database', app);
			} else {
				app.message = appStrings.invalidToken;
				self.emit('invalidated', app);
			}
		})
	}

	function checkForValidRegistration(app){
		var now = new Date();
		if (now.isBefore(app.registration.expiration)){
			self.emit('valid-token', app);
		} else {
			app.message = appStrings.invalidToken;
			self.emit('invalidated', app);
		}
	}

	function createUser(app) {
		var user = new User(app.registration);
		user.signInCount = 1;
		user.status = "approved";
		bcrypt.hash(app.registration.password, null, null, function (err, result) {
			assert.ok(err === null, err);
			user.hashedPassword = result;
			db.users.save(user, function (err, newUser) {
				assert.ok(err === null, err);
				app.user = newUser;
				self.emit('user-created', app);
			});
		});
	}

	function removePreviousRegistration(app){
		db.registrations.destroy(app.registration.id, function (err, result) {
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
		var app = new VerificationApp(token);
		self.emit('verification-started', app);
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