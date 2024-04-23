const express = require("express");
const router = express.Router();
const { paymentController } = require("../controllers");

router.get("/", paymentController.getAll);
router.post("/", paymentController.createData);

module.exports = router;
