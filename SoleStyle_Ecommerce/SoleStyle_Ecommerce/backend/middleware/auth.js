const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes — require valid JWT
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Non autorisé, token manquant" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "solestyle_secret_2025");
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur introuvable" });
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalide" });
  }
};

// Admin-only middleware (must come after protect)
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Accès réservé aux administrateurs" });
  }
};

// Optional auth — attach user if token present, don't fail otherwise
const optionalAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "solestyle_secret_2025");
      req.user = await User.findById(decoded.id).select("-password");
    } catch (_) {
      // ignore invalid tokens
    }
  }
  next();
};

module.exports = { protect, admin, optionalAuth };
