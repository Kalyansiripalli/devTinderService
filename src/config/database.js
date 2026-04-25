const mongoose = require("mongoose");

const dbConnect = async () => {
  console.log("trying to connect to DB");

  await mongoose.connect("");
};

module.exports = { dbConnect };
