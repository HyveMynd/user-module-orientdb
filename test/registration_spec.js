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
            db.users.destroyAll(function (err) {
                regResult = reg.applyForMembership({email : "asd@dsa.com", password: "a", confirm: "a"}, function (err, result) {
                    regResult = result;
                    done();
                });
            });
		});
		it("is successful", function(){
			regResult.success.should.equal(true);
		});
		it("creates a user", function () {
            regResult.user.should.be.defined;
        });
		it("sets the user status to approved", function () {
            regResult.user.status.should.equal('approved');
        });
        it("created a welcome message", function () {
            regResult.message.should.be.defined;
        });
        it('should increment the sign in count', function () {
            regResult.user.signInCount.should.equal(1);
        });
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