const express = require("express");
const router = express.Router();
const { orderController } = require("../controllers");

router.post("/", orderController.placeOrder);
router.post("/sessions", orderController.sessions);
router.get("/", orderController.getAll);

module.exports = router;
