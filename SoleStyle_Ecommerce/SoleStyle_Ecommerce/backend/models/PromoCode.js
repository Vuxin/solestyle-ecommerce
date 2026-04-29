const mongoose = require("mongoose");

const promoCodeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
    discountAmount: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    expiryDate: { type: Date },
    isActive: { type: Boolean, default: true },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PromoCode", promoCodeSchema);
