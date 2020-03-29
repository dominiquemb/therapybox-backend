var fs = require('fs');

module.exports = function moveFile(oldPath, newPath, callback) {

    fs.rename(oldPath, newPath, function (err) {
        if (err) {
            if (err.code === 'EXDEV') {
                copy();
            } else {
                if (callback) {
                    callback(err);
                }
            }
            return;
        }
        if (callback) {
            callback();
        }
    });

    function copy() {
        var readStream = fs.createReadStream(oldPath);
        var writeStream = fs.createWriteStream(newPath);

        if (callback) {
            readStream.on('error', callback);
            writeStream.on('error', callback);
        }

        readStream.on('close', function () {
            if (callback) {
                fs.unlink(oldPath, callback);
            }
        });

        readStream.pipe(writeStream);
    }
}