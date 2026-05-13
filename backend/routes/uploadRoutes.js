const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Créer le dossier s'il n'existe pas
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration du stockage de Multer
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadDir); // Le dossier où les images seront sauvegardées
    },
    filename(req, file, cb) {
        // Renommer le fichier pour éviter les conflits
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

// Vérification du type de fichier (uniquement des images)
function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp/; // Accepter ces extensions
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images seulement ! (jpg, jpeg, png, webp)');
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

// @desc    Télécharger plusieurs images (Admin seulement)
// @route   POST /api/upload
// @access  Privé/Admin
router.post('/', protect, admin, (req, res) => {
    upload.array('images', 5)(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: `Erreur Multer: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ message: `Erreur: ${err.toString()}` });
        }
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "Aucun fichier n'a été reçu par le serveur." });
        }

        try {
            const filePaths = req.files.map(f => `/uploads/${f.filename}`);
            res.json(filePaths); 
        } catch (error) {
            res.status(500).json({ message: `Erreur interne: ${error.message}` });
        }
    });
});

module.exports = router;
