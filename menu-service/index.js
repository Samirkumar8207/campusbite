const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/menudb";
const PORT = process.env.PORT || 5002;

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("Menu DB connected"))
  .catch((err) => console.log("DB error:", err.message));

const MenuItem = mongoose.model(
  "MenuItem",
  new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: String,
    available: { type: Boolean, default: true },
  })
);

// CREATE
app.post("/menu", async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ all
app.get("/menu", async (req, res) => {
  const items = await MenuItem.find();
  res.json(items);
});

// READ one
app.get("/menu/:id", async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: "Invalid id" });
  }
});

// UPDATE
app.put("/menu/:id", async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: "Invalid id" });
  }
});

// DELETE
app.delete("/menu/:id", async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(400).json({ error: "Invalid id" });
  }
});

app.listen(PORT, () => console.log(`Menu service running on port ${PORT}`));