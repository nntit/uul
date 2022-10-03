const path = require('path');
const fs = require('fs');
const { getParts } = require('uWebSockets.js');
const { v4: uuidv4 } = require('uuid');
const mime = require('mime');

// {
//     "name": "xxx.png",
//     "status": "done",
// }

const upload = (App, routePath, pathFile) => {
    App.post(routePath, (res, req) => {
        const header = req.getHeader('content-type');
        let buffer = Buffer.from('');
        res.onData((chunk, isLast) => {
            buffer = Buffer.concat([buffer, Buffer.from(chunk)]);
            if (isLast) {
                const datas = getParts(buffer, header);
                if (datas && datas.filter((data) => data.type).length > 0) {
                    var listFile = [];
                    for (let index = 0; index < datas.length; index++) {
                        const type = mime.getExtension(datas[index].type);
                        const uuid = uuidv4();
                        if (!fs.existsSync(pathFile)) {
                            fs.mkdirSync(pathFile);
                        }
                        const fileStream = fs.createWriteStream(path.join(pathFile, uuid + '.' + type));
                        fileStream.write(Buffer.from(datas[index].data));
                        fileStream.end();
                        listFile = listFile.concat([
                            {
                                name: uuid + '.' + type,
                                status: 'done',
                            },
                        ]);
                    }
                    if (listFile.length > 1) {
                        res.writeHeader('Content-Type', 'application/json')
                            .writeHeader('Date', Date())
                            .end(JSON.stringify(listFile));
                    } else {
                        res.writeHeader('Content-Type', 'application/json')
                            .writeHeader('Date', Date())
                            .end(JSON.stringify(listFile[0]));
                    }
                } else {
                    res.end('');
                }
            }
        });
        res.onAborted(() => {
            fileStream.destroy();
        });
    });
};

module.exports = upload;
