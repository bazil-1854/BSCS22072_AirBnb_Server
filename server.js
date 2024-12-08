const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./mongoDb/db');
const path = require('path');

const http = require('http'); // Import HTTP module
const { Server } = require('socket.io'); // Import Socket.IO

dotenv.config();
connectDB();

const app = express();

const server = http.createServer(app); // Create server for Socket.IO
const io = new Server(server, {
    cors: {
        origin: '*', // Adjust this to match your frontend's URL
        methods: ['GET', 'POST'],
    },
});


app.use('/listing_images', express.static(path.join(__dirname, 'listing_images')));

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


// Handle Socket.IO connections
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

app.set('io', io); // Attach Socket.IO instance to the app for global usage


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
