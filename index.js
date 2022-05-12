const uws = require('uWebSockets.js');
const renderView = require('./src/renderView');
const readBody = require('./src/readBody');
const sendFile = require('./src/sendFile');
const staticFiles = require('./src/staticFiles');

const uwu = {
    uws,
    renderView,
    readBody,
    sendFile,
    staticFiles,
};

module.exports = uwu;
