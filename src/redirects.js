const redirects = (res, url) => {
    res.writeStatus('302');
    res.writeHeader('location', url);
    res.end();
};

module.exports = redirects;
