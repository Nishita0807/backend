const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const followSchema = new Schema({
  followerUserId: {
    //fk to user table
    type: Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
  followingUserId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
  creationDateTime: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("follow", followSchema);