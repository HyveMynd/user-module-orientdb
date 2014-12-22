/**
 * Created by HyveMynd on 7/20/14.
 */
'use strict';
var User = require("../models/user");
var Application = require("../models/application");
var assert = require('assert');
var LogConfig = require('../models/log');
var Emitter = require('events').EventEmitter;
var util = require('util');
var nodemailer = require('nodemailer');
var config = require('../config');
var hat = require('hat');
var appStrings = require('../strings');
var RegistrationApplication = require('../models/registrationApplication');
require('date-utils');

var RegResult = function(){
	return {
		success: false,
		message: null,
        regApp: null
	};
};

var Registration  = function (UserRepo, RegistrationRepo) {
    Emitter.call(this);
    var self = this;
    var continueWith = null;
    var logger = new LogConfig('Registration');
    var userRepo = new UserRepo();
    var regRepo = new RegistrationRepo();
    assert.ok(!!appStrings, "Strings file must be defined");
    assert.ok(!!config, "Configuration file must be defined.");
    var transporter = nodemailer.createTransport({
        service: config.service,
        auth: {
            user: config.email,
            pass: config.password
        }
    });

    var validateInputs = function(app){
        // make sure email and pass are there
        if(!app.email || !app.password){
            app.invalidate(appStrings.emailAndPassRequired);
            self.emit("invalidated", app);
        } else if (app.password !== app.confirm) {
            app.invalidate(appStrings.passwordsDoNotMatch);
            self.emit("invalidated", app);
        } else if (!app.firstName || !app.lastName) {
            app.invalidate(appStrings.mustIncludeFirstAndLastName);
            self.emit("invalidated", app);
        } else {
            app.validate();
            self.emit("validated", app);
        }
    };

    var checkIfRegistrationExists = function (app) {
        var now = new Date();
        regRepo.first({email: app.email}).then(function (registration) {
            if (!!registration && !!registration.expiration && registration.expiration.isAfter(now)){
                app.invalidate(appStrings.emailExists);
                self.emit('invalidated', app);
            } else {
                self.emit('registration-does-not-exist', app);
            }
        }).done();
    };

    var checkIfUserExists = function (app) {
        userRepo.first({email: app.email}).then(function (user) {
            if (user){
                app.invalidate(appStrings.emailExists);
                self.emit("invalidated", app);
            } else {
                self.emit("user-does-not-exist", app);
            }
        }).done();
    };

    var createVerificationToken = function (app) {
        // set verification token
        var regApp = new RegistrationApplication(app);
        regApp.token = hat();

        // set expiration
        var nowPlus2Hours = new Date();
        nowPlus2Hours.add({hours:2});
        regApp.expiration = nowPlus2Hours;

        regRepo.create(regApp).then(function (newRegApp) {
            app.regApp = newRegApp;
            self.emit('token-created', app);
        }).done();
    };

    var sendVerificationEmail = function (app) {
        var link = config.link + hat();
        var text = config.body + link;
        var mailOptions = {
            from: config.email,
            to: app.email,
            bcc: config.email,
            subject: config.subject,
            text: text
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error){
                app.invalidate(appStrings.couldNotSendEmail);
                logger.error('Could not send verification email', app);
                console.log(error);
                self.emit('invalidated', app);
            } else {
                self.emit('verification-email-sent', app);
            }
        })
    };

    var addLogEntry = function (app) {
        logger.log("Successfully registered user. Application: %j", app);
        self.emit('log-created', app);
    };

    var registrationOk = function (app) {
        var regResult = new RegResult();
        regResult.success = true;
        regResult.message = appStrings.emailSent;
        regResult.regApp = app.regApp;
        self.emit('registered', app);
        if (continueWith){
            continueWith(null, regResult);
        }
    };

    var registrationFailed = function (app) {
        var regResult = new RegResult();
        regResult.success = false;
        regResult.message = app.message;
        self.emit('not-registered', app);
        if (continueWith){
            continueWith(null, regResult);
        }
    };

    self.applyForMembership = function(args, next){
        var app = new Application(args);
        continueWith = next;
        self.emit('application-started', app);
    };

    // Normal Path
    self.on('application-started', validateInputs);
    self.on('validated', checkIfRegistrationExists);
    self.on('registration-does-not-exist', checkIfUserExists);
    self.on('user-does-not-exist', createVerificationToken);
    self.on('token-created', sendVerificationEmail);
    self.on('verification-email-sent', addLogEntry);
    self.on('log-created', registrationOk);

    // Error path
    self.on('invalidated', registrationFailed);

    return self;
};

util.inherits(Registration, Emitter);
module.exports = Registration;
