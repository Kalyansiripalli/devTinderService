const express = require("express");
const requestRouter = express.Router();

// sample route
requestRouter.get("", () => {});

module.export = { requestRouter };
