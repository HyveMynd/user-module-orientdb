/**
 * Created by Andres Monroy (HyveMynd) on 9/19/14.
 */
var events = require('events');
var util = require('util');
var assert = require('assert');
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var LogConfig = require('../models/log');

var AuthResult = function (creds) {
    return {
        creds: creds,
        success: false,
        message: "Invalid email or password",
        user: null
    };
};

var Authentication = function(db) {
    var self = this;
    var continueWith = null;
    events.EventEmitter.call(self);
    var logger = new LogConfig({
        subject: 'Authentication',
        db: db
    });

    var validateInputs = function (authResult) {
        if (!authResult.creds.email || !authResult.creds.password){
            self.emit("invalidated", authResult);
        } else {
            self.emit("validated", authResult);
        }
    };

    var findUser = function (authResult) {
        db.users.first({email: authResult.creds.email}, function (err, user) {
            assert.ok(err === null, err);
            if (user) {
                authResult.user = new User(user);
                self.emit("user-found", authResult);
            } else {
                self.emit("invalidated", authResult);
            }
        });
    };

    var verifyPassword = function (authResult) {
        bcrypt.compare(authResult.creds.password, authResult.user.hashedPassword, function (err, isSame) {
            assert.ok(err === null, err);
            if (isSame){
                self.emit('password-verified', authResult);
            } else {
                self.emit('invalidated', authResult);
            }
        });
    };

    var updateUserStats = function (authResult) {
        var user = authResult.user;

        // Set the user stats on the auth result
        user.signInCount += 1;
        user.currentLoginAt = new Date();
        user.lastLoginAt = user.currentLoginAt;

        // update on the server
        var updates = {
            signInCount: user.signInCount,
            currentLoginAt: user.currentLoginAt,
            lastLoginAt: user.lastLoginAt
        };

        db.users.updateOnly(updates, user.id, function (err, isUpdated) {
            assert.ok(err === null, err);
            self.emit('stats-updated', authResult);
        });
    };

    var addLogEntry = function (authResult) {
        logger.info("Authentication successful! %j", authResult);
        self.emit('log-created', authResult);
    };
    // update the user

    var authenticationSuccessful = function (authResult) {
        authResult.success = true;
        authResult.message = 'authenticated';
        self.emit('authenticated', authResult);
        if (continueWith) {
            continueWith(null, authResult);
        }
    };


    var authenticationFailed = function (authResult) {
        authResult.success = false;
        self.emit('not-authenticated', authResult);
        if (continueWith){
            continueWith(null, authResult);
        }
    };

    // Normal path
    self.on('auth-started', validateInputs);
    self.on('validated', findUser);
    self.on('user-found', verifyPassword);
    self.on('password-verified', updateUserStats);
    self.on('stats-updated', addLogEntry);
    self.on('log-created', authenticationSuccessful);

    // Error path
    self.on('invalidated', authenticationFailed);

    // Entry point
    self.authenticate = function (creds, next) {
        continueWith = next;
        var authResult = new AuthResult(creds);
        self.emit('auth-started', authResult);
    };

    return self;
};

util.inherits(Authentication, events.EventEmitter);
module.exports = Authentication;