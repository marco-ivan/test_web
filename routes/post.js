//We will store all the routing that is connected to forum(post). 


//Importing all packages and modules and middlewares.
const express                 = require("express");
const router                  = express.Router();
const Post                    = require("../models/post");
const middleware              = require("../middleware");



//=====================================================================
//                           Forum(Post)
//=====================================================================
//SHOW -- To show all the posts
router.get("/", function (req, res) {
    //Get all the post and discussion from the DB
    Post.find({}, function (err, allPosts) {
        if (err) {
            console.log(err);
        } else {
            res.render("post/show.ejs", { posts: allPosts });
        }
    });
})

//NEW -- To create a new post in the forum.
router.get("/new", middleware.isLoggedIn, function (req, res) {
    res.render("post/new.ejs");
})

//CREATE -- To put the new post into the database (MongoDB).
router.post("/", middleware.isLoggedIn, async function (req, res) {
    const user = await req.user;
    //Storing data into our DB
    Post.create(req.body.post, function (err, newPost) {
        if (err) {
            req.flash("error", err.message);
            res.redirect("back");
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
router.get("/:id", function (req, res) {
    //find the post with provided ID
    Post.findById(req.params.id).populate("comments").exec(function (err, foundPost) {
        if (err) {
            console.log(err);
        } else {
            //render show template with that post
            res.render("post/showPost.ejs", { post: foundPost });
        }
    });
})

// EDIT POST ROUTE
router.get("/:id/edit", middleware.checkPostOwnership, function (req, res) {
    Post.findById(req.params.id, function (err, foundPost) {
        res.render("post/editPost.ejs", { post: foundPost });
    });
});

// UPDATE POST ROUTE
router.put("/:id", middleware.checkPostOwnership, function (req, res) {
    // Find and Update the CORRECT post
    Post.findByIdAndUpdate(req.params.id, req.body.post, function (err, updatedPost) {
        if (err) {
            res.redirect("back");
        } else {
            //redirect somewhere(show page)
            res.redirect("/forum/" + req.params.id);
        }
    });
});

// DESTROY POST ROUTE
router.delete("/:id", middleware.checkPostOwnership, function (req, res) {
    //Deleting the Post from the DB
    Post.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            res.redirect("/forum");
        } else {
            res.redirect("/forum");
        }
    });
});

module.exports = router;