const express = require("express");

const { 
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  searchTrips
} = require("../controllers/trips");

const { protect } = require("../middleware/auth");

const router = express.Router();

router
  .route("/")
  .get(getTrips)
  .post(protect, createTrip);

router
  .route("/search")
  .post(searchTrips);

router
  .route("/:id")
  .get(getTrip)
  .put(protect, updateTrip)
  .delete(protect, deleteTrip)

module.exports = router;