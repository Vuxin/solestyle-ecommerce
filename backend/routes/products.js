const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/auth");

// GET /api/products
router.get("/", async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      size,
      search,
      featured,
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isActive: true };

    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (size) query.sizes = Number(size);
    if (featured === "true") query.isFeatured = true;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort = featured === "true" ? { updatedAt: -1 } : { createdAt: -1 };
    
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("category", "name slug emoji")
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    res.json({
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name slug emoji"
    );
    if (!product || !product.isActive)
      return res.status(404).json({ message: "Produit introuvable" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/products (admin)
router.post("/", protect, admin, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/products/:id (admin)
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product)
      return res.status(404).json({ message: "Produit introuvable" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/products/:id (admin) — soft delete
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product)
      return res.status(404).json({ message: "Produit introuvable" });
    res.json({ message: "Produit supprimé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
