var mongoose = require('mongoose');

var schema = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        info: [
            {
                key: { type: String },
                name: { type: String },
                value: { type: String },
            },
        ],
        input: [
            {
                key: { type: String },
                name: { type: String },
                type: { type: String },
                value: { type: String },
            },
        ],
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    },
    { versionKey: false }
);
schema.index({ name: 'text' });
module.exports = mongoose.model('App', schema);
