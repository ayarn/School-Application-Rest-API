const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  token: {
    type: String,
  },
});

const secretKey = "thisisthesecreatekeyforjwt";

UserSchema.methods.generateAuthToken = async function () {
  try {
    const token = jwt.sign({ _id: this._id }, secretKey);
    this.token = token;
    await this.save();
    return token;
  } catch (err) {
    console.log(err);
  }
};

const User = mongoose.model("Users", UserSchema);

module.exports = User;
