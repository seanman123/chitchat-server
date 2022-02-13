const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new Schema({
  body: String,
  author_id: String,
  author_username: String,
  latitude: Number,
  longitude: Number,
  date: Date,
  liked_by: [String],
  disliked_by: [String]
});

module.exports = mongoose.model('Post', postSchema);