// ─────────────────────────────────────────────────────────────────
//  SOLE STYLE — Backend API (Node.js + Express + MongoDB + JWT)
//  server.js — Point d'entrée principal
// ─────────────────────────────────────────────────────────────────

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const User = require("./models/User");


// Charger les variables d'environnement
dotenv.config();

const app = express();

// ─── MIDDLEWARES ──────────────────────────────────────────────────
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5000",
      "http://127.0.0.1:5500",
      "http://127.0.0.1:3000",
      "https://jbshoes.netlify.app",
    ],
    credentials: true,
  })
);
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Servir les images uploadées localement
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── FRONTEND STATIQUE ────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "../frontend")));

// ─── ROUTES ───────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/promo", require("./routes/promoCodes"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/stats", require("./routes/stats"));

// Route de santé
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Route pour injecter les produits (pratique pour Railway)
app.get("/api/seed", (req, res) => {
  const { exec } = require("child_process");
  exec("node seed.js", { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Erreur seed: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
    console.log(`Seed réussi:\n${stdout}`);
    res.json({ message: "Base de données générée avec succès ! Les produits sont maintenant disponibles.", output: stdout });
  });
});

// Route pour créer le compte admin en production
app.get("/api/createAdmin", async (req, res) => {
  try {
    const admins = [
      { name: "SoleStyle Admin", email: "admin@jbshoes.ma", password: "admin123", role: "admin" },
      { name: "Mohamed Admin", email: "mohamedjbark35@gmail.com", password: "admin123", role: "admin" }
    ];

    let results = [];
    for (const adminData of admins) {
      let user = await User.findOne({ email: adminData.email });
      if (user) {
        user.role = "admin";
        user.password = adminData.password;
        await user.save();
        results.push(`Mis à jour : ${adminData.email}`);
      } else {
        await User.create(adminData);
        results.push(`Créé : ${adminData.email}`);
      }
    }
    res.json({ message: "Comptes administrateurs vérifiés/créés avec succès !", results });
  } catch (err) {
    console.error(`Erreur admin: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// Fallback — sert le frontend pour les routes non-API
app.use((req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ message: "Route API introuvable" });
  }
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ─── CONNEXION MONGODB ────────────────────────────────────────────
console.log("DEBUG: MONGO_URI =", process.env.MONGO_URI ? "DÉFINIE" : "NON DÉFINIE");
console.log("DEBUG: MONGODB_URI =", process.env.MONGODB_URI ? "DÉFINIE" : "NON DÉFINIE");

const MONGO_URI =
  process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/solestyle";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅  MongoDB connected successfully");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀  Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌  MongoDB connection error:", err.message);
    process.exit(1);
  });
