const express = require("express");
const { UserModel } = require("../models/user");
const { validateJwtToken } = require("../middlewares/validateJwtToken");
const { validateProfileEditData } = require("../utils/validateProfileEditData");
const profileRouter = express.Router();
const bcrypt = require("bcrypt");
const { isStrongPassword } = require("validator");

// view profile
profileRouter.get("/profile/view", validateJwtToken, async (req, res, next) => {
  try {
    const _id = req.loggedInUser._id;
    const document = await UserModel.findOne({ _id }).select(
      "_id firstName lastName emailId age gender photoUrl about skills",
    );

    res.status(200).json(document);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// update profile
profileRouter.patch(
  "/profile/edit",
  validateJwtToken,
  async (req, res, next) => {
    try {
      const validationResult = validateProfileEditData(req);

      if (!validationResult.isValid) {
        return res.status(400).json({
          message: "invalid edit request",
          notAllowedFields: validationResult.notAllowedFields,
        });
      }

      const { loggedInUser } = req;

      Object.keys(req.body).forEach((key) => {
        loggedInUser[key] = req.body[key];
      });

      await loggedInUser.save();
      const updatedUserInfo = await UserModel.findById(loggedInUser._id).select(
        "_id firstName lastName emailId age gender photoUrl about skills",
      );

      res.status(200).json({
        message: "profile data updated successfully",
        data: updatedUserInfo,
      });
    } catch (error) {
      console.error("Profile Edit Error:", error);
      res.status(400).json({ message: "Invalid Edit Request." });
    }
  },
);

profileRouter.patch(
  "/profile/password/edit",
  validateJwtToken,
  async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const { loggedInUser } = req;
      if (!oldPassword || !newPassword) {
        return res
          .status(400)
          .json({ message: "Old password and new password are required" });
      }

      const isOldPasswordCorrect = await bcrypt.compare(
        oldPassword,
        loggedInUser.password,
      );

      if (!isOldPasswordCorrect) throw new Error("Old password is incorrect");
      else {
        if (oldPassword === newPassword)
          throw new Error("New password cannot be same as old password");
        if (!isStrongPassword(newPassword))
          throw new Error("new password is not strong enough");
        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        loggedInUser["password"] = newPasswordHash;
        await loggedInUser.save();
        res.status(200).json({ message: "Password updated successfully" });
      }
    } catch (error) {
      console.error("Password Edit Error:", error);
      res.status(400).json({ message: error.message });
    }
  },
);

// delete profile
profileRouter.delete(
  "/profile/delete",
  validateJwtToken,
  async (req, res, next) => {
    try {
      const _id = req.loggedInUser._id;
      await UserModel.findByIdAndDelete({ _id });
      res.status(200).json({ message: "deleted user successfully" });
    } catch (error) {
      res.status(400).send(error.message);
    }
  },
);

module.exports = { profileRouter };
