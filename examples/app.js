const uul = require('../');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const uws = uul.uws;
const App = uws.App({});

async function mongo() {
    await mongoose.connect("mongodb+srv://test:test@cluster0.8uf2s.mongodb.net/?retryWrites=true&w=majority");
}
mongo().catch((err) => console.log(err));

const wsMap = new Map();

uul.graphql(App, '/graphql', '/graphql', {
    folderFilesTypeDefs: path.join(__dirname, 'graphql/schema'),
    folderFilesResolvers: path.join(__dirname, 'graphql/schema'),
    depthLimit: 10,
    production: false,
});

App.get('/*', (res, req) => {
    const uuid = crypto.randomUUID({ disableEntropyCache: true });
    res.writeHeader('Set-Cookie', '_token=' + uuid + '; SameSite=Strict; HttpOnly');
    uul.renderView(res, path.join(__dirname, 'view/index.ejs'), {});
});
App.ws('/*', {
    message: (ws, message, isBinary) => {
        let ok = ws.send(message, isBinary, true);
    },
    upgrade(res, req, context) {
        uid = uul.getCookie(req, '_token');

        // authorization
        if (false) {
            return res.writeStatus('401').end();
        }
        res.upgrade(
            {
                uid: uid,
            },
            req.getHeader('sec-websocket-key'),
            req.getHeader('sec-websocket-protocol'),
            req.getHeader('sec-websocket-extensions'),
            context
        );
    },
    open: (ws) => {
        wsMap.set(ws.uid, ws);
        console.log(new Date(), 'open_connect', ws.uid, wsMap.size);
    },
    close: (ws, code, message) => {
        wsMap.delete(ws.uid);
        console.log(new Date(), 'close_connect', code, ws.uid, wsMap.size);
    },
});
App.listen(9001, (listenSocket) => {
    if (listenSocket) {
        console.log('Listening to port 9001');
    }
});
