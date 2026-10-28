const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/userdb";
const PORT = process.env.PORT || 5001;

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("User DB connected"))
  .catch((err) => console.log("DB error:", err.message));

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: String,
  })
);

// CREATE (register)
app.post("/users/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, phone });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, phone: user.phone });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// LOGIN
app.post("/users/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "Wrong password" });
  res.json({ message: "Login successful", userId: user._id, name: user.name });
});

// READ all
app.get("/users", async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

// READ one
app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: "Invalid id" });
  }
});

// UPDATE
app.put("/users/:id", async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { name, phone }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: "Invalid id" });
  }
});

// DELETE
app.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(400).json({ error: "Invalid id" });
  }
});

app.listen(PORT, () => console.log(`User service running on port ${PORT}`));
