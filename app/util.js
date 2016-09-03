var fs                          = require('fs')
    , path_library              = require('path')
    , Promise                   = require('bluebird')
    , rimraf                    = require('rimraf')

exports.settings = {                                                        // must come after make-key
    debug: false,

    root_path: ".",
    get_root: function(){ return path_library.resolve(this.root_path); },
    process_state_filename: "\\codeily_process_state.json",
    state_filename: "\\codeily_state.json",
    provision_filename: "\\_provision_codeily.json",
    config_filename: "\\codeily.json",
    target_path: "",                                                // should be drawn from a provisioning file

    temp_pathname: function(){ return (this.get_root() + "\\temp\\clone\\"); },         // temporary storage of repo after downloading

    test_repo: 'https://github.com/SaatsIncOrg/test.git',
    test_make_dir: 'test_make',
};

exports.get_rand = function (){               // up to 9999
    var quantity_of_nums = 5000;
    var milliseconds = new Date().getMilliseconds();
    return Math.floor(milliseconds * quantity_of_nums / 1000);
};

exports.cleanup = function(){                       // for now, just a wrapper for

    return exports.delete_folder(exports.settings.temp_pathname());

};

exports.log = function(m, jsonify){
    if (exports.settings.debug)
        console.log(m, JSON.stringify(jsonify, null, 4));
};

exports.get_file = function(path){                                                     // save it
    exports.log('Looking to get file ' + path + '.');

    return new Promise(function (resolve, reject) {                     // promisify
        fs.readFile(path, 'utf8', function(err, data){
            if (err)
                reject(err);
            else
                resolve(data);
        });
    });
};

exports.make_file = function(data, path){

    return new Promise(function(resolve, reject){
        fs.writeFile(path, JSON.stringify(data, null, 4), function (err) {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
};

exports.file_folder_exists = function(path){                                // does NOT fail either way, returns true/false
    return new Promise(function(resolve, reject) {
        fs.access(path, fs.F_OK, function (err) {
            if (!err) {
                resolve(true);
            } else {
                resolve(false)
            }
        });
    });
};

exports.get_folder = function(path){                        // promisify wrapper
    exports.log('Looking to get folder ' + path + '.');
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
    exports.log('Looking to delete folder ' + path + '.');
    return new Promise(function(resolve, reject){
        rimraf(path,function(err){
            if(err)
                reject(err);
            else
                resolve();
        });
    });
};

exports.delete_file = function(path){
    exports.log('Looking to delete file ' + path + '.');
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
    exports.log('Looking to create folder ' + path + '.');
    return new Promise(function (resolve, reject) {                     // promisify

        fs.mkdir(path, function (err) {
            if (err)                                                    // if error, fail
                reject(err);
            else
                resolve();
        });
    });
};

exports.is_json = function(string){
    // Below returns 'true' if json
    return (/^[\],:{}\s]*$/.test(string.replace(/\\["\\\/bfnrtu]/g, '@').
        replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
        replace(/(?:^|:|,)(?:\s*\[)+/g, ''))
    );
};

exports.add_slashes = function(str){
    return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
};

exports.in_array = function(needle, haystack, column){
   // console.log('checking to see if ' + needle + ' is in column ' + column + ' of array', haystack);

    if ((typeof needle === 'undefined') || (typeof haystack === 'undefined') || (typeof column === 'undefined'))
        return -1;

    for (var i=0; i<haystack.length; i++){
        if (haystack[i][column] == needle)
            return i;
    }

    return -1;
};

exports.sort_array = function(data){
    data.sort(function(a, b) {
        var nameA = a.file.toUpperCase(); // ignore upper and lowercase
        var nameB = b.file.toUpperCase(); // ignore upper and lowercase

        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }

        // names must be equal
        return 0;
    });

    return data;
};

exports.strip_returns = function(str){
    return str.replace(/(\r\n|\n|\r)/gm,"");
}