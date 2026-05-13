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
router.post('/', protect, admin, upload.array('images', 5), (req, res) => {
    // req.files est fourni par multer.
    const filePaths = req.files.map(f => `/uploads/${f.filename}`);
    res.json(filePaths); 
});

module.exports = router;
