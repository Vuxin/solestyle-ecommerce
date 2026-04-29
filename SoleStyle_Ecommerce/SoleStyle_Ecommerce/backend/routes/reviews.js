const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Product = require("../models/Product");
const { protect, admin, optionalAuth } = require("../middleware/auth");

// @route   GET /api/reviews/admin/all
// @desc    Get all reviews (admin)
// @access  Private/Admin
router.get("/admin/all", protect, admin, async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("product", "name")
      .sort("-createdAt");
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/reviews/:productId
// @desc    Get approved reviews for a product
// @access  Public
router.get("/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, isApproved: true })
      .sort("-createdAt");
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/reviews
// @desc    Create a review
// @access  Public (Guest or User)
router.post("/", optionalAuth, async (req, res) => {
  const { productId, rating, comment, userName } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Produit introuvable" });

    const review = new Review({
      product: productId,
      user: req.user ? req.user._id : null,
      userName: req.user ? req.user.name : (userName || "Client Anonyme"),
      rating,
      comment,
      isApproved: false // Requires moderation
    });

    await review.save();
    res.status(201).json({ message: "Merci ! Votre avis sera visible après validation." });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});



// @route   PUT /api/reviews/:id/approve
// @desc    Approve or reject a review
// @access  Private/Admin
router.put("/:id/approve", protect, admin, async (req, res) => {
  const { isApproved } = req.body;

  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Avis introuvable" });

    review.isApproved = isApproved;
    await review.save();

    if (isApproved) {
      // Recalculate product rating
      const reviews = await Review.find({ product: review.product, isApproved: true });
      const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
      
      await Product.findByIdAndUpdate(review.product, {
        rating: avgRating.toFixed(1),
        reviewCount: reviews.length
      });
    }

    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: "Avis introuvable" });
    res.json({ message: "Avis supprimé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
