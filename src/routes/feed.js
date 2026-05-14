const express = require("express");
const { validateJwtToken } = require("../middlewares/validateJwtToken");
const { UserModel } = require("../models/user");
const { ConnectionRequestModel } = require("../models/connectionRequest");

const feedRouter = express();

feedRouter.get("/feed", validateJwtToken, async (req, res) => {
  try {
    // correct set of users
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { loggedInUser } = req;

    const requests = await ConnectionRequestModel.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const hiddenUsers = new Set();

    hiddenUsers.add(loggedInUser._id.toString());

    requests.forEach((request) => {
      hiddenUsers.add(request.toUserId.toString());
      hiddenUsers.add(request.fromUserId.toString());
    });

    const allUsers = await UserModel.find({
      _id: { $nin: [...hiddenUsers] },
    }).select("_id firstName lastName age gender photoUrl about skills");

    res.status(200).json({ data: allUsers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = { feedRouter };
