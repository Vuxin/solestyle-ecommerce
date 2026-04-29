const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const { protect, admin } = require("../middleware/auth");

// @route   GET /api/stats/dashboard
// @desc    Get dashboard stats
// @access  Private/Admin
router.get("/dashboard", protect, admin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();
    
    // Total Revenue (delivered orders)
    const orders = await Order.find({ orderStatus: { $ne: "cancelled" } });
    const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);

    // Order status distribution
    const statusCounts = await Order.aggregate([
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } }
    ]);

    // Top selling products
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.product", name: { $first: "$items.name" }, sales: { $sum: "$items.quantity" } } },
      { $sort: { sales: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      summary: {
        totalOrders,
        totalProducts,
        totalUsers,
        totalRevenue
      },
      statusDistribution: statusCounts,
      topProducts
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/stats/revenue-last-7-days
// @desc    Get daily revenue for charts
// @access  Private/Admin
router.get("/revenue-chart", protect, admin, async (req, res) => {
  try {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const revenueData = await Order.aggregate([
      { $match: { createdAt: { $gte: last7Days }, orderStatus: { $ne: "cancelled" } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$total" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(revenueData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
