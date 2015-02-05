/**
 * Created by Andres Monroy (HyveMynd) on 9/19/14.
 */
var assert = require('assert');
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var Promise = require('bluebird');

Promise.promisifyAll(bcrypt);

var Authentication = function(UserRepo) {
    var self = this;
    var invalidInput = 'Invalid email or password';

    var validateInputs = function (creds) {
        if (!creds.email || !creds.password){
            throw new Error('Must have an email and password');
        }
        this.email = creds.email;
        this.password = creds.password;
    };

    var findUser = function () {
        return UserRepo.first({email: this.email}).bind(this).then(function (user) {
            this.user = user;
            if (!user){
                throw new Error(invalidInput);
            }
        });
    };

    var verifyPassword = function () {
        return bcrypt.compareAsync(this.password, this.user.hashedPassword).bind(this).then(function (isSame) {
            if (!isSame){
                throw new Error(invalidInput);
            }
        });
    };

    var updateUserStats = function () {
        // Set the user stats on the auth result
        this.user.signInCount += 1;
        this.user.currentLoginAt = new Date();
        this.user.lastLoginAt = this.user.currentLoginAt;

        // update on the server
        var updates = {
            signInCount: this.user.signInCount,
            currentLoginAt: this.user.currentLoginAt,
            lastLoginAt: this.user.lastLoginAt
        };

        return UserRepo.update(updates, {email: this.user.email}).bind(this).then(function (result) {
            assert.ok(result === "1", 'Could not update user');
            return this.user;
        });
    };

    self.authenticate = function (email, password) {
        return new Promise(function (resolve) {
            return resolve({email: email, password: password});
        }).bind({}).then(validateInputs)
            .then(findUser)
            .then(verifyPassword)
            .then(updateUserStats);
    };

    return self;
};

module.exports = Authentication;