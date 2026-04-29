const mongoose = require("mongoose");
require("dotenv").config();

const dbConnect = async () => {
  console.log("trying to connect to DB");
  const dbPassword = process.env.DB_PASSWORD;
  await mongoose.connect(
    `mongodb+srv://svk7063_db_user:${dbPassword}@personalprojects.cyribyv.mongodb.net/devTinder`,
  );
};

module.exports = { dbConnect };
