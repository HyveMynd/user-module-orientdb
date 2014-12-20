/**
 * Created by Andres Monroy (HyveMynd) on 12/19/14.
 */
var RegistrationApplication = function(args){
    var reg = {};

    reg.email = args.email;
    reg.password = args.password;
    reg.confirm = args.confirm;
    reg.firstName = args.firstName;
    reg.lastName = args.lastName;
    reg.status = "pending";
    reg.token = args.token || null;
    reg.expiration = args.expiration || null;

    return reg;
};

module.exports = RegistrationApplication;