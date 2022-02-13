const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema({
  body: String,
  author_id: String,
  author_username: String,
  original_post_id: String,
  date: Date,
  liked_by: [String],
  disliked_by: [String]
});

module.exports = mongoose.model('Comment', commentSchema);