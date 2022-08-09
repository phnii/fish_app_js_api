const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({ success: true, msg: "show all trips"});
});

router.get("/:id", (req, res) => {
  res.status(200).json({ success: true, msg: `Get trip ${req.params.id}`});
});

router.post("/create", (req, res) => {
  res.status(200).json({ success: true, msg: "Create new trip"});
});

router.put("/:id", (req, res) => {
  res.status(200).json({ success: true, msg: `Update trip ${req.params.id}`});
});

router.delete("/:id", (req, res) => {
  res.status(200).json({ success: true, msg: `Delete trip ${req.params.id}`});
})

module.exports = router;