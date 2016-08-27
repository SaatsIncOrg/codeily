var fs                  = require('fs')
    , path_library        = require('path')
    , Promise             = require('bluebird')
    , mkdirp            = require('mkdirp')


exports.make_dir = function(path){                          // takes full file-path

    return new Promise(function(resolve, reject) {
        var slash_forward = path.lastIndexOf('/'),
            slash_backward = path.lastIndexOf('\\'),
            slash = ((slash_forward > 0) ? slash_forward : slash_backward),
            path2 = path.substr(0, slash);
        console.log("Looking to create folder tree " + path2);

        mkdirp(path2, function (err) {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
};


exports.copy_file = function(source, target){
    console.log('Looking to copy file from ' + source + ' to ' + target + '.');

    return new Promise(function(resolve, reject){
        var promiseCalled = false;

        var rd = fs.createReadStream(source);
        rd.on("error", function(err) {
            done(err);
        });
        var wr = fs.createWriteStream(target);
        wr.on("error", function(err) {
            done(err);
        });
        wr.on("close", function(ex) {
            done();
        });
        rd.pipe(wr);

        function done(err) {
            if (!promiseCalled) {
                if (err)
                    reject(err);
                else
                    resolve();
                promiseCalled = true;
            }
        }

    });
};