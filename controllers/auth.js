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

  sendTokenResponse(user, 200, res);
});

// @desc    Login user
// @route   POST /auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    return next(new ErrorResponse("メールアドレスとパスワードを入力してください"), 400);
  }

  // Check for user
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorResponse("登録されていないメールアドレスです"), 401);
  }

  // Check if password matches
  const isMatch = user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse("メールアドレスかパスワードが間違っています", 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Update user
// @route   PUT /auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    introduce: req.body.introduce
  }

  const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});


// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      token
    });
}