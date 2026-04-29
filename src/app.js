const express = require("express");
const { dbConnect } = require("./config/database");
const { authRouter } = require("./routes/auth");
const { profileRouter } = require("./routes/profile");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/", authRouter);
app.use("/", profileRouter);

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
