const express = require("express");
const { dbConnect } = require("./config/database");

const app = express();

dbConnect()
  .then(() => {
    console.log("DB connection established successfully ✅");
    app.listen(3000, () => {
      console.log("Hello there running on port 3000");
    });
  })
  .catch((err) => {
    console.log(err);

    console.log("Failed to establish DB connection ❌");
  });
