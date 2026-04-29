const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const User = require("./models/User");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/solestyle";

async function setAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connecté à MongoDB");

    const email = "mohamedjbark35@gmail.com";
    const password = "admin123";

    // On cherche l'utilisateur
    let user = await User.findOne({ email });

    if (user) {
      console.log("🔄 Mise à jour de l'utilisateur existant...");
      user.password = password; // Sera haché par le hook pre('save')
      user.role = "admin";
      await user.save();
    } else {
      console.log("🆕 Création d'un nouvel utilisateur admin...");
      user = await User.create({
        name: "Admin Mohamed",
        email,
        password,
        role: "admin",
      });
    }

    console.log("\n✨ SUCCÈS !");
    console.log(`Email : ${user.email}`);
    console.log(`Mot de passe : ${password}`);
    console.log(`Rôle : ${user.role}`);
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Erreur :", err.message);
    process.exit(1);
  }
}

setAdmin();
