const express = require('express');
const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  syncOrders,
  fetchUpdates,
} = require('../controllers/orderController');

const router = express.Router();

// Sync orders route
router.post('/sync', syncOrders);
// Fetch updates for a specific shop
router.get('/fetch-updates', fetchUpdates);

// CRUD Routes
router.post('/', createOrder); // Create Order
router.get('/', getAllOrders); // Get All Orders
router.get('/:id', getOrderById); // Get Order by ID
router.put('/:id', updateOrder); // Update Order
router.delete('/:id', deleteOrder); // Delete Order


module.exports = router;
