/**
 * Created by HyveMynd on 7/20/14.
 */
'use strict';
var User = require("../models/user");
var assert = require('assert');
var Promise = require('bluebird');
var bcrypt = require('bcrypt-nodejs');
var hat = require('hat');
require('date-utils');

Promise.promisifyAll(bcrypt);

var Application = function(args) {
    var app = {};
    app.email = args.email;
    app.password = args.password;
    app.confirm = args.confirm;
    app.firstName = args.firstName;
    app.lastName = args.lastName;
    return app;
};

var Registration  = function (UserRepo) {
    var self = this;
    var serverAddress = 'http://localhost:3000/api/verify?tk=';

    var validateRegistrationInputs = function(app){
        // make sure email and pass are there
        if(!app.email || !app.password){
            throw new Error("Email and password are required");
        } else if (app.password !== app.confirm) {
            throw new Error("Passwords do not match")
        } else if (!app.firstName || !app.lastName) {
            throw new Error("Must include a first and last name")
        } else {
            return app;
        }
    };

    var checkIfUserExists = function (app) {
        return UserRepo.first({email: app.email}).then(function (user) {
            if (user){
                throw new Error("This email already exists");
            } else {
                return app;
            }
        });
    };

    var createUser = function (app) {
        return bcrypt.hashAsync(app.password, null, null).bind(app).then(function (result) {
            var user = new User(this);
            user.signInCount = 1;
            user.hashedPassword = result;
            return UserRepo.create(user);
        });
    };

    /**
     * Registers a user with the database.
     * @param args An object containing the necessary parameters
     * @returns {Promise} contains the user object if created.
     */
    self.register = function(args){
        return new Promise(function (resolve) {
            return resolve(new Application(args));
        }).then(validateRegistrationInputs)
            .then(checkIfUserExists)
            .then(createUser);
    };

    var sendVerificationEmail = function (user) {
        if (!user){
            throw new Error("User does not exist");
        } else {
            var token = hat();
            var link = serverAddress + token;
            this.user = user;
            this.user.verificationToken = token;
            this.mailOptions.to = this.email;
            this.mailOptions.text = "Please following the link below to verify your account.\n\n" + link;
            return this.transporter.sendMailAsync(this.mailOptions).bind(this).then(function (info) {
                return this.user;
            });
        }
    };

    /**
     * Sends the user a verification email.
     * @param email A string representing the email address to verify
     * @param transporter The transporter object used to send the email
     * @param mailOptions Any mail options necessary for the email
     * @returns {*}
     */
    self.sendVerificationEmail = function (email, transporter, mailOptions) {
        Promise.promisifyAll(transporter);
        return new Promise(function (resolve, reject) {
            if (!email) {
                return reject(new Error("Email is invalid"));
            } else if (!transporter || typeof transporter.sendMail !== 'function') {
                return reject(new Error("Must provide a valid transporter"));
            } else if (!mailOptions || !mailOptions.from || !mailOptions.subject){
                return reject(new Error("Must provide a from field and subject"));
            } else {
                return resolve();
            }
        }).bind({email: email, transporter: transporter, mailOptions: mailOptions}).then(function () {
                return UserRepo.first({email: this.email});
            })
            .then(sendVerificationEmail)
            .then(function () {
                return UserRepo.update({token: this.user.verificationToken}, {email: this.user.email}).bind(this).then(function (result) {
                    assert.ok(result === "1", "Could not update user.");
                    return this.user;
                });
            });
    };

    return self;
};

module.exports = Registration;
