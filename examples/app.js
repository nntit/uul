const uul = require('../');
const path = require('path');
const crypto = require('crypto')
const uws = uul.uws;
const App = uws.App({});

const wsMap = new Map()

uul.graphql(App, '/graphql', '/graphql', {
    folderFilesTypeDefs: path.join(__dirname, 'graphql/schema'),
    folderFilesResolvers: path.join(__dirname, 'graphql/schema'),
    depthLimit: 10,
    production: false,
});

App.get('/*', (res, req) => {
    /* It does Http as well */
    res.writeStatus('200 OK').writeHeader('IsExample', 'Yes').end('Hello there!');
});
App.ws('/*', {
    message: (ws, message, isBinary) => {
        let ok = ws.send(message, isBinary, true);
    },
    open: (ws) => {
        const uuid = crypto.randomUUID({ disableEntropyCache: true });
        ws.id = uuid;
        wsMap.set(uuid, ws)
        console.log(new Date(), 'open_connect', uuid, wsMap.size);
    },
    close: (ws, code, message) => {
        wsMap.delete(ws.id)
        console.log(new Date(), 'close_connect', code, ws.id, wsMap.size);
    }
})
App.listen(9001, (listenSocket) => {
    if (listenSocket) {
        console.log('Listening to port 9001');
    }
});
