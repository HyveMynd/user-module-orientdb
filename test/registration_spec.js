var assert = require("assert");
var Registration = require('../lib/registration');
var strategy = require('../strategies/OrientDbStrategy')('membership');
var userRepo = require('../lib/UserRepository')(strategy);
var should = require('should');

describe("Registering", function () {
    var reg = new Registration(userRepo);

    before(function (done) {
        userRepo.clear().then(function () {
            done();
        }).done();
    });

	describe("a valid application", function () {
		var user = {};
		before(function(done){
            reg.register({email : "asd@dsa.com", password: "a", confirm: "a", firstName: 'asd', lastName: 'dsa'}).then(function (result) {
                user = result;
                done();
            }).done();
		});
		it("is successful", function(){
			user.should.be.defined;
		});
        it("has an id", function () {
            user['@rid'].should.be.defined;
        });
	});

    describe("empty or null password", function(){
        var user = {};
        var error = {};
        before(function (done) {
            reg.register({email : "asd@dsa.com", password: null, confirm: "a", firstName: 'asd', lastName: 'dsa'}).then(function (result) {
                user = result;
                done();
            }).catch(function (err) {
                error = err;
                done();
            });
        });
		it("is not successful", function () {
            user.should.be.empty;
        });
		it("tells the user that a password is required", function () {
            error.message.should.equal("Email and password are required");
        });
    });

    describe("password and confirm mismatch", function(){
        var user = {};
        var error = {};
        before(function (done) {
            reg.register({email : "asd@dsa.com", password: "b", confirm: "a", firstName: 'asd', lastName: 'dsa'}).then(function (result) {
                user = result;
                done();
            }).catch(function (err) {
                error = err;
                done();
            });
        });
		it("is not successful", function () {
            user.should.be.empty;
        });
		it("tells the user that the password is incorrect", function () {
            error.message.should.equal('Passwords do not match');
        });
    });

    describe("email already exists", function(){
        var user = {};
        var error = {};
        before(function (done) {
            userRepo.clear().then(function () {
                reg.register({email : "asd@dsa.com", password: "a", confirm: "a", firstName: 'asd', lastName: 'dsa'}).then(function (result) {
                    reg.register({email : "asd@dsa.com", password: "a", confirm: "a", firstName: 'asd', lastName: 'dsa'}).then(function (result) {
                        user = result;
                        done();
                    }).catch(function (err) {
                        error = err;
                        done();
                    });
                });
            });
        });
		it("is not successful", function () {
            user.should.be.empty;
        });
		it("tells the user that email exists", function () {
            error.message.should.equal('This email already exists');
        });
    });

    describe("empty or null first and/or last name", function(){
        var user = {};
        var error = {};
        before(function (done) {
            reg.register({email : "dsa@dsa.com", password: 'a', confirm: "a"}).then(function (result) {
                user = result;
                done();
            }).catch(function (err) {
                error = err;
                done();
            });
        });
        it("is not successful", function () {
            user.should.be.empty;
        });
        it("tells the user that they must include a first and last name", function () {
            error.message.should.equal('Must include a first and last name');
        });
    });

});