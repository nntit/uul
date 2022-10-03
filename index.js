module.exports = {
    uws: require('uWebSockets.js'),
    graphql: require('./src/graphql'),
    renderView: require('./src/renderView'),
    getBody: require('./src/getBody'),
    getCookie: require('./src/getCookie'),
    sendFile: require('./src/sendFile'),
    staticFiles: require('./src/staticFiles'),
    redirects: require('./src/redirects'),
    setCookie: require('./src/setCookie'),
    upload: require('./src/upload'),
};