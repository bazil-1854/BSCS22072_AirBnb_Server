const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./mongoDb/db');  
 
dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());


app.use('/air-bnb/auth', require("./routes/authRoute"));
app.use('/air-bnb/profile', require("./routes/profileRoute"));
 
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
