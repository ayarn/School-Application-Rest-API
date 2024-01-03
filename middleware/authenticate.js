const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const secretKey = "thisisthesecreatekeyforjwt";

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers["token"];
    const verifyToken = jwt.verify(token, secretKey);

    const currentUser = await User.findOne({
      _id: verifyToken._id,
      token: token,
    });

    if (!currentUser) {
      throw new Error("User not found");
    }

    req.token = token;
    req.currentUser = currentUser;

    next();
  } catch (err) {
    res.status(401).json("Unauthorized: No token found");
    console.log(err);
  }
};

module.exports = authenticate;
