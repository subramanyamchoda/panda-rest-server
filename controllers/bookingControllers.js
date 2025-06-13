const Booking = require('../models/Bookings');
const Table = require('../models/Table');
const User = require('../models/User');
const Restaurant = require('../models/Resturant');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS  
  }
});

const bookTable = async (req, res) => {
  const { restaurantId, tableId, bookingDate, bookingTime, userId } = req.body;

  try {
    const today = new Date().toISOString().split('T')[0];
    if (bookingDate < today) {
      return res.status(400).json({ message: 'Booking date cannot be in the past.' });
    }

    const existingBooking = await Booking.findOne({
      restaurantId,
      tableId,
      bookingDate,
      bookingTime,
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Table is already booked for the selected time.' });
    }

    const restaurant = await Restaurant.findById(restaurantId).populate('sender');
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found.' });
    }

    const sender = restaurant.sender;

    const booking = new Booking({
      restaurantId,
      tableId,
      userId,
      bookingDate,
      bookingTime,
      sender: sender?._id || null,
    });

    await booking.save();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // ✅ 1. Email to User
    await transporter.sendMail({
      from: `"Panda Connect" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Booking Confirmation",
      html: `
        <p>Hi ${user.name},</p>
        <p>Your table booking at <strong>${restaurant.name}</strong> on <strong>${bookingDate}</strong> at <strong>${bookingTime}</strong> is confirmed.</p>
      `
    });

    // ✅ 2. Email to Sender
    if (sender?.email) {
      await transporter.sendMail({
        from: `"Panda Connect" <${process.env.EMAIL_USER}>`,
        to: sender.email,
        subject: "New Booking Received",
        html: `
          <p>Hello ${sender.name},</p>
          <p>User <strong>${user.name}</strong> booked a table at <strong>${restaurant.name}</strong> for <strong>${bookingDate}</strong> at <strong>${bookingTime}</strong>.</p>
        `
      });
    }

    // ⏰ 3. Reminder time calculation (1 hour before)
    const [hours, minutes] = bookingTime.split(':').map(Number);
    const bookingDateTime = new Date(bookingDate);
    bookingDateTime.setHours(hours - 1, minutes, 0, 0); // One hour before

    const now = new Date();
    const delay = bookingDateTime.getTime() - now.getTime();

    if (delay > 0) {
      // ✅ 4. Reminder to User
      setTimeout(async () => {
        try {
          await transporter.sendMail({
            from: `"Panda Connect" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Upcoming Booking Reminder",
            html: `
              <p>Hi ${user.name},</p>
              <p>This is a reminder: your table at <strong>${restaurant.name}</strong> is booked for <strong>${bookingDate}</strong> at <strong>${bookingTime}</strong>.</p>
            `
          });
        } catch (e) {
          console.error("User reminder email failed:", e);
        }
      }, delay);

      // ✅ 5. Reminder to Sender
      if (sender?.email) {
        setTimeout(async () => {
          try {
            await transporter.sendMail({
              from: `"Panda Connect" <${process.env.EMAIL_USER}>`,
              to: sender.email,
              subject: "Upcoming Booking Alert",
              html: `
                <p>Hi ${sender.name},</p>
                <p>Reminder: User <strong>${user.name}</strong> has a table booking at <strong>${restaurant.name}</strong> today at <strong>${bookingTime}</strong>.</p>
              `
            });
          } catch (e) {
            console.error("Sender reminder email failed:", e);
          }
        }, delay);
      }
    }

    res.json({ message: 'Table booked successfully!', booking });

  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Server error during booking.' });
  }
};



  // In the user booking the table in that check the booking date details
const checkBooking=async(req,res)=>{
         const { restaurantId, tableId, bookingDate } = req.body;

  if (!restaurantId || !tableId || !bookingDate) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
    
  try {
    const bookings = await Booking.find({
      restaurantId,
      tableId,
      bookingDate,
    }).populate('tableId');

    if (!bookings.length) {
      return res.json({ message: 'No bookings on this date.', bookings: [] });
    }

  if(bookingDate < new Date().toISOString().split('T')[0]){
      return res.status(400).json({ message: 'Booking date cannot be in the past.' });
    } ;
    
    res.json({ message: 'Bookings found:', bookings });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}
//  for show the bookings of the user in the dashboard
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('userId').populate('tableId').populate('restaurantId').populate('sender');
    
const updatedBookings = bookings.map((booking) => {
      const bookingObj = booking.toObject();

      // Convert first restaurant image to base64
      const restaurantImageBuffer = booking.restaurantId?.images?.[0]?.data;
      const restaurantImageType = booking.restaurantId?.images?.[0]?.contentType;

      const restaurantImage = restaurantImageBuffer && restaurantImageType
        ? `data:${restaurantImageType};base64,${restaurantImageBuffer.toString('base64')}`
        : null;

      // Convert first table image to base64
      const tableImageBuffer = booking.tableId?.image?.[0]?.data;
      const tableImageType = booking.tableId?.image?.[0]?.contentType;

      const tableImage = tableImageBuffer && tableImageType
        ? `data:${tableImageType};base64,${tableImageBuffer.toString('base64')}`
        : null;

      return {
        ...bookingObj,
        restaurantImage,
        tableImage,
      };
    });

    res.status(200).json({ bookings: updatedBookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { bookTable, getBookings,checkBooking };
