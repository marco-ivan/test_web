//Mix n Match Routing and Authentication file

//Including all the npm packages to this file after installing it using npm install and write is as a dependency
//to the file.
require('dotenv').config();

const axios                 = require("axios");                 //To do API Calls.
const mysql                 = require("mysql");                 //To include and manipulate data from MySQL.
const bcrypt                = require("bcrypt");                //
const express               = require("express");               //The main routing system for all the webpages.
const mongoose              = require("mongoose");              //To connect to mongoDB database.
const passport              = require("passport");              //As a part of the Authentication feature in our web.
const bodyParser            = require("body-parser");           //To parse incoming request bodies in a middleware before the handlers.
const jwt                   = require("jsonwebtoken");          //As a part of the Authentication feature in our web.
const middleware            = require("./middleware");          //importing all the middlewares from other file.
const flash2                = require("connect-flash");         //To display flash messages in certain webpages.
const flash                 = require("express-flash");         //
const session               = require("express-session");       //To store the user.
const methodOverride        = require("method-override");       //To Override method so that we can use PUT and DELETE.
const db                    = require("./config/database");     //Importing the database.
const initializePassport    = require("./passport-config");     //Requiring (importing) passport initialization from other file.


//Importing the Database for MongoDB datas
const Post      = require("./models/post");
const Comment   = require("./models/comment");
const middlewareObj = require('./middleware');


//Starting the Express JS Package
const app = express();

//Body-parser usage template
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

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

// // Local database connection
// const db = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: "adminpass",
//     database: "world"
// });

// // Remote database connection
// // const db = mysql.createConnection({
// //     host: "us-cdbr-east-02.cleardb.com",
// //     user: "bd54a33decc040",
// //     password: "be8e7ce8556c9ff",
// //     database: "	heroku_54e8d758703d17f"
// // })


//Connecting the file to the Localhost Server.
app.listen(3000, () => console.log("Listening at port 3000"));

//To read the "views" directory while searching for file.
app.use(express.static("views"));
app.use(express.static(__dirname + "/style"));

//Authentication features
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());

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

//========================================================================
//                                  Route
//========================================================================
//Home page
app.get('/', function(req, res) {
    res.render("index.ejs");
})

//About Us page
app.get("/about_us", function(req,res) {
    res.render("aboutUs.ejs");
})

//Guide page
app.get("/guide", function (req, res) {
    res.render("guide.ejs");
})

// Login page
app.get("/login", function (req, res) {
    res.render("login.ejs");
})
// Login
app.post("/login", passport.authenticate("local", 
{
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash : true
}), function(req, res){
});


// // Login success page
// app.get("/login_success", middleware.isLoggedIn, async function (req, res) {
//     var user = await req.user;

//     res.render("login_success");
// })

//=====================================================================
//                           Forum(Post)
//=====================================================================
//SHOW -- To show all the posts
app.get("/forum", function(req, res) {
    Post.find({}, function(err, allPosts){
        if(err){
            console.log(err);
        } else {
           res.render("./post/show.ejs",{posts : allPosts});
        }
     });
})

//NEW -- To create a new post in the forum.
app.get("/forum/new", middleware.isLoggedIn, function(req, res) {
    res.render("./post/new.ejs");
})

//CREATE -- To put the new post into the database (MongoDB).
app.post("/forum", middleware.isLoggedIn, async function(req,res) {
    const user = await req.user;
    Post.create(req.body.post, function(err, newPost){
        if (err) {
            console.log(err);
        } else {
            //add username and user_id to the comment.
            newPost.author.id = user.user_id;
            newPost.author.username = user.Username;
            //save Post
            newPost.save();
            console.log(newPost);
            res.redirect("/forum");
        }
    })
})

//SHOW -- To show specific post
app.get("/forum/:id", function(req, res) {
    //find the post with provided ID
    Post.findById(req.params.id).populate("comments").exec(function(err, foundPost){
        if(err){
            console.log(err);
        } else {
            console.log(foundPost)
            //render show template with that post
            res.render("./post/showPost.ejs", {post: foundPost});
        }
    });
})

// EDIT POST ROUTE
app.get("/forum/:id/edit", middleware.checkPostOwnership, function(req, res){
    Post.findById(req.params.id, function(err, foundPost){
        res.render("./post/editPost.ejs", {post : foundPost});
    });
});

