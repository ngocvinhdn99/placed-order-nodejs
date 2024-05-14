const express = require("express");
const router = express.Router();
const { warehouseController } = require("../controllers");

router.get("/", warehouseController.getAll);
router.post("/", warehouseController.createData);
router.post("/add-items", warehouseController.addItems);

module.exports = router;
