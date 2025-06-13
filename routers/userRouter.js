const express = require("express");
const { googleLogin, logout, getUser, uploadAvatar } = require("../controllers/userController");
const { authenticateUser } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.post("/login", googleLogin);
router.post("/logout", logout);
router.get("/users", authenticateUser, getUser);
router.post("/upload-avatar", authenticateUser, upload.single("avatar"), uploadAvatar);

module.exports = router;
