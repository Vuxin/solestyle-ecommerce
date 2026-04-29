const express = require("express");
const router = express.Router();
const PromoCode = require("../models/PromoCode");
const { protect, admin } = require("../middleware/auth");

// @route   POST /api/promo/validate
// @desc    Validate a promo code
// @access  Public
router.post("/validate", async (req, res) => {
  const { code, amount } = req.body;

  try {
    const promo = await PromoCode.findOne({ code: code.toUpperCase(), isActive: true });

    if (!promo) {
      return res.status(404).json({ message: "Code promo invalide ou expiré" });
    }

    if (promo.expiryDate && new Date() > promo.expiryDate) {
      return res.status(400).json({ message: "Ce code promo a expiré" });
    }

    if (promo.minOrderAmount && amount < promo.minOrderAmount) {
      return res.status(400).json({ message: `Le montant minimum pour ce code est de ${promo.minOrderAmount} DH` });
    }

    res.json({
      code: promo.code,
      discountType: promo.discountType,
      discountAmount: promo.discountAmount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/promo
// @desc    Get all promo codes
// @access  Private/Admin
router.get("/", protect, admin, async (req, res) => {
  try {
    const promos = await PromoCode.find().sort("-createdAt");
    res.json(promos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/promo
// @desc    Create a promo code
// @access  Private/Admin
router.post("/", protect, admin, async (req, res) => {
  try {
    const promo = new PromoCode(req.body);
    await promo.save();
    res.status(201).json(promo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   DELETE /api/promo/:id
// @desc    Delete a promo code
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const promo = await PromoCode.findByIdAndDelete(req.params.id);
    if (!promo) return res.status(404).json({ message: "Code introuvable" });
    res.json({ message: "Code promo supprimé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
