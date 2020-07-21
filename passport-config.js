

//Setting up the file by importing modules from the npms.
const localStrategy = require('passport-local').Strategy;
const bcrypt = require("bcrypt");

function initialize(passport, findUserWithUsername, findUserWithId) {
    const authenticateUser = async (username, password, done) => {
        const user = await findUserWithUsername(username);

        console.log("This is user in initialize: " + user);

        if (user == null) {
            return done(null, false, {message: "Username not found"});
        }

        try {
            console.log(user.Password);
            if (await bcrypt.compare(password, user.Password)) {
                return done(null, user);
            } else {
                return done(null, false, {message: "Password incorrect"});
            }
        } catch (e) { 
            return done(e);
        }

    }

    passport.use(new localStrategy({
            usernameField: 'username_input', 
            passwordField: 'password_input'
        }, 
        authenticateUser));

    passport.serializeUser((user, done) => { done(null, user.user_id)});
    passport.deserializeUser((id, done) => { 
        done(null, findUserWithId(id));
    });
}

module.exports = initialize;