const express=require('express');
const router=express.Router();

const {googleLogin, logout, getSender, uploadAvatar ,allSenders,singleSender}=require('../controllers/senderController');
const { authenticateSender } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

router.post("/login", googleLogin);
router.post("/logout", logout);
router.get("/users", authenticateSender, getSender);
router.post("/upload-avatar", authenticateSender, upload.single("avatar"), uploadAvatar);


router.get('/all',allSenders);
router.get('/:id',singleSender);

module.exports=router;








