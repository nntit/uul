var mongoose = require('mongoose');
const hmacSHA512 = require('crypto-js/hmac-sha512');

var schema = new mongoose.Schema(
    {
        name: {
            type: String,
        },
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    },
    { versionKey: false }
);

module.exports = mongoose.model('Groups', schema);
