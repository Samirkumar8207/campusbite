const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");

const app = express();
app.use(express.json());

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/orderdb";
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:5001";
const MENU_SERVICE_URL = process.env.MENU_SERVICE_URL || "http://localhost:5002";
const PORT = process.env.PORT || 5003;

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("Order DB connected"))
  .catch((err) => console.log("DB error:", err.message));

const Order = mongoose.model(
  "Order",
  new mongoose.Schema({
    userId: { type: String, required: true },
    items: [
      {
        menuItemId: String,
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    totalAmount: Number,
    status: { type: String, default: "placed" },
    createdAt: { type: Date, default: Date.now },
  })
);

// CREATE order (calls User service and Menu service)
app.post("/orders", async (req, res) => {
  try {
    const { userId, items } = req.body;
    if (!userId || !items || items.length === 0) {
      return res.status(400).json({ error: "userId and items are required" });
    }

    // 1. check user exists (User service)
    try {
      await axios.get(`${USER_SERVICE_URL}/users/${userId}`);
    } catch (e) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2. get each item's name and price (Menu service)
    const orderItems = [];
    let total = 0;
    for (const it of items) {
      let menuItem;
      try {
        const r = await axios.get(`${MENU_SERVICE_URL}/menu/${it.menuItemId}`);
        menuItem = r.data;
      } catch (e) {
        return res.status(404).json({ error: `Menu item not found: ${it.menuItemId}` });
      }
      const qty = it.quantity || 1;
      orderItems.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: qty,
      });
      total += menuItem.price * qty;
    }

    // 3. save order
    const order = await Order.create({ userId, items: orderItems, totalAmount: total });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ all
app.get("/orders", async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});

// READ one
app.get("/orders/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: "Invalid id" });
  }
});

// UPDATE (order status)
app.put("/orders/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: "Invalid id" });
  }
});

// DELETE (cancel order)
app.delete("/orders/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(400).json({ error: "Invalid id" });
  }
});

app.listen(PORT, () => console.log(`Order service running on port ${PORT}`));