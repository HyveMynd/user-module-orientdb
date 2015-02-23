/**
* Created by Andres Monroy (HyveMynd) on 12/19/14.
*/
var Registration = require('../lib/registration');
var strategy = require('../strategies/OrientDbStrategy')('membership');
var userRepo = require('../lib/UserRepository')(strategy);
var should = require('should');
var config = require('../config');
var moment = require('moment');
var assert = require('assert');
require('date-utils');

describe('Verification', function(){
    var reg = new Registration(userRepo);

    before(function (done) {
        userRepo.clear().then(function () {
            done();
        }).done();
    });

    describe("sends a verification email", function(){
        var user = {};

        before(function(done){
            userRepo.clear().then(function () {
                reg.register({
                    email: "pxdevacct@gmail.com",
                    password: "a",
                    confirm: "a",
                    firstName: 'asd',
                    lastName: 'dsa'
                }).then(function (result) {
                    reg.sendVerificationEmail(result.email, config.email).then(function (result) {
                        user = result;
                        done();
                    }).done();
                }).done();
            });
        });

        it("should be successful", function () {
            user.should.be.defined;
        });
        it("saves the verification token", function () {
            user.verificationToken.should.not.equal(null).and.should.not.be.empty;
        });
        it("has an expiration date 2 hours from now", function () {
            var now = moment();
            var expiration = moment(user.verificationTokenDate);
            var diff = expiration.diff(now, 'h');
            diff.should.be.greaterThan(0).and.lessThan(2);
        });
    });

    describe("user does not exist", function(){
        var user = {};
        var error ={};

        before(function(done){
            userRepo.clear().then(function () {
                reg.register({
                    email: "asd@dsa.com",
                    password: "a",
                    confirm: "a",
                    firstName: 'asd',
                    lastName: 'dsa'
                }).then(function (result) {
                    reg.sendVerificationEmail("lalalala", config.email).then(function (result) {
                        user = result;
                        done();
                    }).catch(function (err) {
                        error = err;
                        done();
                    })
                }).done();
            });
        });

        it("should fail", function () {
            user.should.be.empty;
        });
        it("has an error message", function () {
            error.message.should.equal("User does not exist")
        });
    });

    describe("email invalid", function(){
        var user = {};
        var error ={};

        before(function(done){
            userRepo.clear().then(function () {
                reg.register({
                    email: "asd@dsa.com",
                    password: "a",
                    confirm: "a",
                    firstName: 'asd',
                    lastName: 'dsa'
                }).then(function (result) {
                    reg.sendVerificationEmail(null, config.email).then(function (result) {
                        user = result;
                        done();
                    }).catch(function (err) {
                        error = err;
                        done();
                    })
                }).done();
            });
        });

        it("should fail", function () {
            user.should.be.empty;
        });
        it("has an error message", function () {
            error.message.should.equal("Email is invalid")
        });
    });

    describe("successfully verifies token", function(){
        var user = {};

        before(function(done){
            userRepo.clear().then(function () {
                reg.register({
                    email: "pxdevacct@gmail.com",
                    password: "a",
                    confirm: "a",
                    firstName: 'asd',
                    lastName: 'dsa'
                }).then(function (result) {
                    reg.sendVerificationEmail(result.email, config.email).then(function (result) {
                        user = result;
                        reg.verifyToken(user.email, user.verificationToken).then(function (result) {
                            user = result;
                            done();
                        }).done();
                    }).done();
                }).done();
            });
        });

        it("should be successful", function () {
            user.should.be.defined;
        });
        it("should have  verified status", function () {
            user.status.should.equal("Validated");
        });
    });

    describe("invalid email", function(){
        var user = {};
        var error = null;

        before(function(done){
            userRepo.clear().then(function () {
                reg.register({
                    email: "pxdevacct@gmail.com",
                    password: "a",
                    confirm: "a",
                    firstName: 'asd',
                    lastName: 'dsa'
                }).then(function (result) {
                    reg.sendVerificationEmail(result.email, config.email).then(function (result) {
                        user = result;
                        reg.verifyToken(null, user.verificationToken).then(function (result) {
                            user = result;
                            done();
                        }).catch(function (err) {
                            error = err;
                            done();
                        });
                    }).done();
                }).done();
            });
        });

        it("should fail", function () {
            error.should.not.equal(null);
        });
        it("has a pending status", function () {
            user.status.should.equal("pending")
        });
        it("has an error message", function () {
            error.message.should.equal("Email is invalid");
        });
    });

    describe("invalid token", function(){
        var user = {};
        var error = {};

        before(function(done){
            userRepo.clear().then(function () {
                reg.register({
                    email: "pxdevacct@gmail.com",
                    password: "a",
                    confirm: "a",
                    firstName: 'asd',
                    lastName: 'dsa'
                }).then(function (result) {
                    reg.sendVerificationEmail(result.email, config.email).then(function (result) {
                        user = result;
                        reg.verifyToken(user.email, "asdasd").then(function (result) {
                            user = result;
                            done();
                        }).catch(function (err) {
                            error = err;
                            done();
                        });
                    }).done();
                }).done();
            });
        });

        it("should fail", function () {
            error.should.not.equal(null);
        });
        it("has a pending status", function () {
            user.status.should.equal("pending")
        });
        it("has an error message", function () {
            error.message.should.equal("Token is invalid");
        });
    });

    describe("expired token", function(){
        var user = {};
        var error = {};

        before(function(done){
            userRepo.clear().then(function () {
                reg.register({
                    email: "pxdevacct@gmail.com",
                    password: "a",
                    confirm: "a",
                    firstName: 'asd',
                    lastName: 'dsa'
                }).then(function (result) {
                    reg.sendVerificationEmail(result.email, config.email).then(function (result) {
                        user = result;
                        userRepo.update({verificationTokenDate: moment().subtract(2, 'h').toDate()}, {email: user.email}).then(function (result) {
                            assert.ok(result === "1", "Did not update the time correctly");
                            reg.verifyToken(user.email, user.verificationToken).then(function (result) {
                                user = result;
                                done();
                            }).catch(function (err) {
                                error = err;
                                done();
                            });
                        });
                    });
                }).done();
            }).done();
        });


        it("should fail", function () {
            error.should.not.equal(null);
        });
        it("has a pending status", function () {
            user.status.should.equal("pending")
        });
        it("has an error message", function () {
            error.message.should.equal("Token is invalid");
        });
    });

});