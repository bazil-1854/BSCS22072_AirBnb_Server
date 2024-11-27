const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./mongoDb/db');  
const path = require('path');
 
dotenv.config();
connectDB();

const app = express();


app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(cors());
app.use(express.json());


app.use('/air-bnb/home', require("./routes/listingsRoutes"));


app.use('/air-bnb/auth', require("./routes/authRoute"));
app.use('/air-bnb/profile', require("./routes/profileRoute"));

app.use('/air-bnb/reservation', require("./routes/guestBookingRoute"));

app.use('/air-bnb/manage-bookings', require("./routes/hostBookingsRoute"));

// add  alisintg
app.use('/air-bnb/hosting', require("./routes/hostListingsRoute"));

app.use('/air-bnb/listing-rating', require("./routes/listingRatingRoutes"));

 
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
