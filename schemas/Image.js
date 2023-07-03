const mongoose = require('mongoose')

const ImageSchema = new mongoose.Schema({
    url: {
        type: String,
    },
    description: {
        type: String,
    }
});

module.exports = mongoose.model("Image", ImageSchema);