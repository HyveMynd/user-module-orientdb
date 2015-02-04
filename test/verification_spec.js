///**
//* Created by Andres Monroy (HyveMynd) on 12/19/14.
//*/
//var assert = require('assert');
//var Verification = require('../lib/verification');
//var Registration = require('../lib/registration');
//var strategy = require('../lib/OrientDbStrategy')('membership');
//var regRepo = require('../lib/RegistrationRepository')(strategy);
//var userRepo = require('../lib/UserRepository')(strategy);
//var should = require('should');
//var appStrings = require('../strings');
//require('date-utils');
//
//describe('Verification', function(){
//	var registration = new Registration(userRepo, regRepo);
//    var verification = new Verification(userRepo, regRepo);
//	var regResult = {};
//	before(function (done) {
//		regRepo.clear().then(function () {
//			registration.applyForMembership({
//				email: "asd@dsa.com",
//				password: "a",
//				confirm: "a",
//				firstName: 'asd',
//				lastName: 'dsa'
//			}, function (err, result) {
//				assert.ok(result.success, result.message);
//				regResult = result;
//				userRepo.clear().then(function () {
//					done();
//				}).done();
//			});
//		}).done();
//	});
//
//	describe('a valid verification', function(){
//		var verResult = {};
//		before(function (done) {
//			regRepo.find(regResult.regApp['@rid']).then(function (reg) {
//				assert.ok(!!reg, 'Could not find registration to test against');
//				verification.verifyEmail(reg.token, function (err, result) {
//					assert.ok(err === null, err);
//					verResult = result;
//					done();
//				});
//			}).done();
//		});
//
//		it('is successful', function () {
//			verResult.success.should.equal(true);
//		});
//		it("creates a user", function () {
//			verResult.user.should.be.defined;
//		});
//		it("sets the user status to approved", function () {
//			verResult.user.status.should.equal('approved');
//		});
//		it('should increment the sign in count', function () {
//			verResult.user.signInCount.should.equal(1);
//		});
//		it("should store a hashed password", function () {
//			verResult.user.hashedPassword.should.be.defined;
//		});
//	});
//
//	describe('token does not exist', function(){
//		var verResult = {};
//		before(function (done) {
//			verification.verifyEmail('asdasdasdasdasdasd', function (err, result) {
//				assert.ok(err === null, err);
//				verResult = result;
//				done();
//			})
//		});
//
//		it('should fail', function () {
//			verResult.success.should.equal(false);
//		});
//		it('should have a message the verification crapped all over itself', function () {
//			verResult.message.should.equal(appStrings.invalidToken)
//		});
//	});
//
//	describe("token has expired", function(){
//		var verResult = {};
//		before(function (done) {
//			registration.applyForMembership({
//				email: "test@test.com",
//				password: "a",
//				confirm: "a",
//				firstName: 'asd',
//				lastName: 'dsa'
//			}, function (err, result) {
//				regResult = result;
//				regRepo.update({expiration: result.regApp.expiration.remove({hours: 2})}, {email: regResult.regApp.email}).then(function (result) {
//					assert.ok(!!result, "could not create registration for test");
//					verification.verifyEmail(regResult.regApp.token, function (err, result) {
//						assert.ok(err === null, err);
//						verResult = result;
//						done();
//					})
//				});
//			});
//		});
//
//		it('should fail', function () {
//			verResult.success.should.equal(false);
//		});
//		it('should have a message the verification crapped all over itself', function () {
//			verResult.message.should.equal(appStrings.invalidToken)
//		});
//	});
//});