/**
 * Created by HyveMynd on 7/20/14.
 */
var Registration = require('./lib/Registration');
var Authentication = require('./lib/Authentication');
var UserRepository = require('./lib/UserRepository');
var assert = require('assert');

var Membership = function(strategy, config) {
    var self = {};
    var userRepo = new UserRepository(strategy);
    var registration = new Registration(userRepo);
    var authentication = new Authentication(userRepo);

    /**
     * Find a user with the given authentication token
     * @param token
     * @returns {*}
     */
    self.findByUserToken = function (token) {
        return userRepo.first({authenticationToken: token});
    };

    /**
     * Authenticate the email and password combination
     * @param email
     * @param password
     * @returns {Promise} A bluebird promise with the user object
     */
    self.authenticate = function (email, password) {
        return authentication.authenticate(email, password);
    };

    /**
     * Registers a user with the system
     * @param email
     * @param password
     * @param confirm
     * @param firstName
     * @param lastName
     * @returns {Promise} A bluebird promise containing the created user
     */
    self.register = function (email, password, confirm, firstName, lastName) {
        var args = {email: email,
            password: password,
            confirm: confirm,
            firstName: firstName,
            lastName: lastName
        };
        return registration.register(args);
    };

    /**
     * Sends a verification token to the given email
     * @param email
     * @returns {promise} A bluebird promise with user the email was sent to
     */
    self.sendVerificationEmail = function (email) {
        return registration.sendVerificationEmail(email, config);
    };

    /**
     * Validate a token sent through the email verification system
     * @param email
     * @param token
     * @returns {promise} A bluebird promise with the user if found or null.
     */
    self.verifyToken = function (email, token) {
        return registration.verifyToken(email, token);
    };

    return self;
};

module.exports = Membership;