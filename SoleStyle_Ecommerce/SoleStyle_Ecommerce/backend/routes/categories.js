const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const { protect, admin } = require("../middleware/auth");

// GET /api/categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort("order");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/categories (admin)
router.post("/", protect, admin, async (req, res) => {
  try {
    const { name, description, image, emoji, order } = req.body;
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const category = await Category.create({
      name,
      slug,
      description,
      image,
      emoji,
      order,
    });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/categories/:id (admin)
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!category)
      return res.status(404).json({ message: "Catégorie introuvable" });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/categories/:id (admin)
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Catégorie introuvable" });
    res.json({ message: "Catégorie supprimée" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
