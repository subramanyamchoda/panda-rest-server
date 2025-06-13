const express = require("express");
const router = express.Router();
const { sendTable,allTables } = require("../controllers/tableController");
const upload= require("../middlewares/upload");
const { authenticateSender } = require("../middlewares/authMiddleware");

router.post("/send", authenticateSender, upload, sendTable);
router.get('/all',allTables);

module.exports = router;
