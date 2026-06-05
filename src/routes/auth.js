const express = require("express");
const authRouter = express.Router();
const bcrypt = require("bcrypt");

const { UserModel } = require("../models/user");
const { validateSingupData } = require("../utils/validateSingupData");
const { generateJwtToken } = require("../middlewares/generateJwtToken");

authRouter.post("/signup", validateSingupData, async (req, res) => {
  const userInfo = new UserModel(req.body);

  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    userInfo.password = hashedPassword;
    const savedUser = await userInfo.save();
    const token = await generateJwtToken(savedUser);
    
    const userData = savedUser.toObject();
    delete userData.password;

    res.cookie("accessToken", token).status(201).json(userData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

authRouter.post("/login", async (req, res) => {
  const emailId = req.body.emailId;
  const userPassword = req.body.password;
  const savedUserDetails = await UserModel.findOne({ emailId });

  if (!savedUserDetails) return res.status(400).json({ message: "invalid credentials" });
  const validCredentials = await bcrypt.compare(
    userPassword,
    savedUserDetails.password,
  );
  if (!validCredentials) return res.status(400).json({ message: "invalid credentials" });
  const token = await generateJwtToken(savedUserDetails);
  const userData = savedUserDetails.toObject();
  delete userData.password;

  res.cookie("accessToken", token).status(200).json(userData);
});

authRouter.post("/logout", async (req, res) => {
  res
    .cookie("accessToken", null, {
      expires: new Date(Date.now()),
    })
    .status(200)
    .json({ message: "Logout successful" });
});

module.exports = { authRouter };
