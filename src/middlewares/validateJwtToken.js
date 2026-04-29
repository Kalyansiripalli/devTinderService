const { UserModel } = require("../models/user");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const validateJwtToken = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) throw new Error("Please Login to access this resource");
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error("JWT_SECRET is not configured");
    const decodedData = await jwt.verify(accessToken, jwtSecret);
    const { _id } = decodedData?.data;
    const document = await UserModel.findOne({ _id });
    if (!document) throw new Error("Invalid Token");
    else {
      req.loggedInUser = document;
      next();
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

module.exports = { validateJwtToken };
