//after login check for cookie and populate the req
const User = require("../model/user");
const jwt = require("jsonwebtoken");
const CustomError = require("../util/Error/CustomError");

exports.isAuth = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return next(CustomError.unauthorized("Please login first to proceed"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      console.log("JWT Malformed");
      return next(CustomError.unauthorized("Please login first to proceed"));
    }
  } catch (error) {
    return next(new Error(error));
  }
  return next();
};
