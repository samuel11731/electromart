const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// @desc   Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc   Create a new product
router.post('/', async (req, res) => {
  const product = new Product({
    name: req.body.name,
    price: req.body.price,
    image: req.body.image,
    description: req.body.description,
    inStock: req.body.inStock
  });

  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @desc   Get a static product by index
router.get('/static/:id', async (req, res) => {
  try {
    const products = await Product.find();
    const index = parseInt(req.params.id) - 1;

    if (index < 0 || index >= products.length) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = products[index];

    res.json({
      id: index + 1,
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// @desc   Get all static formatted products
router.get('/static', async (req, res) => {
  try {
    const products = await Product.find();

    const formatted = products.map((product, index) => ({
      id: index + 1,
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// @desc   Delete a product by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
