// ─────────────────────────────────────────────────────────────────────────────
//  SOLE STYLE — Création du compte Administrateur
//  Usage: node createAdmin.js
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const User = require("./models/User");

const MONGO_URI =
  process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/solestyle";

const ADMIN = {
  name: "Admin JbShoes",
  email: "admin@jbshoes.ma",
  password: "admin123",
  role: "admin",
  phone: "0600000000",
  city: "Casablanca",
};

async function createAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connecté");

    const existing = await User.findOne({ email: ADMIN.email });
    if (existing) {
      console.log("⚠️  Un compte admin existe déjà :");
      console.log(`   Email    : ${existing.email}`);
      console.log(`   Rôle     : ${existing.role}`);
      console.log("   Pour changer le mot de passe, modifiez le fichier createAdmin.js");
      process.exit(0);
    }

    const admin = await User.create(ADMIN);
    console.log("\n🎉 Compte administrateur créé avec succès !");
    console.log("─".repeat(40));
    console.log(`   Email    : ${admin.email}`);
    console.log(`   Mot de passe : ${ADMIN.password}`);
    console.log(`   Rôle     : ${admin.role}`);
    console.log("─".repeat(40));
    console.log("\n⚠️  Pensez à changer le mot de passe après la première connexion !");
    process.exit(0);
  } catch (err) {
    console.error("❌ Erreur :", err.message);
    process.exit(1);
  }
}

createAdmin();
