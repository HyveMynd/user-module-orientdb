/**
 * Created by HyveMynd on 7/20/14.
 */
var User = require("../models/user");
var assert = require('assert');
var Promise = require('bluebird');
var bcrypt = require('bcrypt-nodejs');
var hat = require('hat');
var nodemailer = require('nodemailer');
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

    var sendVerificationEmail = function () {
        var token = hat();
        var link = serverAddress + token;
        this.user.verificationToken = token;
        this.mailOptions.to = this.email;
        this.mailOptions.from = this.mailOptions.email;
        this.mailOptions.html = this.mailOptions.html.replace('href', 'href="' + link + '"');
        return this.transporter.sendMailAsync(this.mailOptions).bind(this).then(function (info) {
            return {verificationToken: this.user.verificationToken}
        })
    };

    var getUser = function () {
        return UserRepo.first({email: this.email}).bind(this).then(function (user) {
            this.user = user;
            if (!user){
                throw new Error("User does not exist");
            }
        });
    };

    var updateUser = function (updateCriteria) {
        return UserRepo.update(updateCriteria, {email: this.user.email}).bind(this).then(function (result) {
            assert.ok(result === "1", "Could not update user");
            return this.user;
        })
    };

    /**
     * Sends the user a verification email.
     * @param email A string representing the email address to verify
     * @param transporter The transporter object used to send the email
     * @param mailOptions Any mail options necessary for the email
     * @returns {promise}
     */
    self.sendVerificationEmail = function (email, emailConfig) {
        return new Promise(function (resolve, reject) {
            if (!email) {
                return reject(new Error("Email is invalid"));
            } else if (!emailConfig) {
                return reject(new Error("Must provide a email configuration"));
            } else {
                var transporter = nodemailer.createTransport({
                    service: emailConfig.service,
                    auth:{
                        user: emailConfig.email,
                        pass: emailConfig.password
                    }
                });
                Promise.promisifyAll(transporter);
                return resolve({email: email, transporter: transporter, mailOptions: emailConfig});
            }
        }).bind({}).then(function (args) {
                this.email = args.email;
                this.transporter = args.transporter;
                this.mailOptions = args.mailOptions;
            }).then(getUser)
            .then(sendVerificationEmail)
            .then(updateUser);
    };

    var validateToken = function () {
        if (this.user.verificationToken !== this.token){
            throw new Error('Token is invalid');
        } else {
            var validated = "Validated";
            this.user.status = validated;
            return {status: validated};
        }
    };

    /**
     * Check if a token used to verify an email is correct
     * @param email the email to verify
     * @param token the token to verify
     * @returns {promise}
     */
    self.verifyToken = function (email, token) {
        return new Promise(function (resolve, reject) {
            if (!email){
                return reject(new Error("Email is invalid"));
            } else if (!token || !token.match(/^[a-z0-9 ]+$/i)){
                return resolve(new Error('Token is invalid'));
            } else {
                resolve();
            }
        }).bind({email: email, token: token})
            .then(getUser)
            .then(validateToken)
            .then(updateUser);
    };

    return self;
};

module.exports = Registration;
