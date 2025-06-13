const Table = require('../models/Table');
const nodemailer = require('nodemailer');
const Restaurant = require('../models/Resturant');
const Sender = require('../models/Sender');
const fs = require("fs");
const multer = require("multer");
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only images are allowed"), false);
    }
    cb(null, true);
  },
}).array("images", 5); 

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS  
  }
});

const sendTable = async (req, res) => {
  try {
    const { tableno, sittingtype, sittingnos } = req.body;
    const senderId = req.senderId;

    if (![tableno, sittingtype, sittingnos].every(field => field !== undefined && field !== null && field !== '')) {
      return res.status(400).json({ error: "All required fields must be filled" });
    }

    const sender = await Sender.findById(senderId).populate('restaurants');

    if (!sender || !sender.restaurants || sender.restaurants.length === 0) {
      return res.status(404).json({ error: "Sender or associated restaurant not found" });
    }

    const restaurant = sender.restaurants[0];
    const restaurantId = restaurant._id;

    const imageBuffers = (req.files || []).map(file => ({
      data: file.buffer,
      contentType: file.mimetype,
      filename: file.originalname,
    }));

    const newTable = new Table({
      tableno,
      sittingtype,
      sittingnos,
      image: imageBuffers,
      restaurant: restaurantId,
      sender: senderId,
    });

    await newTable.save();

    if (!Array.isArray(sender.table)) sender.table = [];
    if (!Array.isArray(restaurant.table)) restaurant.table = [];

    sender.table.push(newTable._id);
    restaurant.table.push(newTable._id);

    await Promise.all([sender.save(), restaurant.save()]);

    // ✅ Send email to sender
    await transporter.sendMail({
      from: `"Panda Connect" <${process.env.EMAIL_USER}>`,
      to: sender.email,
      subject: "New Table Added",
      html: `
        <p>Hi ${sender.name},</p>
        <p>A new table has been added to your restaurant <strong>${restaurant.name}</strong>.</p>
        <ul>
          <li><strong>Table No:</strong> ${tableno}</li>
          <li><strong>Sitting Type:</strong> ${sittingtype}</li>
          <li><strong>Sitting Capacity:</strong> ${sittingnos}</li>
        </ul>
        <p>If you did not perform this action, please contact our support team immediately.</p>
        <br>
        <p>Best regards,<br>Panda Connect Team</p>
      `
    });

    res.status(201).json({ message: "Table added successfully", table: newTable });

  } catch (error) {
    console.error("Error adding table:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


  // added sender tables dusplay in dashoorad 

const allTables = async (req, res) => {
  try {
    const tables = await Table.find()
      .populate('restaurant')
      .populate('sender');

    if (!tables || tables.length === 0) {
      return res.status(404).json({ message: "No tables found" });
    }

    // Convert images to base64
    const tablesWithBase64Images = tables.map(table => {
      const images = (table.image || []).map(img => ({
        base64: img.data.toString('base64'),
        contentType: img.contentType,
        filename: img.filename,
      }));

      return {
        ...table.toObject(),
        image: images,
      };
    });

    res.status(200).json({ tables: tablesWithBase64Images });
  } catch (err) {
    console.error("Error fetching tables:", err);
    res.status(500).json({ error: "Failed to fetch tables" });
  }
};




module.exports = { sendTable,allTables };
