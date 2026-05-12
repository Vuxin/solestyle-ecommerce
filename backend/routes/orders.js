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

    // ─── RESEND EMAIL ─────────────────────────────────────────────
    try {
      const { Resend } = require("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const orderId = order.orderNumber || order._id.toString().slice(-8).toUpperCase();

      const itemsHtml = resolvedItems.map(item => `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #f0f0f0;">
            <img src="${item.image}" width="50" height="50" style="border-radius:8px;object-fit:cover;" />
          </td>
          <td style="padding:10px;border-bottom:1px solid #f0f0f0;font-weight:600;">${item.name}</td>
          <td style="padding:10px;border-bottom:1px solid #f0f0f0;">Taille ${item.size}</td>
          <td style="padding:10px;border-bottom:1px solid #f0f0f0;">x${item.quantity}</td>
          <td style="padding:10px;border-bottom:1px solid #f0f0f0;font-weight:bold;color:#c9a96e;">${item.price * item.quantity} DH</td>
        </tr>
      `).join('');

      const emailHtml = `<!DOCTYPE html><html><body style="margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;background:#f5f5f5;">
        <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          <div style="background:linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%);padding:40px 30px;text-align:center;">
            <h1 style="color:#c9a96e;margin:0;font-size:28px;letter-spacing:2px;">SOLE STYLE</h1>
            <p style="color:#ffffff80;margin:8px 0 0;font-size:13px;letter-spacing:1px;">CONFIRMATION DE COMMANDE</p>
          </div>
          <div style="padding:40px 30px;">
            <h2 style="color:#1a1a1a;margin:0 0 8px;">Merci ${customerInfo.firstName} ! 🎉</h2>
            <p style="color:#666;margin:0 0 30px;">Votre commande a été reçue et est en cours de traitement.</p>
            <div style="background:#f9f9f9;border-radius:12px;padding:20px;margin-bottom:30px;">
              <p style="margin:0;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Numéro de commande</p>
              <p style="margin:6px 0 0;font-size:20px;font-weight:700;color:#1a1a1a;">#${orderId}</p>
            </div>
            <table style="width:100%;border-collapse:collapse;margin-bottom:30px;">
              <thead>
                <tr style="background:#f5f5f5;">
                  <th style="padding:10px;text-align:left;font-size:12px;color:#999;">Photo</th>
                  <th style="padding:10px;text-align:left;font-size:12px;color:#999;">Produit</th>
                  <th style="padding:10px;text-align:left;font-size:12px;color:#999;">Taille</th>
                  <th style="padding:10px;text-align:left;font-size:12px;color:#999;">Qté</th>
                  <th style="padding:10px;text-align:left;font-size:12px;color:#999;">Prix</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>
            <div style="border-top:2px solid #f0f0f0;padding-top:20px;">
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                <span style="color:#666;">Sous-total</span><span style="font-weight:600;">${subtotal} DH</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:16px;">
                <span style="color:#666;">Livraison</span><span style="font-weight:600;">${shippingCost === 0 ? 'Gratuite 🎁' : shippingCost + ' DH'}</span>
              </div>
              <div style="background:linear-gradient(135deg,#1a1a1a,#2d2d2d);border-radius:10px;padding:16px 20px;">
                <span style="color:#fff;font-size:16px;font-weight:700;">TOTAL</span>
                <span style="color:#c9a96e;font-size:20px;font-weight:700;float:right;">${total} DH</span>
              </div>
            </div>
            <div style="margin-top:30px;padding:20px;background:#fff8f0;border-radius:12px;border-left:4px solid #c9a96e;">
              <p style="margin:0 0 12px;font-weight:700;color:#1a1a1a;">📦 Adresse de livraison</p>
              <p style="margin:0;color:#666;">${shippingAddress.address}<br>${shippingAddress.zipCode} ${shippingAddress.city}</p>
              <p style="margin:10px 0 0;color:#666;">📱 ${customerInfo.phone}</p>
              <p style="margin:6px 0 0;color:#666;">💳 Paiement : ${paymentMethod === 'livraison' ? 'À la livraison' : paymentMethod}</p>
            </div>
          </div>
          <div style="background:#f9f9f9;padding:30px;text-align:center;">
            <p style="margin:0;color:#999;font-size:13px;">Questions ? Retrouvez-nous sur TikTok <strong>@solestyle.ma</strong></p>
            <p style="margin:10px 0 0;color:#ccc;font-size:11px;">© 2025 SoleStyle — Tous droits réservés</p>
          </div>
        </div>
      </body></html>`;

      // Email au CLIENT
      await resend.emails.send({
        from: "SoleStyle <onboarding@resend.dev>",
        to: customerInfo.email,
        subject: `✅ Commande confirmée #${orderId} — SoleStyle`,
        html: emailHtml,
      });

      // Notification ADMIN
      await resend.emails.send({
        from: "SoleStyle <onboarding@resend.dev>",
        to: "mohamedjbark35@gmail.com",
        subject: `🛒 Nouvelle commande ${total} DH — ${customerInfo.firstName} ${customerInfo.lastName}`,
        html: `<p><b>Client :</b> ${customerInfo.firstName} ${customerInfo.lastName} (${customerInfo.email})</p>
               <p><b>Tél :</b> ${customerInfo.phone}</p>
               <p><b>Adresse :</b> ${shippingAddress.address}, ${shippingAddress.city}</p>
               <p><b>Total :</b> ${total} DH</p>
               <p><b>Articles :</b> ${resolvedItems.map(i => `${i.name} T${i.size} x${i.quantity}`).join(', ')}</p>`,
      });

      console.log("📧 Emails envoyés via Resend");
    } catch (emailErr) {
      console.error("⚠️ Erreur Resend:", emailErr.message);
    }
    // ─────────────────────────────────────────────────────────────

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

// GET /api/orders/track/:ref — suivi de commande PUBLIC (par orderNumber)
router.get("/track/:ref", async (req, res) => {
  try {
    const ref = req.params.ref.trim().toUpperCase();
    let order = await Order.findOne({ orderNumber: ref })
      .select('orderNumber orderStatus customerInfo shippingAddress items subtotal shippingCost total createdAt paymentMethod');
    if (!order) {
      try {
        order = await Order.findById(req.params.ref)
          .select('orderNumber orderStatus customerInfo shippingAddress items subtotal shippingCost total createdAt paymentMethod');
      } catch (e) {}
    }
    if (!order) return res.status(404).json({ message: 'Commande introuvable. Vérifiez votre numéro de commande.' });
    res.json(order);
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
      { returnDocument: 'after' }
    );
    if (!order) return res.status(404).json({ message: "Commande introuvable" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
