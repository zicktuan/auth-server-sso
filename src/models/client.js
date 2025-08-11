const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
    client_id: {
        type: String,
        required: true,
        unique: true,
    },
    client_secret: {
        type: String,
        required: true,
    },
    redirect_uri: {
        type: String,
        required: true,
        unique: true,
    },
    client_name: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('Client', ClientSchema);