const express = require("express");
const router = express.Router();
const { skuController } = require("../controllers");

router.get("/", skuController.getAll);
router.post("/", skuController.createData);

module.exports = router;
