const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes'); // ✅ Auth route

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug
console.log("🔍 MONGODB_URI:", process.env.MONGODB_URI);

// Routes
app.get('/', (req, res) => {
  res.send('Electronics Store Backend is running ✅');
});
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes); // ✅ Auth route

// MongoDB Connection (⬅️ cleaned)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err);
  });

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});