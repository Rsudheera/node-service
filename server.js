require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const orderRoutes = require('./routes/orderRoutes');
// const inventoryRoutes = require('./routes/inventoryRoutes');

const app = express();
const port = process.env.PORT || 4000;

// Middleware for parsing JSON
app.use(express.json());

// Middleware to log requests and their bodies
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  if (Object.keys(req.body).length > 0) {
    console.log('Request Body:', req.body);
  } else {
    console.log('Request Body: Empty');
  }
  next(); // Pass control to the next middleware or route handler
});

// Middleware to log responses
app.use((req, res, next) => {
  const originalSend = res.send; // Reference to the original res.send method
  res.send = function (body) {
    console.log(`Response for ${req.method} ${req.url}:`);
    try {
      const formattedBody = JSON.stringify(JSON.parse(body), null, 2); // Format as pretty JSON
      console.log(formattedBody);
    } catch (error) {
      // If body is not JSON, log it as is
      console.log(body);
    }
    originalSend.call(this, body); // Call the original res.send with the body
  };
  next();
});

// MongoDB Connection
  mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    console.error(err);
  });

// Routes
app.use('/api/orders', orderRoutes);
// app.use('/api/inventory', inventoryRoutes);

// Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});