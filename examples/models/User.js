var mongoose = require('mongoose');
const hmacSHA512 = require('crypto-js/hmac-sha512');

var schema = new mongoose.Schema(
    {
        username: {
            type: String,
            index: true,
            required: true,
            unique: true,
            validate: {
                validator: function (v) {
                    return RegExp('^(?=.{4,20}$)(?![_.-])(?!.*[_.-]{2})[a-zA-Z0-9._-]+(?<![_.-])$').test(v);
                },
                message: (props) =>
                    `username is 8-20 characters long, allowed characters a-z A-Z 0-9 _.-, no _.- at the beginning, no __ or _. or _- or .- inside, no _.- at the end`,
            },
        },
        password: {
            type: String,
            required: true,
        },
        name: {
            type: String,
        },
        app_id: {
            type: mongoose.Types.ObjectId,
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

schema.pre('save', function (next) {
    var user = this;
    if (!user.isModified('password')) return next();
    user.password = hmacSHA512(user.password, 'Key');
    next();
});

module.exports = mongoose.model('User', schema);
