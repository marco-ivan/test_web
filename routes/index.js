//This is where we save all the root routes.

//Importing all packages and modules and middlewares.
const express           = require("express");
const router            = express.Router();
const passport          = require("passport");
const db                = require("../config/database");


//========================================================================
//                          Used for login purposes
//========================================================================

//The next 2 functions is to search the user in the database using the user_id.
async function findUserWithId(id) {
    const result = await findUserWithIdPromise(id);
    return result;
}

function findUserWithIdPromise(id) {
    return new Promise((resolve, reject) => {
        db.query("SELECT * FROM user WHERE user_id = ?", id,
            (err, results, fields) => {
                return err ? reject(err) : resolve(results[0]);
            });
    })
};

//The next 2 functions is to search the user in the database using the username.
async function findUserWithUsername(username) {
    const result = await findUserWithUsernamePromise(username);
    console.log(result);
    return result;
}

function findUserWithUsernamePromise(username) {
    return new Promise((resolve, reject) => {
        db.query("SELECT * FROM user WHERE Username = ?", username,
            (err, results, fields) => {
                return err ? reject(err) : resolve(results[0]);
            });
    })
};

//========================================================================
//                                  Route
//========================================================================
//Home page
router.get('/', function (req, res) {
    res.render("home/index.ejs");
})

//About Us page
router.get("/about_us", function (req, res) {
    res.render("home/aboutUs.ejs");
})

//Guide page
router.get("/guide", function (req, res) {
    res.render("home/guide.ejs");
})

// Login page
router.get("/login", function (req, res) {
    res.render("before_login/login.ejs");
})

// Login
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/",
        failureRedirect: "/login",
        failureFlash: true
    }), function (req, res) {
})

// Registration page
router.get("/register", function (req, res) {
    res.render("before_login/registration.ejs");
})

//Logout route
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/");
 });

module.exports = router;