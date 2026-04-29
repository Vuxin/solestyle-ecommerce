const mongoose = require("mongoose");
const Category = require("./models/Category");
const dotenv = require("dotenv");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/solestyle";

async function addCategories() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connecté à MongoDB");

    const newCategories = [
      { name: "Sneakers Homme", slug: "sneakers-homme", emoji: "👟", order: 1 },
      { name: "Sneakers Femme", slug: "sneakers-femme", emoji: "👟", order: 2 }
    ];

    for (const cat of newCategories) {
      const exists = await Category.findOne({ slug: cat.slug });
      if (!exists) {
        await Category.create(cat);
        console.log(`✅ Catégorie ajoutée : ${cat.name}`);
      } else {
        console.log(`⚠️ La catégorie ${cat.name} existe déjà.`);
      }
    }

  } catch (err) {
    console.error("Erreur :", err.message);
  } finally {
    mongoose.connection.close();
    console.log("Déconnecté de MongoDB");
  }
}

addCategories();
