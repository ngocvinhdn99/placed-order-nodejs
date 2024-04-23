const express = require("express");
const router = express.Router();
const { productController } = require("../controllers");

router.get("/", productController.getAll);
router.post("/", productController.createData);
router.get("/:id", productController.getById);

module.exports = router;
