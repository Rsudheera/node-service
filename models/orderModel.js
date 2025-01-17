const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const orderSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 }, // Use UUID as the default ID
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true },
    isSynced: { type: Boolean, default: false },
    shopId: { type: String, required: true },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

module.exports = mongoose.model('Order', orderSchema);
