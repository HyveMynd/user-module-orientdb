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
            user: 'pxtestacct@gmail.com',
            pass: 'powpowbang1'
        }
    });

    var mailOptions = {
        from: 'pxtestacct@gmail.com',
        subject: 'Mail Verification'
    };

    before(function (done) {
        userRepo.clear().then(function () {
            done();
        }).done();
    });

    describe("send a verification email", function(){
        var user = {};

        before(function(done){
            userRepo.clear().then(function () {
                reg.register({
                    email: "asd@dsa.com",
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
            user.verificationToken.should.not.equal(null)
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

});