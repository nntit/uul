const getBody = (res, cb) => {
    let data = Buffer.from([]);
    res.onData((ab, isLast) => {
        let chunk = Buffer.from(ab);
        if (isLast) {
            cb(true, Buffer.concat([data, Buffer.from(chunk)]).toString());
        } else {
            data = Buffer.concat([data, Buffer.from(chunk)]);
        }
    });
    res.onAborted(() => {
        cb(false);
    });
};

module.exports = getBody;
