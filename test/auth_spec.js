/**
* Created by Andres Monroy (HyveMynd) on 9/19/14.
*/
var assert = require("assert");
var Registration = require('../lib/registration');
var Auth = require('../lib/authentication');
var should = require('should');
var strategy = require('../strategies/OrientDbStrategy')('membership');
var UserRepo = require('../lib/UserRepository')(strategy);

describe('Authentication', function () {
    var reg = new Registration(UserRepo);
    var auth = new Auth(UserRepo);

    before(function (done) {
        UserRepo.clear().then(function () {
            done();
        }).done();
    });

    describe("a valid login", function(){
        var user = {};
        before(function(done){
            UserRepo.clear().then(function () {
                reg.register({email : "pxdevacct@gmail.com", password: "password", confirm: "password", firstName: "asd", lastName: "dsa"}).then(function (regResult) {
                    auth.authenticate('pxdevacct@gmail.com', 'password').then(function (result) {
                        user = result;
                        done();
                    }).done();
                }).done();
            }).done()
        });

        it("is successful", function () {
            user.should.defined;
        });
        it("updates the user stats", function () {
            user.signInCount.should.equal(2);
        });
        it("updates the signon dates", function () {
            should.exist(user.lastLoginAt);
            should.exist(user.currentLoginAt);
        });
    });

    describe("empty email", function(){
        var user = {};
        var error = {};

        before(function(done){
            UserRepo.clear().then(function () {
                reg.register({email : "test@test.com", password: "password", confirm: "password", firstName: "asd", lastName: "dsa"}).then(function (regResult) {
                    auth.authenticate(null, 'password').then(function (result) {
                        user = result;
                        done();
                    }).catch(function (err) {
                        error = err;
                        done();
                    }).done();
                }).done();
            }).done();
        });

        it("is not successful", function () {
            user.should.be.empty;
        });
        it("returns invalid login message", function () {
            error.message.should.equal("Must have an email and password");
        });
    });

    describe("empty password", function(){
        var user = {};
        var error = {};

        before(function(done){
            UserRepo.clear().then(function () {
                reg.register({email : "test@test.com", password: "password", confirm: "password", firstName: "asd", lastName: "dsa"}).then(function (regResult) {
                    auth.authenticate("test@test.com", null).then(function (result) {
                        user = result;
                        done();
                    }).catch(function (err) {
                        error = err;
                        done();
                    }).done();
                }).done();
            }).done();
        });

        it("is not successful", function () {
            user.should.be.empty;
        });
        it("returns invalid login message", function () {
            error.message.should.equal("Must have an email and password");
        });
    });

    describe("password does not match", function(){
        var user = {};
        var error = {};

        before(function(done){
            UserRepo.clear().then(function () {
                reg.register({email : "test@test.com", password: "password", confirm: "password", firstName: "asd", lastName: "dsa"}).then(function (regResult) {
                    auth.authenticate("test@test.com", 'word').then(function (result) {
                        user = result;
                        done();
                    }).catch(function (err) {
                        error = err;
                        done();
                    }).done();
                }).done();
            }).done();
        });

        it("is not successful", function () {
            user.should.be.empty;
        });
        it("returns invalid login message", function () {
            error.message.should.equal("Invalid email or password");
        });
    });

    describe("email not found", function(){
        var user = {};
        var error = {};

        before(function(done){
            UserRepo.clear().then(function () {
                reg.register({email : "test@test.com", password: "password", confirm: "password", firstName: "asd", lastName: "dsa"}).then(function (regResult) {
                    auth.authenticate("asd@asd.com", 'password').then(function (result) {
                        user = result;
                        done();
                    }).catch(function (err) {
                        error = err;
                        done();
                    }).done();
                }).done();
            }).done();
        });

        it("is not successful", function () {
            user.should.be.empty;
        });
        it("returns invalid login message", function () {
            error.message.should.equal("Invalid email or password");
        });
    });

});