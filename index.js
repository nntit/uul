const uWebSockets = require('uWebSockets.js');
const renderView = require('./src/renderView');
const readBody = require('./src/readBody');
const sendFile = require('./src/sendFile');
const staticFiles = require('./src/staticFiles');

class uul {
    #uws;
    constructor(options = {}) {
        if (options == null || typeof options !== 'object')
            throw new Error(' constructor only accepts an object type for the options parameter.');
        const { cert_file_name, key_file_name } = options;
        if (cert_file_name && key_file_name) {
            this.#uws = uWebSockets.SSLApp(options);
        } else {
            this.#uws = uWebSockets.App(options);
        }
    }
    get uws() {
        return this.#uws;
    }

    get() {
        this.#uws.get(...arguments);
    }
    listen() {
        this.#uws.listen(...arguments);
    }
}

module.exports = uul;
