const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateJwtToken = async (payload) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error("JWT_SECRET is not configured");

  const token = await jwt.sign(
    {
      data: {
        _id: payload._id,
        email: payload.emailId,
      },
    },
    jwtSecret,
    { expiresIn: "7d" },
  );
  return token;
};
module.exports = { generateJwtToken };
