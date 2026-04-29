const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { protect } = require("../middleware/auth");

// All cart routes require authentication
router.use(protect);

// GET /api/cart
router.get("/", async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name price oldPrice images sizes emoji badge"
    );
    res.json(cart || { items: [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/cart   { productId, size, quantity }
router.post("/", async (req, res) => {
  try {
    const { productId, size, quantity = 1 } = req.body;
    if (!productId || !size)
      return res
        .status(400)
        .json({ message: "productId et size sont requis" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Produit introuvable" });
    if (!product.sizes.includes(Number(size)))
      return res.status(400).json({ message: "Taille non disponible" });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if same product+size already in cart
    const existing = cart.items.find(
      (i) =>
        i.product.toString() === productId && i.size === Number(size)
    );

    if (existing) {
      existing.quantity += Number(quantity);
    } else {
      cart.items.push({ product: productId, size: Number(size), quantity: Number(quantity) });
    }

    await cart.save();
    await cart.populate("items.product", "name price oldPrice images sizes emoji badge");
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/cart/:itemId   { quantity }
router.put("/:itemId", async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1)
      return res.status(400).json({ message: "Quantité invalide" });

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Panier introuvable" });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Article introuvable" });

    item.quantity = Number(quantity);
    await cart.save();
    await cart.populate("items.product", "name price oldPrice images sizes emoji badge");
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/cart/:itemId
router.delete("/:itemId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Panier introuvable" });

    cart.items = cart.items.filter(
      (i) => i._id.toString() !== req.params.itemId
    );
    await cart.save();
    await cart.populate("items.product", "name price oldPrice images sizes emoji badge");
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/cart  (clear cart)
router.delete("/", async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [] }
    );
    res.json({ message: "Panier vidé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
