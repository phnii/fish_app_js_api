const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "ユーザー名を入力してください"],
    unique: true
  },
  email: {
    type: String,
    required: [true, "メールアドレスを入力してください"],
    unique: [true, "登録済みのメールアドレスです"],
    lowercase: true
  },
  password: {
    type: String,
    required: [true, "パスワードを入力してください"],
    minlength: [8, "パスワードは8文字以上入力してください"],
  },
  introduce: {
    type: String
  },
  followers: [{
    type: Schema.Types.ObjectId, ref: "User"
  }],
  followings: [{
    type: Schema.Types.ObjectId, ref: "User"
  }],
  // rooms: [{
  //   type: Schema.Types.ObjectId, ref: "Room"
  // }]
});

// Encrypt password using bcrypt
userSchema.pre("save", async function(next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignJwtToken = function() {
  return jwt.sign({ id: this._id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
}

userSchema.methods.isFollowing = function(target) {
  for (let i = 0; i < this.followings.length; i++) {
    if (this.followings[i]._id.toString() === target._id.toString())
      return true;
  }
  return false;
};

userSchema.methods.hasARoomWith = function(anotherUser) {
  for (let i = 0; i < this.rooms.length; i++) {
    if (anotherUser.rooms.includes(this.rooms[i]._id)) {
      return this.rooms[i]._id;
    }
  }
  return false;
}

module.exports = mongoose.model("User", userSchema);
