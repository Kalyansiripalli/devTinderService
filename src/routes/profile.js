const express = require("express");
const { UserModel } = require("../models/user");
const { validateJwtToken } = require("../middlewares/validateJwtToken");
const { validateProfileEditData } = require("../utils/validateProfileEditData");
const profileRouter = express.Router();
const bcrypt = require("bcrypt");

// view profile
profileRouter.get("/profile/view", validateJwtToken, async (req, res, next) => {
  try {
    const _id = req.loggedInUser._id;
    const document = await UserModel.findOne({ _id });

    res.status(200).send(document);
  } catch (error) {
    res.status(400).send(error.message);
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

      const updatedUserInfo = await loggedInUser.save();

      res.status(200).json({
        message: "user updated successfully",
        data: updatedUserInfo,
      });
    } catch (error) {
      res.status(400).send(error.message);
    }
  },
);

// forgot password

profileRouter.patch(
  "/profile/edit/password",
  validateJwtToken,
  async (req, res) => {
    try {
      const { oldPassword, updatedPassword } = req.body;
      const { loggedInUser } = req;
      if (!oldPassword || !updatedPassword) {
        return res
          .status(400)
          .send("Old password and updated password are required");
      }

      const isOldPasswordCorrect = await bcrypt.compare(
        oldPassword,
        loggedInUser.password,
      );

      if (!isOldPasswordCorrect)
        throw new Error("Old password you have entered is incorrect");
      else {
        if (oldPassword === updatedPassword)
          throw new Error("New password cannot be same as old password");
        const updatedPasswordHash = await bcrypt.hash(updatedPassword, 10);
        loggedInUser["password"] = updatedPasswordHash;
        await loggedInUser.save();
        res.status(200).send("Password updated successfully");
      }
    } catch (error) {
      res.status(400).send(error.message);
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
      res.status(200).send("deleted user successfully");
    } catch (error) {
      res.status(400).send(error.message);
    }
  },
);

module.exports = { profileRouter };
