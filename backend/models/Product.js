const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String },
    price: { type: Number, required: true },
    oldPrice: { type: Number },
    brand: { type: String, enum: ["Nike", "Jordan", "Adidas", "Puma", "New Balance", "Converse", "Vans", "Asics", "Saucony", "Salomon", "Birkenstock", "Ugg", "Balenciaga", "On", "Prada", "Dior", "Hermes", "Autre"], default: "Autre" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    sizes: [Number],
    images: [String],
    emoji: { type: String, default: "👟" },
    badge: { type: String }, // "Nouveau", "Promo", "Bestseller"
    stock: { type: Number, default: 0 },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    tags: [String],
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-generate slug from name
productSchema.pre("save", function () {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
});

productSchema.index({ name: "text", description: "text", tags: "text" });

module.exports = mongoose.model("Product", productSchema);
