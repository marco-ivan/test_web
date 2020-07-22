var mongoose = require("mongoose");

var postSchema = new mongoose.Schema({
   title: {
      type : String, 
      required : [true, 'Title Required']
   },
   content: {
      type : String,
      Required : [true, 'Message Required']
   },
   author: {
      id: String,
      username: String
   },
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ],
   created:  {type: Date, default: Date.now}
});

module.exports = mongoose.model("Post", postSchema);