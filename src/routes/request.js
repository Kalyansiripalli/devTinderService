const express = require("express");
const requestRouter = express.Router();
const { validateJwtToken } = require("../middlewares/validateJwtToken");
const { UserModel } = require("../models/user");
const { ConnectionRequestModel } = require("../models/connectionRequest");

requestRouter.post(
  "/request/send/:status/:toUserId",
  validateJwtToken,
  async (req, res, next) => {
    try {
      const { status, toUserId } = req.params;
      const { loggedInUser } = req;
      const fromUserId = loggedInUser._id;
      const ids = [toUserId, fromUserId];

      if (!fromUserId || !toUserId || !status)
        return res
          .status(400)
          .json({ message: "insufficient data to process the request" });

      const allowedStatus = ["interested", "ignored"];

      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "invalid status type" });
      }

      const count = await UserModel.countDocuments({ _id: { $in: ids } });
      if (!(count === ids.length))
        return res.status(400).json({ message: "user not found" });

      if (fromUserId.toString() === toUserId)
        return res
          .status(400)
          .send("you cant send connection request to yourself");
      const requestAlreadyExist = await ConnectionRequestModel.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (requestAlreadyExist)
        return res
          .status(400)
          .json({ message: "duplicate request, request already exist" });

      const requestInfo = new ConnectionRequestModel({
        fromUserId,
        toUserId,
        status,
      });
      await requestInfo.save();
      return res.status(200).json({ message: "request sent " });
    } catch (error) {
      res.status(500).send(error.message);
    }
  },
);

requestRouter.post(
  "/request/respond/:status/:requestId",
  validateJwtToken,
  async (req, res, next) => {
    try {
      const accessTokenId = req.loggedInUser._id;
      const requestId = req.params.requestId;
      const status = req.params.status;
      // status, accessTokenId, requestId must exist to process the api
      if (!accessTokenId || ! requestId || !status)
        return res
          .status(400)
          .json({ message: "Insufficent Data to process the request" });
      // status can be either ["accepted", "rejected"]
      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status))
        return res
          .status(400)
          .json("status must me one of accepted, rejected ");

      // accessTokenId should be an valid userId - check this (Usermodel)
      const savedToUserData = await UserModel.findOne({ _id: accessTokenId });
      if (!savedToUserData)
        return res.status(400).json({ message: "invalid user" });

      // requestId must be valid - check this (ConnectionRequestModel)
      // only toUser of the reqest can respond
      // touser can only respond once -> ie, status not in ["accepted", "rejected"]
      // cant respond to ingrored requests
      const savedRequestInfo = await ConnectionRequestModel.findOne({
        _id: requestId,
        toUserId: accessTokenId,
        status: "interested",
      });

      if (!savedRequestInfo)
        return res.status(400).json({ message: "request not found" });

      savedRequestInfo.status = status;
      await savedRequestInfo.save();
      res.status(200).send("responded successfully");
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

module.exports = { requestRouter };
