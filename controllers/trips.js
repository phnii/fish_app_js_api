const ErrorResponse = require("../utils/ErrorResponse");
const asyncHandler = require("../middleware/async");
const Trip = require("../models/Trip");

// @desc    Get all trips
// @route   GET /trips
// @access  Public
exports.getTrips = asyncHandler(async (req, res, next) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ["page", "limit"];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  query = Trip.find(JSON.parse(queryStr));

  // Sort
  query = query.sort("-createdAt");

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Trip.countDocuments();
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  const trips = await query;

  // Pagination result
  let pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    }
  }

  if (startIndex > 0) {
    pagination.pre = {
      page: page - 1,
      limit
    }
  }

  if (!trips) {
    return res.status(400).json({ success: false });
  }

  res.status(200).json({
    success: true,
    count: trips.length,
    pagination,
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

