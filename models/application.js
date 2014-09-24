/**
 * Created by HyveMynd on 7/20/14.
 */
var Application = function(args){
	var app = {};
	app.email = args.email;
	app.password = args.password;
	app.confirm = args.confirm;
    app.firstName = args.firstName;
    app.lastName = args.lastName;
	app.status = "pending";
	app.message = null;
    app.user = null;

	app.isValid = function(){
		return app.status === "valid";
	};

	app.invalidate = function(message){
		app.status = "invalid";
		app.message = message;
	};

	app.validate = function(){
		app.status = "valid";
	};

	app.isInvalid = function(){
		return !app.isValid();
	};
	return app;
};

module.exports = Application;