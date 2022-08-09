const express = require("express");
const { 
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip
} = require("../controllers/trips");

const router = express.Router();

router
  .route("/")
  .get(getTrips)
  .post(createTrip);

router
  .route("/:id")
  .get(getTrip)
  .put(updateTrip)
  .delete(deleteTrip)

module.exports = router;