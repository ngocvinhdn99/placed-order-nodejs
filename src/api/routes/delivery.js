const express = require("express");
const router = express.Router();
const { deliveryController } = require("../controllers");

router.get("/", deliveryController.getAll);
router.post("/", deliveryController.createData);

module.exports = router;
