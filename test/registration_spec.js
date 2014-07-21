var assert = require("assert");
var Registration = require('../lib/registration');

describe("Registering", function () {
	
	describe("a valid application", function () {
		var regResult = {};
		before(function(){
			regResult = Registration.applyForMembership({email : "asd@dsa.com", password: "a", confirm: "a"});
		});
		it("is successful", function(){
			regResult.success.should.equal(true);
		});
		it("creates a user");
		it("creates a log entry");
		it("sets the user status to approved");
	});

	describe("empty of null password", function(){
		it("is not successful");
		it("tells the user that a password is required");
	});

	describe("password and confirm mismatch", function(){
		it("is not successful");
		it("tells the user that the password is incorrect");
	});
	
	describe("email already exists", function(){
		it("is not successful");
		it("tells the user that email exists");
	});
});