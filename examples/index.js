const uul = require('../');
const renderView = require('./src/renderView');
const readBody = require('./src/readBody');
const sendFile = require('./src/sendFile');
const staticFiles = require('./src/staticFiles');

const App = new uul({});
const uws = App.uws;

uws.get('/*', (res, req) => {
    /* It does Http as well */
    res.writeStatus('200 OK').writeHeader('IsExample', 'Yes').end('Hello there!');
});
App.get('/test/*', (res, req) => {
    /* It does Http as well */
    res.writeStatus('200 OK').writeHeader('IsExample', 'Yes').end('Hello there!');
});
App.listen(9001, (listenSocket) => {
    if (listenSocket) {
        console.log('Listening to port 9001');
    }
});
