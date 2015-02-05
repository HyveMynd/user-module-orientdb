/**
* Created by Andres Monroy (HyveMynd) on 12/19/14.
*/
var Registration = require('../lib/registration');
var strategy = require('../lib/OrientDbStrategy')('membership');
var userRepo = require('../lib/UserRepository')(strategy);
var should = require('should');
var nodemailer = require('nodemailer');
require('date-utils');

describe('Verification', function(){
    var reg = new Registration(userRepo);

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth:{
            user: 'pxdevacct@gmail.com',
            pass: 'powpowbang1'
        }
    });

    var mailOptions = {
        from: 'pxdevacct@gmail.com',
        subject: 'Email Verification'
    };

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
                    reg.sendVerificationEmail(result.email, transporter, mailOptions).then(function (result) {
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
                    reg.sendVerificationEmail("lalalala", transporter, mailOptions).then(function (result) {
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
                    reg.sendVerificationEmail(null, transporter, mailOptions).then(function (result) {
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

    describe("invalid transporter", function(){
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
                    reg.sendVerificationEmail("asd@asd.com", null, mailOptions).then(function (result) {
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
            error.message.should.equal("Must provide a valid transporter")
        });
    });

    describe("invalid field or subject", function(){
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
                    reg.sendVerificationEmail("asd@asd.com", transporter, null).then(function (result) {
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
            error.message.should.equal("Must provide a from field and subject")
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
                    reg.sendVerificationEmail(result.email, transporter, mailOptions).then(function (result) {
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
                    reg.sendVerificationEmail(result.email, transporter, mailOptions).then(function (result) {
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
                    reg.sendVerificationEmail(result.email, transporter, mailOptions).then(function (result) {
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

});