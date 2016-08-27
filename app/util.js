var fs                  = require('fs')
    , Promise           = require('bluebird')
    , rimraf             = require('rimraf')

exports.settings = {                                                        // must come after make-key
    repo: 'https://github.com/SaatsIncOrg/test.git',

    set_temp_dir: '../temp',                    // outer
    set_temp_file: 'temp',                      // name of repo dir

    test_make_dir: '../test_make',

    temp_dir: function(rand){ return (__dirname + "/temp"); },          // repo dir
    upload_dir: function(rand){ return (__dirname + "/../temp/clone" + rand + "/"); }
};

exports.get_rand = function (){               // up to 9999
    var quantity_of_nums = 5000;
    var milliseconds = new Date().getMilliseconds();
    return Math.floor(milliseconds * quantity_of_nums / 1000);
};

exports.cleanup = function(rand){                       // for now, just a wrapper for

    return exports.delete_folder(exports.settings.upload_dir(rand));

};

exports.get_file = function(path){                                                     // save it
    console.log('Looking to get file ' + path + '.');

    return new Promise(function (resolve, reject) {                     // promisify
        fs.readFile(path, 'utf8', function(err, data){
            if (err)
                reject(err);
            else
                resolve(data);
        });
    });
};


exports.get_folder = function(path){                        // promisify wrapper
    console.log('Looking to get folder ' + path + '.');
    return new Promise(function(resolve, reject){
        fs.readdir(path, function(err, files) {
            if(err)
                reject(err);
            else
                resolve(files);
        });
    })
};

exports.delete_folder = function(path){
    console.log('Looking to delete folder ' + path + '.');
    return new Promise(function(resolve, reject){
        rimraf(path,function(err){              //////////////////////////////////////////// todo: last was working here
            if(err)
                reject(err);
            else
                resolve();
        });
    });
};

exports.delete_file = function(path){
    console.log('Looking to delete file ' + path + '.');
    return new Promise(function(resolve, reject){
        fs.unlink(path, function(err){
            if (err)
                reject(err);
            else
                resolve();
        });
    });
};

exports.make_folder = function(path){
    console.log('Looking to create folder ' + path + '.');
    return new Promise(function (resolve, reject) {                     // promisify

        fs.mkdir(path, function (err) {
            if (err)                                                    // if error, fail
                reject(err);
            else
                resolve();
        });
    });
};