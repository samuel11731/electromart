const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // ✅ Load .env file

const productRoutes = require('./routes/productRoutes');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug log
console.log("🔍 MONGODB_URI:", process.env.MONGODB_URI);

// Routes
app.get('/', (req, res) => {
  res.send('Electronics Store Backend is running ✅');
});
app.use('/api/products', productRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB Connected');
}).catch((err) => {
  console.error('❌ MongoDB Connection Error:', err);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
