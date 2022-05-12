const assert = require('assert');
const ejs = require('ejs');

const renderView = (res, view, data) => {
    assert(typeof view === 'string');
    assert(data instanceof Object);
    ejs.renderFile(view, data, (err, str) => {
        if (!err) {
            res.end(str);
        } else {
            res.end('render err');
        }
    });
};

module.exports = renderView;
