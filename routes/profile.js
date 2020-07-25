//We will put all routing regarding user profile and history here.

//Importing all packages and modules and middlewares.
const axios                 = require("axios");
const express               = require("express");
const router                = express.Router();
const db                    = require("../config/database");
const middleware            = require("../middleware");
const bcrypt                = require("bcrypt");

//========================================================================
//                            User and History
//========================================================================
//SHOW-- The User's Profile
router.get("/", middleware.isLoggedIn, function(req, res) {
    res.render("profile/optionPage.ejs");
})

//GET -- To get the new profile detail
router.get("/:userId/edit", middleware.checkUserOwnership, function(req, res){
    res.render("profile/editProfile.ejs");
})

//POST -- To submit the new data into the
router.put("/:userId", middleware.checkUserOwnership, async function(req, res) {
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
                        if (err || !results) throw err;

                        console.log(results);
                    });
            })
            .catch(err => {
                req.flash("error", "Something went wrong");
                res.redirect("back");
            })
        return res.redirect("/profile");
    } catch {
        req.flash("error", "Something went wrong");
        res.redirect("/");
    }
})

//SHOW -- Order Histories
router.get("/:userId/history", middleware.checkUserOwnership, async function(req,res) {
    const user = await req.user;
    db.query("SELECT * FROM history WHERE user_id=?", req.params.userId, 
    function(err, results, fields) {
        if (err) throw err;

        res.render("./profile/showHistory.ejs", { histories : results });
        });
})

//SHOW -- Details of an order
router.get("/:userId/history/:orderID", middleware.checkUserOwnership, async function(req, res) {
    try {
        // const userID    = user.user_id;
        // const orderID   = req.params.historyID;
        let orders = [];
        let people = [];
        var details, order;
        const orderId = req.params.orderID;
        const userID  = req.params.userId;
        const data = [
            orderId,
            userID,
        ]
        db.query("SELECT * FROM history WHERE order_id=?", req.params.orderID, 
        function(err, results, fields) {
            if (err || !results) throw err;
            // console.log(results);
            // console.log(results.length);
            if (results.length > 1){
                order = results[0];
                results.forEach(function(item) {
                    orders.push(item);
                });
            } else {
                orders = results[0];
                order  = results[0];
            }
        });
        db.query("SELECT * FROM food_history WHERE order_id=? AND user_id=?", data, 
        async function(err, results, fields) {
            if (err || !results) throw err;
    
            details = results;
            // if (orders.length > 1) {
            //     await orders.forEach(function(item) {
            //         db.query("SELECT * FROM user WHERE user_id=?", item.user_id, 
            //         function(err, results, fields) {
            //             if (err) throw err;
            //             people.push(results[0]);
            //             if (people.length === orders.length) {
            //                 return res.render("./profile/showHistoryDetails.ejs", { orders : orders, order : order, details : details, people : people});
            //             }
            //         });
            //     });
            // }
            await res.render("./profile/showHistoryDetails.ejs", { orders : orders, order : order, details : results, people : people});
        });
    } catch {
        req.flash("error", "Something went wrong")
        res.redirect("/");
    }
})

module.exports = router;