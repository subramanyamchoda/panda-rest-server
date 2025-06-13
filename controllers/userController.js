const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const nodemailer = require('nodemailer');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS  
  }
});

const googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;

    let user = await User.findOne({ googleId: sub });
    if (!user) {
      user = await User.create({
        googleId: sub,
        email,
        name,
        avatar: picture
      });
    } else {
      user.avatar = picture;
      await user.save();
    }

    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.cookie("authToken", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax"
    });

    // ✅ Send login email
    await transporter.sendMail({
      from: '"Panda Connect" <pandaconnect7@gmail.com>',
      to: user.email,
      subject: "Login Successful",
      html: `
        <p>Hi ${user.name},</p>
        <p>You have successfully logged in to your account using Google.</p>
        <p>If this wasn't you, please contact support immediately.</p>
        <br>
        <p>Best regards,<br>Panda Connect Team</p>
      `
    });

    res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(401).json({ error: "Login failed" });
  }
};


const logout = (req, res) => {
  res.clearCookie("authToken", {
    path: "/",
    httpOnly: true,
    sameSite: "None",
    secure: true
  });
  res.status(200).json({ message: "Logged out successfully" });
};

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-__v");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      name: user.name,
      email: user.email,
      avatar: user.avatar
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const uploadAvatar = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.avatar = `/uploads/${req.file.filename}`;
    await user.save();
    res.json({ message: "Avatar updated", avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { googleLogin, logout, getUser, uploadAvatar };
