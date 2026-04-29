const validateProfileEditData = (req) => {
  const allowedEditsOn = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "photoUrl",
    "about",
    "skills",
  ];

  const notAllowedFields = Object.keys(req.body).filter(
    (key) => !allowedEditsOn.includes(key),
  );

  return {
    isValid: notAllowedFields.length === 0,
    notAllowedFields,
  };
};

module.exports = { validateProfileEditData };
