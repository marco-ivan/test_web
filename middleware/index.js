//This is where we put all the middlewares that are going to be called in the main (app.js) server file.

const Post      = require("../models/post");
const Comment   = require("../models/comment");
const sqlDB     = require("../config/database");
const db = require("../config/database");

// all the middleare goes here
var middlewareObj = {};

middlewareObj.checkPostOwnership = async function (req, res, next) {
  const user = await req.user;
  if (req.isAuthenticated()) {
    Post.findById(req.params.id, function (err, foundPost) {
      if (err || !foundPost) {
        req.flash("error", "Post not found");                          //Error message
        res.redirect("back");
      } else {
        // does user own the post?
        if (foundPost.author.id == user.user_id) {
          next();
        } else {
          req.flash("error", "You don't have permission to do that");   //Error Message
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to be logged in to do that");            //Error Message
    res.redirect("back");
  }
}

middlewareObj.checkCommentOwnership = async function (req, res, next) {
  const user = await req.user;
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, function (err, foundComment) {
      if (err || !foundComment) {
        req.flash("error", "Comment not found"); 
        res.redirect("back");
      } else {
        // does user own the comment?
        if (foundComment.author.id == user.user_id) {
          next();
        } else {
          req.flash("error", "You don't have permission to do that");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to be logged in to do that");
    res.redirect("back");
  }
}

middlewareObj.checkUserOwnership = async function(req, res, next) {
  const user = await req.user;
  if (req.isAuthenticated()) {
    db.query("SELECT * FROM user WHERE user_id=?", req.params.userId, 
    function(err, results, fields) {
      if (err || !results) {
        req.flash("error", "Something went wrong");
        res.redirect("back");
      } else {
        //Does the user own that ID?
        if (results[0].Username === user.Username) {
          next();
        } else {
          req.flash("error", "You don't have permission to do that");
          res.redirect("back")
        }
      }
    });
  } else {
    req.flash("error", "You need to be logged in to do that");
    res.redirect("back");
  }
}

middlewareObj.isLoggedIn = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You need to be logged in to do that");
  res.redirect("/login");
}

module.exports = middlewareObj;