var assert = require("assert");
var Registration = require('../lib/registration');
var db = require('revision');

describe("Registering", function () {
    var reg = {};
    before(function (done) {
       db.connect({db:"membership"}, function (err, db) {
           reg = new Registration(db);
           done();
       });
    });
	
	describe("a valid application", function () {
		var regResult = {};
		before(function(done){
            db.registrations.destroyAll(function (err) {
                regResult = reg.applyForMembership({email : "asd@dsa.com", password: "a", confirm: "a", firstName: 'asd', lastName: 'dsa'}, function (err, result) {
                    regResult = result;
                    done();
                });
            });
		});
		it("is successful", function(){
			regResult.success.should.equal(true);
		});
		it("creates a registration application", function () {
            regResult.regApp.should.be.defined;
        });
        it("created a message", function () {
            regResult.message.should.be.defined;
        });
        it('has an expiration', function () {
            regResult.regApp.expiration.should.be.defined;
        });
        it('has a token', function () {
            regResult.regApp.token.should.be.defined;
        });
	});

	describe("empty or null password", function(){
        var regResult = {};
        before(function (done) {
            reg.applyForMembership({email : "asd@dsa.com", password: null, confirm: "a", firstName: 'asd', lastName: 'dsa'}, function (err, result) {
                regResult = result;
                done();
            });
        });
		it("is not successful", function () {
            regResult.success.should.be.false;
        });
		it("tells the user that a password is required", function () {
            regResult.message.should.equal("Email and password are required");
        });
	});

	describe("password and confirm mismatch", function(){
        var regResult = {};
        before(function (done) {
            reg.applyForMembership({email : "asd@dsa.com", password: "b", confirm: "a", firstName: 'asd', lastName: 'dsa'}, function (err, result) {
                regResult = result;
                done();
            });
        });
		it("is not successful", function () {
            regResult.success.should.be.false;
        });
		it("tells the user that the password is incorrect", function () {
            regResult.message.should.equal('Passwords do not match');
        });
	});
	
	describe("email already exists", function(){
        var regResult = {};
        before(function (done) {
            db.registrations.destroyAll(function (err) {
                reg.applyForMembership({email : "asd@dsa.com", password: "a", confirm: "a", firstName: 'asd', lastName: 'dsa'}, function (err, result) {
                    reg.applyForMembership({email : "asd@dsa.com", password: "a", confirm: "a", firstName: 'asd', lastName: 'dsa'}, function (err, result) {
                        regResult = result;
                        done();
                    });
                });
            });
        });
		it("is not successful", function () {
            regResult.success.should.be.false;
        });
		it("tells the user that email exists", function () {
            regResult.message.should.equal('This email already exists');
        });
	});

    describe("empty or null first and/or last name", function(){
        var regResult = {};
        before(function (done) {
            reg.applyForMembership({email : "dsa@dsa.com", password: 'a', confirm: "a"}, function (err, result) {
                regResult = result;
                done();
            });
        });
        it("is not successful", function () {
            regResult.success.should.be.false;
        });
        it("tells the user that they must include a first and last name", function () {
            regResult.message.should.equal('Must include a first and last name');
        });
    });
});