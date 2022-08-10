const fs = require("fs");

const ErrorResponse = require("../utils/ErrorResponse");
const asyncHandler = require("../middleware/async");
const Trip = require("../models/Trip");
const Fish = require("../models/Fish");

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
  // tripフィールドに関してバリデーションチェック
  let newTrip = validateTrip(req.body, next);
  let fishes = [];
  // req.bodyとreq.filesとnewTripから投稿された釣果と同数のfishオブジェクトを作成する
  if (req.body.fishName || req.files) {
    fishes = makeFishObjectsArray(req, newTrip);
  }

  // 各fishオブジェクトに対してバリデーションチェック
  if (fishes.length > 0) {
    validateFishes(fishes, next);
  }

  // 全てのデータがバリデーション通過したのでTripとFishesを保存する
  const trip = await newTrip.save();
  fishes = await Fish.create(fishes);

  // 画像データを/public/uploadsに保存する
  for (let i = 0; i < fishes.length; i++) {
    if (req.files && req.files[`fishImage_${i}`]) {
      fs.writeFile("./public/uploads/" + req.files[`fishImage_${i}`].md5 + Date.now() + ".jpg", 
              req.files[`fishImage_${i}`].data, (err) => next(err));
    }
  }

  res.status(201).json({
    success: true,
    data: {trip, fishes}
  });
});

// @desc    Update trip
// @route   PUT /trips/:id
// @access  Private
exports.updateTrip = asyncHandler(async (req, res, next) => {
  let trip = await Trip.findById(req.params.id);
  if (!trip) {
    return res.status(400).json({ success: false });
  }

  // Tripオブジェクトのバリデーションチェック
  validateTrip(req.body, next);

  let fishes = [];
  // req.bodyとreq.filesとnewTripから投稿された釣果と同数のfishオブジェクトを作成する
  if (req.body.fishName || req.files) {
    fishes = makeFishObjectsArray(req, trip);
  }

  // 各fishオブジェクトに対してバリデーションチェック
  if (req.body.fishName || req.files) {
    validateFishes(fishes, next);
  }

  // 以上で全てのデータがバリデーション通過したので以下TripとFishesを保存する
  trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  fishes = await Fish.create(fishes);

  if (req.files) {
    // 画像データを/public/uploadsに保存する
    for (let i = 0; i < fishes.length; i++) {
      if (req.files && req.files[`fishImage_${i}`]) {
        fs.writeFile("./public/uploads/" + req.files[`fishImage_${i}`].md5 + Date.now() + ".jpg", 
                req.files[`fishImage_${i}`].data, (err) => next(err));
      }
    }
  }

  // 釣果の削除があれば削除する
  if (req.body.deleteCheckBox) {
    console.log("tasikanitoowtter")
    // deleteCheckBoxのチェックボックスが一つしかチェックされなかった時でも配列になるように変換する
    // 配列の各要素には削除対象のFishオブジェクidが入る
    let deleteCheckBoxArray = (typeof(req.body.deleteCheckBox) === "string") ? [req.body.deleteCheckBox] : req.body.deleteCheckBox;
    deleteCheckBoxArray.forEach(async (fishId) => {
      await Fish.findByIdAndDelete(fishId);
    });
  }

  res.status(200).json({
    success: true,
    data: [trip, fishes]
  });
});

// @desc    Delete trip
// @route   DELETE /trips/:id
// @access  Private
exports.deleteTrip = asyncHandler(async (req, res, next) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return res.status(400).json({ success: false });
  }

  trip.remove();
  res.status(200).json({
    success: true,
    data: {}
  });
});

// req.bodyからTripオブジェクトを作成しバリデーションチェックし通過すればオブジェクトを返す
const validateTrip = (body, next) => {
  let newTrip = new Trip(body);
  let err = newTrip.validateSync();
  if (err !== undefined) {
    return next(err);
  }
  return newTrip;
}

// req.bodyとreq.filesから投稿された釣果と同数のfishオブジェクトを作成し配列に詰めて返す
//    fish(fishName, fishImage_x)フィールドのPOSTデータの構造
//    req.body.fishName = [fishName0, fishName1, ...]
//    req.files.fishImage_0 = image_0
//    req.files.fishImage_1 = image_1
//    .....
const makeFishObjectsArray = (req, trip) => {
  let fishes = [];
  // fishNameが単数の場合、文字列から配列に変換しておく
  let fishNames = typeof(req.body.fishName) === "string" ? [req.body.fishName] : req.body.fishName;
  for (let i = 0; i < fishNames.length; i++) {
    if (req.files && req.files[`fishImage_${i}`]) {
      fishes.push({
        name: fishNames[i],
        image: req.files[`fishImage_${i}`].md5,
        trip: trip._id
      })
    } else {
      fishes.push({
        name: fishNames[i],
        trip: trip._id
      })
    }
  }

  return fishes;
}

const validateFishes = (fishes, next) => {
  for (let i = 0; i < fishes.length; i++) {
    let newFish = new Fish(fishes[i]);
    let err = newFish.validateSync();
    if (err !== undefined) {
      return next(err);
    }
  }
}
