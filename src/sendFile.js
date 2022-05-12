var fs = require('fs');

const sendFile = (res, filePath) => {
    const totalSize = fs.statSync(filePath).size;
    const readStream = fs.createReadStream(filePath);
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
};

module.exports = sendFile;
