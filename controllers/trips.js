
// @desc    Get all trips
// @route   GET /trips
// @access  Public
exports.getTrips = (req, res, next) => {
  res.status(200).json({ success: true, msg: "show all trips"});
}

// @desc    Get single trip
// @route   GET /trips/:id
// @access  Public
exports.getTrip = (req, res, next) => {
  res.status(200).json({ success: true, msg: `Get trip ${req.params.id}`});
}

// @desc    Create trip
// @route   POST /trips
// @access  Private
exports.createTrip = (req, res, next) => {
  res.status(200).json({ success: true, msg: "Create new trip"});
}

// @desc    Update trip
// @route   PUT /trips/:id
// @access  Private
exports.updateTrip = (req, res, next) => {
  res.status(200).json({ success: true, msg: `Update trip ${req.params.id}`});
}

// @desc    Delete trip
// @route   DELETE /trips/:id
// @access  Private
exports.deleteTrip = (req, res, next) => {
  res.status(200).json({ success: true, msg: `Delete trip ${req.params.id}`});
}

