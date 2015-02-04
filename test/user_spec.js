var assert = require("assert");
var User = require('../models/user');
var should = require('should');

describe("User", function () {

	describe("defaults", function () {
		var user = {};
		before(function(){
			user = new User({email : "asd@dsa.com", firstName: 'asd', lastName: 'dsa'});
		});

		it("email is asd@dsa.com", function(){
			user.email.should.equal("asd@dsa.com");
		});
        it("first name is asd", function () {
            user.firstName.should.equal('asd');
        });
        it("last name is dsa", function () {
            user.lastName.should.equal('dsa');
        });
		it("has an authentication token", function(){
			user.authenticationToken.should.be.defined;
		});
		it("has a pending status", function(){
			user.status.should.equal("pending");
		});
		it("has a created date", function(){
			user.createdAt.should.be.defined;
		});
		it("has a signInCount of 0", function(){
			user.signInCount.should.equal(0);
		});
		it("has a lastLogin", function(){
			user.lastLoginAt.should.be.defined;
		});
		it("has currentLogin", function(){
			user.currentLoginAt.should.be.defined;
		});
	});

});