const express = require('express')
const upload = require('../services/upload');

const { getImage, uploadImage } = require('../controllers/upload');

const router = express.Router();

router.get('/images', getImage);
router.post('/upload', upload.single('picture'), uploadImage)

module.exports = router;