const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const { protect, admin, optionalAuth } = require("../middleware/auth");

const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_COST = 39;

// POST /api/orders — place an order (guest or logged-in)
router.post("/", optionalAuth, async (req, res) => {
  try {
    const { customerInfo, shippingAddress, items, paymentMethod, notes } =
      req.body;

    if (!customerInfo || !shippingAddress || !items || items.length === 0)
      return res.status(400).json({ message: "Données commande incomplètes" });

    // Validate products and calculate totals server-side
    const resolvedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive)
        return res
          .status(400)
          .json({ message: `Produit introuvable: ${item.productId}` });
      if (!product.sizes.includes(Number(item.size)))
        return res
          .status(400)
          .json({ message: `Taille ${item.size} non disponible pour ${product.name}` });

      const lineTotal = product.price * Number(item.quantity);
      subtotal += lineTotal;

      resolvedItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || "",
        size: Number(item.size),
        quantity: Number(item.quantity),
      });
    }

    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const total = subtotal + shippingCost;

    const order = await Order.create({
      user: req.user?._id,
      customerInfo,
      shippingAddress,
      items: resolvedItems,
      subtotal,
      shippingCost,
      total,
      paymentMethod: paymentMethod || "livraison",
      notes,
    });

    // Clear the user's cart after successful order
    if (req.user) {
      await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders — my orders (authenticated user)
router.get("/", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/admin — all orders (admin)
router.get("/admin", protect, admin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { orderStatus: status } : {};
    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("user", "name email"),
      Order.countDocuments(query),
    ]);

    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );
    if (!order) return res.status(404).json({ message: "Commande introuvable" });

    // Must be owner or admin
    if (
      req.user.role !== "admin" &&
      order.user?.toString() !== req.user._id.toString()
    )
      return res.status(403).json({ message: "Accès refusé" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/orders/:id/status (admin)
router.put("/:id/status", protect, admin, async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const valid = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!valid.includes(orderStatus))
      return res.status(400).json({ message: "Statut invalide" });

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Commande introuvable" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
