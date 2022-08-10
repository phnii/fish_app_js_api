const ErrorResponse = require("../utils/ErrorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");

// @desc    Register user
// @route   POST /auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Create user
  const user = await User.create({
    name,
    email,
    password
  });

  // Create token
  const token = user.getSignJwtToken();

  res.status(200).json({
    success: true,
    token
  });
});
