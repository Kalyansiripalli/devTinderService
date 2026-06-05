const { default: isEmail } = require("validator/lib/isEmail");
const { default: isURL } = require("validator/lib/isURL");
const { isStrongPassword } = require("validator");
const validateSingupData = (req, res, next) => {
  try {
    let userInfo = req.body;

    let {
      firstName,
      lastName,
      emailId,
      password,
      age,
      gender,
      photoUrl,
      about,
      skills,
    } = userInfo;

    if (!isEmail(emailId)) throw new Error("Invalid email");
    if (!isStrongPassword(password))
      throw new Error("Please consider using strong password");
    if (photoUrl && !isURL(photoUrl)) throw new Error("Invalid photoURL");
    console.log("hi");

    // sanitize the data
    userInfo.firstName = firstName?.toLowerCase().trim();
    userInfo.lastName = lastName?.toLowerCase().trim();
    userInfo.gender = gender?.toLowerCase().trim();

    next();
  } catch (error) {
    res.status(400).json({ message: "signup failed: " + error.message });
  }
};

module.exports = { validateSingupData };
