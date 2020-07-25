//We will save all routing regarding the post's comment here.

//Importing all packages and modules and middlewares.
const express               = require("express");
const router                = express.Router({ mergeParams: true });
const Post                  = require("../models/post");
const Comment               = require("../models/comment");
const middleware            = require("../middleware");
<<<<<<< HEAD
const expressSanitizer      = require("express-sanitizer");     //Sanitizing the textarea input.
=======
>>>>>>> 75c601e34e0b5a74bfcc9a0269a1974e686057f9


//=====================================================================
//                           Post's Comment
//=====================================================================

//Comments CREATE
router.post("/", middleware.isLoggedIn, async function (req, res) {
    const user = await req.user;
<<<<<<< HEAD
    req.body.comment.text = req.sanitize(req.body.comment.text);
=======
>>>>>>> 75c601e34e0b5a74bfcc9a0269a1974e686057f9
    //lookup Post using ID
    Post.findById(req.params.id, function (err, foundPost) {
        if (err) {
            console.log(err);
            res.redirect("/forum");
        } else {
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    req.flash("error", "Something went wrong");
                    console.log(err);
                    res.redirect("back");
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
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function (req, res) {
<<<<<<< HEAD
    Post.findById(req.params.id, function (err, foundCampground) {
        if (err || !foundCampground) {
            req.flash("error", "No post found");
            res.redirect("back");
        }
        //Finding the comment details in the DB
        Comment.findById(req.params.comment_id, function (err, foundComment) {
            if (err || !foundComment) {
                req.flash("error", "Comment not found");
                res.redirect("back");
            } else {
                res.render("./comments/edit.ejs", { post_id: req.params.id, comment: foundComment });
            }
        })
=======
    //Finding the comment details in the DB
    Comment.findById(req.params.comment_id, function (err, foundComment) {
        if (err) {
            req.flash("error", "Something went wrong");
            res.redirect("back");
        } else {
            res.render("./comments/edit.ejs", { post_id: req.params.id, comment: foundComment });
        }
>>>>>>> 75c601e34e0b5a74bfcc9a0269a1974e686057f9
    });
});

// COMMENT UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
<<<<<<< HEAD
    req.body.comment.text = req.sanitize(req.body.comment.text);
=======
>>>>>>> 75c601e34e0b5a74bfcc9a0269a1974e686057f9
    //// Find and Update the CORRECT Comment
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment) {
        if (err) {
            req.flash("error", "Something went wrong");
            res.redirect("back");
        } else {
            res.redirect("/forum/" + req.params.id);
        }
    });
});

// COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    //findByIdAndRemove the CORRECT comment
    Comment.findByIdAndRemove(req.params.comment_id, function (err) {
        if (err) {
            req.flash("error", "Something went wrong");
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/forum/" + req.params.id);
        }
    });
});

module.exports = router;