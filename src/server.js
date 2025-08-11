require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const path = require('path');
const cors = require('cors');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

// Routes
app.use('/', authRoutes);

const PORT = process.env.PORT || 5403;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));