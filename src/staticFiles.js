const path = require('path');
const fs = require('fs');
const assert = require('assert');
var mime = require('mime-types');
const lastModified = new Date().toUTCString();

const staticFiles = (App, routePath, filePath, fallback) => {
    assert(App instanceof Object);
    assert(App.get instanceof Function);
    assert(typeof routePath === 'string');
    assert(typeof filePath === 'string');
    var pathFileIndex = filePath;
    if (typeof fallback === 'string') {
        pathFileIndex = path.resolve(filePath, fallback);
    }
    App.get(routePath, (res, req) => {
        var strFile =
            req.getUrl() == '/'
                ? pathFileIndex
                : path.resolve(filePath, req.getUrl().replace(routePath.replace('*', ''), ''));
        if (!(fs.existsSync(strFile) && fs.lstatSync(strFile).isFile())) {
            strFile = pathFileIndex;
        }
        if (!(fs.existsSync(strFile) && fs.lstatSync(strFile).isFile())) {
            res.writeStatus('404').end();
        } else {
            const totalSize = fs.statSync(strFile).size;
            if (totalSize <= 0) {
                res.end();
            } else {
                typedata = mime.lookup(strFile);
                res.writeHeader('Last-Modified', lastModified);
                if (typedata) res.writeHeader('Content-Type', typedata);

                const readStream = fs.createReadStream(strFile);
                readStream
                    .on('data', (chunk) => {
                        const ab = chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength);
                        let lastOffset = res.getWriteOffset();
                        let [ok, done] = res.tryEnd(ab, totalSize);
                        if (done) {
                            readStream.destroy();
                        } else if (!ok) {
                            readStream.pause();
                            res.ab = ab;
                            res.abOffset = lastOffset;
                            res.onWritable((offset) => {
                                let [ok, done] = res.tryEnd(res.ab.slice(offset - res.abOffset), totalSize);
                                if (done) {
                                    readStream.destroy();
                                } else if (ok) {
                                    readStream.resume();
                                }
                            });
                        }
                    })
                    .on('error', () => {
                        if (!res.aborted) {
                            res.writeStatus('500').end();
                        }
                        readStream.destroy();
                    });

                res.onAborted(() => {
                    res.aborted = true;
                    if (readStream) {
                        readStream.destroy();
                    }
                });
            }
        }
    });
};

module.exports = staticFiles;
