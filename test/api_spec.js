/**
* Created by Andres Monroy (HyveMynd) on 9/19/14.
*/
var Membership = require('../index.js');
var assert = require('assert');
var strategy = require('../strategies/OrientDbStrategy')('membership');
var UserRepo = require('../lib/UserRepository');

describe("Main Api", function(){
    var memb = {};
    var userRepo = {};

    before(function (done) {
        memb = new Membership(strategy);
        userRepo = new UserRepo(strategy);
        userRepo.clear().then(function () {
            done();
        }).done();
    });

    describe("authentication", function(){
        var newUser = {};
        before(function (done) {
            memb.register("test@test.com", "password", "password", "asd", "dsa").then(function (result) {
                newUser = result;
                done();
            });
        });

        it("authenticates", function (done) {
            memb.authenticate('test@test.com', "password").then(function (result) {
                result.should.be.defined;
                done();
            });
        });
        it("gets by token", function (done) {
            memb.findByUserToken(newUser.authenticationToken).then(function (result) {
                result.should.be.defined;
                done();
            });
        });

    });

    describe("user verification", function(){
        var token = {};
        var validUser= {};
        before(function (done) {
            memb.register("test@test.com", "password", "password", "asd", "dsa").then(function (result) {
                memb.sendVerificationEmail(result.email).then(function (result) {
                    userRepo.first({email: result.email}).then(function (user) {
                       token = user.verificationToken;
                        validUser = user;
                        done();
                    })
                });
            });
        });

        it("authenticates the token", function (done) {
            memb.verifyToken(validUser.email, token).then(function (user) {
                validUser = user;
                user.should.be.defined;
                done();
            })
        });
    });


});