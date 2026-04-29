// Configuration centralisée (variables d'env avec valeurs par défaut)
module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/solestyle",
  JWT_SECRET: process.env.JWT_SECRET || "solestyle_secret_key_change_in_production",
  JWT_EXPIRE: "30d",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  FREE_SHIPPING_THRESHOLD: 500,
  SHIPPING_COST: 30,
};
