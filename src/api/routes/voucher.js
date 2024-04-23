const express = require("express");
const router = express.Router();
const { voucherController } = require("../controllers");

router.get("/", voucherController.getAll);
router.post("/", voucherController.createData);

module.exports = router;
