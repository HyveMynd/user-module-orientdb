/**
 * Created by Andres Monroy (HyveMynd) on 12/19/14.
 */
var assert = require('assert');
var Verification = require('../lib/verification');
var Registration = require('../lib/registration');
var db = require('revision');

describe('Verification', function(){
	var registration = {};
    var verification = {};
	before(function (done) {
		db.connect({db:"membership"}, function (err, db) {
			verification = new Verification(db);
			registration = new Registration(db);
			db.registrations.destroyAll(function (err) {
				registration.applyForMembership({email : "asd@dsa.com", password: "a", confirm: "a", firstName: 'asd', lastName: 'dsa'}, function (err, result) {
					assert.ok(result.success, result.message);
					db.users.destroyAll(function (err, result) {
						done();
					})
				});
			});
		});
	});

	describe('a valid verification', function(){
		var verResult = {};
		before(function (done) {
			db.registrations.first({email: "asd@dsa.com"}, function (err, reg) {
				verification.verifyEmail(reg.token, function (err, result) {
					assert.ok(err === null, err);
					verResult = result;
					done();
				});
			});
		});

		it('is successful', function () {
			verResult.user.should.be.defined;
		});
		it("creates a user", function () {
			verResult.user.should.be.defined;
		});
		it("sets the user status to approved", function () {
			verResult.user.status.should.equal('approved');
		});
		it('should increment the sign in count', function () {
			verResult.user.signInCount.should.equal(1);
		});
		it("should store a hashed password", function () {
			verResult.user.hashedPassword.should.be.defined;
		});
	});

	describe('token does not exist', function(){
		it('should fail');
		it('should have a message the verification crapped all over itself');
	});

	describe("token has expired", function(){
	    it("should fail");
		it("should have a message saying it doesnt exist");
	});
});