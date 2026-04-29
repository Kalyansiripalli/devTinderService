const { mongoose } = require("mongoose");
const { Schema } = mongoose;
const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      lowercase: true,
      minlength: 0,
      maxlength: 30,
      trim: true,
    },
    emailId: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
      min: [18, "only above 18 are allowed"],
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "others"],
    },
    photoUrl: {
      type: String,
      default:
        "https://static.vecteezy.com/system/resources/thumbnails/053/964/117/small/a-silhouette-of-a-person-with-a-circular-head-and-a-minimalistic-body-structure-showcasing-a-simple-design-png.png",
    },
    about: {
      type: String,
      minlength: 0,
      maxlength: 200,
    },
    skills: {
      type: [String],
      required: true,
      validate: {
        validator: function (skills) {
          return (
            Array.isArray(skills) &&
            skills.length > 0 &&
            skills.every((s) => typeof s === "string" && s.trim().length > 0)
          );
        },
        message: () => `Skills cant be empty!`,
      },
    },
  },
  { timestamps: true },
);

const UserModel = mongoose.model("User", userSchema);
module.exports = { UserModel };
