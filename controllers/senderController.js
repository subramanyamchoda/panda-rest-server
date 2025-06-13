const Sender = require('../models/Sender');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require("google-auth-library");
require('dotenv').config();

const secretKey = process.env.JWT_SECRET;
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS 
  }
});

// Google Login
const googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;

    let sender = await Sender.findOne({ googleId: sub });

    if (!sender) {
      sender = await Sender.create({
        googleId: sub,
        email,
        name,
        avatar: picture
      });
    } else {
      sender.avatar = picture;
      await sender.save();
    }

    // ✅ Use the same secret used in `authenticateSender`
    const jwtToken = jwt.sign(
      { senderId: sender._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("authToken", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 24 * 60 * 60 * 1000
    });

    await transporter.sendMail({
      from: '"Panda Connect" <pandaconnect7@gmail.com>',
      to: sender.email,
      subject: "Login Successful",
      html: `
        <p>Hi ${sender.name},</p>
        <p>You have successfully logged in to Panda Connect.</p>
        <p>If this wasn't you, please contact our support team immediately.</p>
        <br>
        <p>Best regards,<br>Panda Connect Team</p>
      `
    });

    res.json({
      message: "Login successful",
      sender: {
        _id: sender._id,
        name: sender.name,
        email: sender.email,
        avatar: sender.avatar
      }
    });

  } catch (err) {
    console.error("Google login error:", err);
    res.status(401).json({ error: "Login failed" });
  }
};

// Logout
const logout = (req, res) => {
  res.clearCookie("authToken", {
    path: "/",
    httpOnly: true,
    sameSite: "None",
    secure: true
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// Get Sender Info
const getSender = async (req, res) => {
  try {
    const sender = await Sender.findById(req.senderId).select("-__v");

    if (!sender) {
      return res.status(404).json({ error: "Sender not found" });
    }

    res.json({
      name: sender.name,
      email: sender.email,
      avatar: sender.avatar
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Upload Avatar
const uploadAvatar = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const sender = await Sender.findById(req.senderId);
    if (!sender) {
      return res.status(404).json({ error: "Sender not found" });
    }

    sender.avatar = `/uploads/${req.file.filename}`;
    await sender.save();

    res.json({ message: "Avatar updated", avatar: sender.avatar });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// All Senders
const allSenders = async (req, res) => {
  try {
    let senders = await Sender.find()
      .populate('restaurants')
      .populate('table');

    if (!senders || senders.length === 0) {
      return res.status(404).json({ message: "No senders found" });
    }

    // Convert image buffers to Base64 strings
    senders = senders.map(sender => {
      const senderObj = sender.toObject();

      if (senderObj.resturant?.image && senderObj.resturant.image instanceof Buffer) {
        senderObj.resturant.image = senderObj.resturant.image.toString('base64');
      }

      if (senderObj.table?.image && senderObj.table.image instanceof Buffer) {
        senderObj.table.image = senderObj.table.image.toString('base64');
      }

      return senderObj;
    });

    res.json({ senders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Single Sender


const singleSender = async (req, res) => {
  try {
    const senderId = req.senderId || req.params.id;

    const foundSender = await Sender.findById(senderId)
      .populate('restaurants')
      .populate('table');

    if (!foundSender) {
      return res.status(404).json({ message: "Sender not found" });
    }

    const senderData = foundSender.toObject();

    // Convert restaurant images
    if (senderData.restaurants && Array.isArray(senderData.restaurants)) {
      senderData.restaurants = senderData.restaurants.map(restaurant => {
        const restObj = restaurant;

        if (restObj?.image?.data && restObj?.image?.contentType) {
          restObj.image = {
            base64: restObj.image.data.toString('base64'),
            contentType: restObj.image.contentType
          };
        }

        return restObj;
      });
    }

    // Convert table image
    if (senderData.table?.image?.data && senderData.table?.image?.contentType) {
      senderData.table.image = senderData.table.image.data.toString('base64');
      senderData.table.contentType = senderData.table.image.contentType; 
    }

    res.status(200).json({ sender: senderData });
  } catch (error) {
    console.error("Error in singleSender:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = { googleLogin,logout,getSender,uploadAvatar,allSenders, singleSender};
