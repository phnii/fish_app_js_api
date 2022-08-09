const ErrorResponse = require("../utils/ErrorResponse");
const asyncHandler = require("../middleware/async");
const Trip = require("../models/Trip");

// @desc    Get all trips
// @route   GET /trips
// @access  Public
exports.getTrips = asyncHandler(async (req, res, next) => {
  const trips = await Trip.find();

  if (!trips) {
    return res.status(400).json({ success: false });
  }

  res.status(200).json({
    success: true,
    count: trips.length,
    data: trips
  });
});

// @desc    Get single trip
// @route   GET /trips/:id
// @access  Public
exports.getTrip = asyncHandler(async (req, res, next) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return res.status(400).json({ success: false });
  }

  res.status(200).json({
    success: true,
    data: trip
  });
});

// @desc    Create trip
// @route   POST /trips
// @access  Private
exports.createTrip = asyncHandler(async (req, res, next) => {
  const trip = await Trip.create(req.body);

  res.status(201).json({
    success: true,
    data: trip
  });
});

// @desc    Update trip
// @route   PUT /trips/:id
// @access  Private
exports.updateTrip = asyncHandler(async (req, res, next) => {
  const trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!trip) {
    return res.status(400).json({ success: false });
  }

  res.status(200).json({
    success: true,
    data: trip
  });
});

// @desc    Delete trip
// @route   DELETE /trips/:id
// @access  Private
exports.deleteTrip = asyncHandler(async (req, res, next) => {
  const trip = await Trip.findByIdAndRemove(req.params.id);

  if (!trip) {
    return res.status(400).json({ success: false });
  }
  res.status(200).json({
    success: true,
    data: {}
  });
});

