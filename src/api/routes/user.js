const express = require("express");
const router = express.Router();
const { userController } = require("../controllers");

router.get("/", userController.getAll);
router.post("/", userController.createData);
router.get("/:id", userController.getById);

module.exports = router;
