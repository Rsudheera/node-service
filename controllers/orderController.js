const Order = require('../models/orderModel');

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const { itemName, quantity, isSynced, shopId } = req.body;
    const order = await Order.create({ itemName, quantity, isSynced, shopId });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order', details: err.message });
  }
};

// Get All Orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders', details: err.message });
  }
};

// Get Order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order', details: err.message });
  }
};

// Update Order
exports.updateOrder = async (req, res) => {
  try {
    const { itemName, quantity, isSynced, shopId } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { itemName, quantity, isSynced, shopId },
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order', details: err.message });
  }
};

// Delete Order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order', details: err.message });
  }
};

// Sync Orders
exports.syncOrders = async (req, res) => {
    try {
      const orders = req.body; // Array of orders from the app
  
      if (!orders || !Array.isArray(orders)) {
        return res.status(400).json({ error: 'Invalid orders format' });
      }
  
      const results = {
        created: [],
        updated: [],
        failed: [],
      };
  
      for (const order of orders) {
        try {
          const { id, itemName, quantity, isSynced, updatedAt } = order;
  
          if (!id || !itemName || quantity === undefined || !updatedAt) {
            results.failed.push({ id, error: 'Missing required fields' });
            continue;
          }
  
          // Check if the order exists
          const existingOrder = await Order.findOne({ _id: id });
  
          if (existingOrder) {
            // Update existing order if local `updatedAt` is newer
            if (new Date(updatedAt) > new Date(existingOrder.updatedAt)) { 
              existingOrder.itemName = itemName;
              existingOrder.quantity = quantity;
              existingOrder.isSynced = true; // Mark as synced
              existingOrder.updatedAt = updatedAt;
              await existingOrder.save();
              results.updated.push(existingOrder);
            } else {
              results.failed.push({ id, error: 'Conflict: Outdated record `updatedAt` older' });
            }
          } else {
            // Create new order if it doesn't exist
            const newOrder = await Order.create({
              _id: id,
              itemName,
              quantity,
              isSynced: true, // Mark as synced
              updatedAt,
            });
            results.created.push(newOrder);
          }
        } catch (error) {
          results.failed.push({ id: order.id, error: error.message });
        }
      }
  
      res.status(200).json(results);
    } catch (err) {
      res.status(500).json({ error: 'Failed to sync orders', details: err.message });
    }
};

// Fetch updates
exports.fetchUpdates = async (req, res) => {
  try {
    const { lastSyncTime, shopId } = req.query;

    // Validate input
    if (!lastSyncTime || !shopId) {
      return res.status(400).json({ error: 'Missing required query parameters: lastSyncTime, shopId' });
    }

    // Find orders updated after the lastSyncTime for the given shopId
    const updatedOrders = await Order.find({
      shopId: shopId,
      // updatedAt: { $gt: new Date(lastSyncTime) },
    }).sort({ updatedAt: 1 }); // Sort by updatedAt for efficient syncing

    // Update isSynced to true for all fetched orders
    const orderIds = updatedOrders.map((order) => order._id); // Extract IDs of fetched orders
    if (orderIds.length > 0) {
      await Order.updateMany(
        { _id: { $in: orderIds } },
        { $set: { isSynced: true } }
      );
    }

    res.status(200).json(updatedOrders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch updates', details: error.message });
  }
};