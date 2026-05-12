const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const { protect, admin } = require('../middleware/auth');

// GET /api/settings - Public settings
router.get('/', async (req, res) => {
    try {
        const settings = await Setting.find({});
        const config = {};
        settings.forEach(s => {
            config[s.key] = s.value;
        });
        res.json(config);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/settings - Update settings (Admin only)
router.post('/', protect, admin, async (req, res) => {
    try {
        const updates = req.body; // { whatsapp: "...", instagram: "..." }
        for (const [key, value] of Object.entries(updates)) {
            await Setting.findOneAndUpdate(
                { key },
                { key, value },
                { upsert: true, returnDocument: 'after' }
            );
        }
        res.json({ message: "Paramètres mis à jour !" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
