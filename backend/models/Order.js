const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  size: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional (guest checkout)
    customerInfo: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      zipCode: { type: String },
    },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["livraison", "carte", "virement"],
      default: "livraison",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    notes: { type: String },
    orderNumber: { type: String, unique: true },
  },
  { timestamps: true }
);

// Auto-generate order number
orderSchema.pre("save", async function () {
  if (!this.orderNumber) {
    const count = await mongoose.model("Order").countDocuments();
    this.orderNumber = `SS-${String(count + 1).padStart(5, "0")}`;
  }
});

module.exports = mongoose.model("Order", orderSchema);
