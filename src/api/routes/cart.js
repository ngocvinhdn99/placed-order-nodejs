const express = require("express");
const router = express.Router();
const { cartController } = require("../controllers");

router.get("/", cartController.getAll);
router.post("/", cartController.createData);

module.exports = router;
