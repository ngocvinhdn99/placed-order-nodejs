const express = require("express");
const router = express.Router();
const { cartController } = require("../controllers");

router.get("/", cartController.getAll);
router.post("/", cartController.createData);
router.patch("/:cartId", cartController.updateItems);
router.delete("/:cartId", cartController.delete);

module.exports = router;
