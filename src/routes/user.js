const express = require("express");
const { validateJwtToken } = require("../middlewares/validateJwtToken");
const { ConnectionRequestModel } = require("../models/connectionRequest");
const userRouter = express.Router();

userRouter.get(
  "/user/requests/pending",
  validateJwtToken,
  async (req, res) => {
    // toUserId -> from access token
    //  all the requests from the ConnectionRequest collection and status are interested
    try {
      const { loggedInUser } = req;
      const toUserId = loggedInUser._id;
      const pendingRequests = await ConnectionRequestModel.find({
        toUserId,
        status: "interested",
      })
        .populate(
          "fromUserId",
          "_id firstName lastName age gender photoUrl about skills",
        )
        .populate(
          "toUserId",
          "_id firstName lastName age gender photoUrl about skills",
        );
      if (!pendingRequests.length)
        return res.status(200).json({ data: [], message: "No requests found" });
      const data = pendingRequests.map((obj) => ({
        requestId: obj._id,
        ...obj.fromUserId.toJSON(),
      }));
      res.status(200).json({ data });
    } catch (error) {
      res.status(500).send(error.message);
    }
  },
);

userRouter.get("/user/connections", validateJwtToken, async (req, res) => {
  try {
    const { loggedInUser } = req;
    const toUserId = loggedInUser._id;
    if (!toUserId)
      return res
        .status(404)
        .json({ message: "Insufficient data to process the request" });

    const connectionData = await ConnectionRequestModel.find({
      $or: [{ toUserId }, { fromUserId: toUserId }],
      status: "accepted",
    })
      .populate(
        "toUserId",
        "_id firstName lastName age gender photoUrl about skills",
      )
      .populate(
        "fromUserId",
        "_id firstName lastName age gender photoUrl about skills",
      );

    const data = connectionData.map((obj) => {
      if (loggedInUser._id.toString() == obj.toUserId._id.toString())
        return obj.fromUserId;
      else if (loggedInUser._id.toString() == obj.fromUserId._id.toString())
        return obj.toUserId;
    });

    if (!data.length)
      return res.status(404).json({ message: "No connection requests", data });
    return res.status(200).json({ data });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = { userRouter };
