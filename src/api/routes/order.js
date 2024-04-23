const express = require("express");
const router = express.Router();
const { orderController } = require("../controllers");

router.post("/", orderController.placeOrder);

module.exports = router;
