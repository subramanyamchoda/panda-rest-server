const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const senderRouter = require('./routers/senderRouter');
const resturantRouter = require('./routers/resturantRouter');
const userRouter = require('./routers/userRouter');
const tableRouter = require('./routers/tableRouter');
const bookingRouter = require('./routers/bookingRouter');


app.use(express.json());


app.use(cors({
  origin: "https://pandarestaurantsadder.vercel.app/" || "https://pandarestaurantsuser.vercel.app/",
  credentials: true               
}));

app.use(cookieParser());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected successfully"))
.catch((err) => console.error("MongoDB connection error:", err));

// Optional: basic test route
app.get('/', (req, res) => {
  res.send("Hello welcome to the restaurant booking API!");
});

app.use('/sender', senderRouter);
app.use('/restaurant', resturantRouter);
app.use('/user', userRouter);
app.use('/tables', tableRouter);
app.use('/booking', bookingRouter);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
