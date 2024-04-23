const express = require("express");
const router = express.Router();
const { checkoutController } = require("../controllers");

router.post("/", checkoutController.checkout);

module.exports = router;
