const Restaurant = require('../models/Resturant');
const Sender=require('../models/Sender')
const fs = require("fs");
const multer = require("multer");
const path = require('path');
const nodemailer = require('nodemailer');
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

const sendRestaurant = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const { name, address } = req.body;

      if (!name || !address) {
        return res.status(400).json({ error: "All required fields must be filled" });
      }

      const sender = await Sender.findById(req.senderId);
      if (!sender) {
        return res.status(404).json({ error: "Sender not found" });
      }

      const imageBuffers = (req.files || []).map(file => ({
        data: file.buffer,
        contentType: file.mimetype,
        filename: file.originalname,
      }));

      const newRestaurant = new Restaurant({
        name,
        address,
        images: imageBuffers,
        sender: sender._id,
      });

      await newRestaurant.save();

      sender.restaurants.push(newRestaurant._id);
      await sender.save();

      await transporter.sendMail({
        from: `"Panda Connect" <${process.env.EMAIL_USER}>`,
        to: sender.email,
        subject: "New Restaurant Added",
        html: `
          <p>Hi ${sender.name},</p>
          <p>Your restaurant <strong>${name}</strong> located at <em>${address}</em> has been successfully added to your account.</p>
          <p>If you didn't perform this action, please contact our support team immediately.</p>
          <br>
          <p>Best regards,<br>Panda Connect Team</p>
        `
      });

      return res.status(201).json({
        message: "Restaurant added successfully",
        restaurant: newRestaurant
      });

    } catch (error) {
      console.error("Error adding restaurant:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
};

//  the all restaurants and their images for 
const allRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().populate('table');

    const response = restaurants.map(r => {
      const images = (r.images || []).map(img => ({
        base64: img.data.toString('base64'),
        contentType: img.contentType,
        filename: img.filename,
      }));

      return {
        _id: r._id,
        name: r.name,
        address: r.address,
        images,
      };
    });

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).json({ message: "Error fetching restaurants" });
  }
};
  // based on the restaurant tables show to the user
const singleRestaurant = async (req, res) => {
  const restaurantId = req.params.id;

  try {
    const restaurant = await Restaurant.findById(restaurantId).populate('table');

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    
    const restaurantImages = (restaurant.images || []).map(img => ({
      base64: img.data.toString('base64'),
      contentType: img.contentType,
      filename: img.filename,
    }));

    // Convert table images
    const tablesWithImages = (restaurant.table || []).map(table => {
      const tableImages = (table.image || []).map(img => ({
        base64: img.data.toString('base64'),
        contentType: img.contentType,
        filename: img.filename,
      }));

      return {
        _id: table._id,
        tableno: table.tableno,
        sittingtype: table.sittingtype,
        sittingnos: table.sittingnos,
        images: tableImages,
      };
    });

    res.status(200).json({
      restaurant: {
        _id: restaurant._id,
        name: restaurant.name,
        address: restaurant.address,
        images: restaurantImages,
        table: tablesWithImages,
      }
    });
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteRestaurant = async (req, res) => {
  const restaurantId = req.params.id;

  try {
    const deletedRestaurant = await Resturant.findByIdAndDelete(restaurantId);

    if (!deletedRestaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.status(200).json({
      message: "Restaurant deleted successfully",
      deletedRestaurant,
    });
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { sendRestaurant, deleteRestaurant ,allRestaurants,singleRestaurant,};