// UPDATE POST ROUTE
app.put("/forum/:id", middleware.checkPostOwnership, function(req, res){
    // find and update the correct post
    Post.findByIdAndUpdate(req.params.id, req.body.post, function(err, updatedPost){
       if(err){
           res.redirect("/forum");
       } else {
           //redirect somewhere(show page)
           res.redirect("/forum/" + req.params.id);
       }
    });
});

// DESTROY POST ROUTE
app.delete("/forum/:id", middleware.checkPostOwnership, function(req, res){
   Post.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/forum");
      } else {
          res.redirect("/forum");
      }
   });
});

//=====================================================================
//                           Post's Comment
//=====================================================================
// //Comments New
// app.get("/forum/:id/comments/new", function(req, res){
//     // find Post by id
//     console.log(req.params.id);
//     Post.findById(req.params.id, function(err, foundPost){
//         if(err){
//             console.log(err);
//         } else {
//              res.render("./comments/new.ejs", {post : foundPost});
//         }
//     })
// });

//Comments Create
app.post("/forum/:id/comments", middleware.isLoggedIn, async function(req, res){
    const user = await req.user;
   //lookup Post using ID
   Post.findById(req.params.id, function(err, foundPost){
       if(err){
           console.log(err);
           res.redirect("/forum");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               req.flash("error", "Something went wrong");
               console.log(err);
           } else {
               //add username and id to comment
               comment.author.id = user.user_id;
               comment.author.username = user.Username;
               //save comment
               comment.save();
               foundPost.comments.push(comment);
               foundPost.save();
               console.log(comment);
               req.flash("success", "Successfully added comment");
               res.redirect('/forum/' + foundPost._id);
           }
        });
       }
   });
});

// COMMENT EDIT ROUTE
app.get("/forum/:id/comments/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
   Comment.findById(req.params.comment_id, function(err, foundComment){
      if(err){
          res.redirect("back");
      } else {
        res.render("./comments/edit.ejs", {post_id: req.params.id, comment: foundComment});
      }
   });
});

// COMMENT UPDATE
app.put("/forum/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req, res){
    console.log(req.body.comment)
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
      if(err){
          res.redirect("back");
      } else {
          res.redirect("/forum/" + req.params.id );
      }
   });
});

// COMMENT DESTROY ROUTE
app.delete("/forum/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req, res){
    //findByIdAndRemove
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
           res.redirect("back");
       } else {
           req.flash("success", "Comment deleted");
           res.redirect("/forum/" + req.params.id);
       }
    });
});

//========================================================================
//                            User and History
//========================================================================
//Profile
app.get("/profile", function(req, res) {
    res.render("./profile/optionPage.ejs");
})

//GET -- To get the new profile detail
app.get("/profile/:userId/edit", function(req, res){
    res.render("./profile/editProfile.ejs");
})

//POST -- To submit the new data into the
app.put("/profile/:userId", async function(req, res) {

    try {
        //Storing the Users detail into variable
        var id                  = req.params.userId;
        var username            = req.body.username_input;
        var password            = await bcrypt.hash(req.body.password_input, 10);
        var email               = req.body.email_input;
        var addressInput        = req.body.address_autocomplete;
        var mobile_number       = req.body.mobile_number_input;
        var longitude, latitude;

        if (!mobile_number.startsWith("+65")) {
            mobile_number = "+65" + mobile_number;
        }

        if (mobile_number.split(" ").length == 2) {

            mobile_number = mobile_number.replace(" ", "");
        }


        // Getting all the longitude and latitude of the place
        var geocodeURL = "https://maps.googleapis.com/maps/api/geocode/json";

        console.log(addressInput);


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
                    mobile_number,      // Mobile_number
                    longitude,          // Longitude
                    latitude,           // Latitude
                    id,                 // user_id
                ];

                db.query("UPDATE user SET Username = ?, Password = ?, Email = ?, Address = ?, " +
                "Mobile_number = ?, Longitude = ?, Latitude = ? WHERE user_id=?", data,
                    function (err, results, fields) {
                        if (err) throw err;

                        console.log(results);
                    });
            })
            .catch(err => {
                console.log(err);
            })

        return res.redirect("/profile");
    } catch {
        res.redirect("/");
    }
})

//========================================================================

// Sign up

// Registration page
app.get("/register", function (req, res) {
    res.render("registration.ejs");
})

//Logout route
app.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/");
 });

//Username validation
app.post("/check_username", function(req, res) {
    var username = req.body.username;

    db.query("SELECT * FROM user WHERE Username = ?", username, 
        function(err, results, fields) {
            if (err) throw err;

            console.log(results);

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

            console.log(results);

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

            console.log(results);

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

        console.log(addressInput);


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