const uul = require('../');
const path = require('path');
const uws = uul.uws;
const App = uws.App({});

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
    }

})
App.listen(9001, (listenSocket) => {
    if (listenSocket) {
        console.log('Listening to port 9001');
    }
});
