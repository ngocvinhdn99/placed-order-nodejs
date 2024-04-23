const express = require("express");
const router = express.Router();
const { shippingAddressController } = require("../controllers");

router.get("/", shippingAddressController.getAll);
router.post("/", shippingAddressController.createData);

module.exports = router;
