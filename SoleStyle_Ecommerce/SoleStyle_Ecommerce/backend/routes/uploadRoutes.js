const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Configuration du stockage de Multer
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/'); // Le dossier où les images seront sauvegardées
    },
    filename(req, file, cb) {
        // Renommer le fichier pour éviter les conflits (ex: nomdufichier-1683949.jpg)
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
    // req.files est fourni par multer. On renvoie un tableau de chemins.
    const filePaths = req.files.map(f => `/${f.path.replace(/\\/g, '/').replace(/^uploads\//, 'uploads/')}`);
    res.json(filePaths); 
});

module.exports = router;
