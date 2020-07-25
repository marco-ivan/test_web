//Mix n Match Routing and Authentication file

//Including all the npm packages to this file after installing it using npm install and write is as a dependency
//to the file.
require('dotenv').config();                                     //For including hidden data in dotenv file.
const axios                 = require("axios");                 //To do API Calls.
const mysql                 = require("mysql");                 //To include and manipulate data from MySQL.
const bcrypt                = require("bcrypt");                //To turn the password into some non-readable string.
const express               = require("express");               //The main routing system for all the webpages.
const mongoose              = require("mongoose");              //To connect to mongoDB database.
const passport              = require("passport");              //As a part of the Authentication feature in our web.
const bodyParser            = require("body-parser");           //To parse incoming request bodies in a middleware before the handlers.
const jwt                   = require("jsonwebtoken");          //As a part of the Authentication feature in our web.
const middleware            = require("./middleware");          //importing all the middlewares from other file.
const flash2                = require("connect-flash");         //To display flash messages in certain webpages.
const flash                 = require("express-flash");         //To display flash messages in certain webpages.
const session               = require("express-session");       //To store the user.
const methodOverride        = require("method-override");       //To Override method so that we can use PUT and DELETE.
const db                    = require("./config/database");     //Importing the database.
const initializePassport    = require("./passport-config");     //Requiring (importing) passport initialization from other file.
const expressSanitizer      = require("express-sanitizer");     //Sanitizing the textarea input.

//requiring routes
const indexRoutes       = require("./routes/index");
const profileRoutes     = require("./routes/profile");
const commentRoutes     = require("./routes/comment");
const postRoutes        = require("./routes/post");

//Starting the Express JS Package
const app = express();

//Body-parser usage template
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());

//To set the file so that we don't have to type ".ejs" in the end of the file name while rendering.
//res.render('index') instead of res.render('index.ejs')
app.set('view-engine', 'ejs');

//Using the Method Override
app.use(methodOverride("_method"));

//Using the Flash-connect feature
app.use(flash2());

//Initializing the Passport NPM feature.
initializePassport(passport, findUserWithUsername, findUserWithId);

//Set up default mongoose connection
var mongoDB = 'mongodb://127.0.0.1/testOrb';
mongoose.connect(mongoDB, { useNewUrlParser: true });

//Get the default connection
var db2 = mongoose.connection;

//To read the "views" directory while searching for file.
app.use(express.static("views"));
app.use(express.static(__dirname + "/public"));

//Authentication features
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());

//Connecting the file to the Localhost Server.
app.listen(3000, () => console.log("Listening at port 3000"));

//To always pass some variables and values to every page
app.use(async function(req, res, next){
    res.locals.currentUser = await req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
 });

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

//======================================================================================================================
//                                                  ROUTING  
//======================================================================================================================
app.use("/", indexRoutes);
app.use("/forum", postRoutes);
app.use("/forum/:id/comments", commentRoutes);
app.use("/profile", profileRoutes);

//======================================================================================================================
//                                                  VALIDATION  
//======================================================================================================================
//Username validation
app.post("/check_username", function(req, res) {
    var username = req.body.username;

    db.query("SELECT * FROM user WHERE Username = ?", username, 
        function(err, results, fields) {
            if (err) throw err;

            if (results.length != 0) {
                return res.send("Username is Taken!");
            } else {
                return res.send("");
            }
    })
})

// Mobile number validation
app.post("/check_mobile_number", function (req, res) {
    var mobile_number = req.body.mobile_number;

    if (!mobile_number.startsWith("+65")) {
        mobile_number = "+65" + mobile_number;
    }

    if (mobile_number.split(" ").length == 2) {
        mobile_number = mobile_number.replace(" ", "");
    }

    db.query("SELECT * FROM user WHERE Mobile_number = ?", mobile_number,
        function (err, results, fields) {
            if (err) throw err;

            if (results.length != 0) {
                return res.send("Mobile number taken!");
            } else {
                return res.send("");
            }
        })
})

// Email validation
app.post("/check_email", function (req, res) {
    var email = req.body.email;
    //Checking whether there is the same email registered already or not.
    db.query("SELECT * FROM user WHERE Email = ?", email,
        function (err, results, fields) {
            if (err) throw err;

            if (results.length != 0) {
                return res.send("Email is used!");
            } else {
                return res.send("");
            }
        })
})

// Sign up process (putting to the database)
app.post("/register", async function (req, res) {
    try {
        //Storing the Users detail into variable
        var username            = req.body.username_input;
        var password            = await bcrypt.hash(req.body.password_input, 10);
        var email               = req.body.email_input;
        var addressInput        = req.body.address_autocomplete;
        var mobile_number       = req.body.mobile_number_input;
        var token, longitude, latitude;
        // Creating the token for the user
        const user = {
            username        : username,
            password        : password,
            email           : email,
            address         : addressInput,
            mobile_number   : mobile_number
        }
        token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);

        if (!mobile_number.startsWith("+65")) {
            mobile_number = "+65" + mobile_number;
        }
        if (mobile_number.split(" ").length == 2) {

            mobile_number = mobile_number.replace(" ", "");
        }

        // Getting all the longitude and latitude of the place
        var geocodeURL = "https://maps.googleapis.com/maps/api/geocode/json";
        axios.get(geocodeURL, {
            params: {
                key: "AIzaSyDIWEKaDIthMAPmibgP4PEIUuNeCP69fi0", // googleMapAPI key
                address: addressInput
            }
        })
            .then(response => {
                longitude = response.data.results[0].geometry.location.lng;
                latitude = response.data.results[0].geometry.location.lat;
                // Inserting into the database
                var data = [
                    username,           // Username
                    password,           // Password
                    email,              // Email
                    addressInput,       // Address
                    token,              // Token
                    mobile_number,      // Mobile_number
                    longitude,          // Longitude
                    latitude,           // Latitude
                    2                   // Status
                ];
                db.query("INSERT INTO user (Username, Password, Email, " +
                    "Address, Token, Mobile_number, Longitude, Latitude, Status) VALUES (?)", [data],
                    function (err, results, fields) {
                        if (err) throw err;

                        console.log(results);
                    });
            })
            .catch(err => {
                console.log(err);
            })
        return res.redirect("/login");
    } catch {
        res.redirect("/registration");
    }
});

//Other Routes
app.get("*", function(req, res) {
    req.flash("error", "Route not Available");
    res.redirect("/")
})