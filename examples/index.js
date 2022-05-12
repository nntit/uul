const uul = require('../');
const uws = uul.uws;
const App = uws.App({});

uul.staticFiles(App, '/*', path.resolve(__dirname, './dist'), 'index.html');
