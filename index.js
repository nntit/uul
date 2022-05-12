const uws = require('uWebSockets.js');
const renderView = require('./src/renderView');
const readBody = require('./src/readBody');
const sendFile = require('./src/sendFile');

const uwu = {
    uws,
    renderView,
    readBody,
    sendFile,
};

module.exports = uwu;
