const express = require("express");

const { 
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  searchTrips
} = require("../controllers/trips");

const router = express.Router();

router
  .route("/")
  .get(getTrips)
  .post(createTrip);

router
  .route("/search")
  .post(searchTrips);

router
  .route("/:id")
  .get(getTrip)
  .put(updateTrip)
  .delete(deleteTrip)

module.exports = router;