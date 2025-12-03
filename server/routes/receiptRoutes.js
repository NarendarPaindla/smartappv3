const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
    destination(req, file, cb) {
        const uploadPath = 'uploads/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        const filetypes = /jpg|jpeg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb('Images only!');
        }
    },
});

// @desc    Upload receipt and perform OCR
// @route   POST /api/receipts/upload
// @access  Private
router.post('/upload', protect, upload.single('image'), async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    const imagePath = req.file.path;

    try {
        const { data: { text } } = await Tesseract.recognize(imagePath, 'eng');

        // Basic extraction logic (very naive)
        // Look for currency symbols or numbers
        const amountRegex = /[\$\£\€]?\s?(\d+\.\d{2})/;
        const dateRegex = /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/;

        const amountMatch = text.match(amountRegex);
        const dateMatch = text.match(dateRegex);

        const extractedAmount = amountMatch ? amountMatch[1] : null;
        const extractedDate = dateMatch ? dateMatch[1] : null;

        // Return the path relative to server or a public URL if we served static files
        // For now, just return the path
        res.status(200).json({
            receiptImageUrl: imagePath,
            extractedRawText: text,
            extractedAmount,
            extractedDate,
        });
    } catch (error) {
        console.error(error);
        res.status(500);
        throw new Error('OCR Failed');
    }
});

module.exports = router;
