var fs                  = require('graceful-fs')
    , util              = require('./util')
    , path_library      = require('path')
    , Promise           = require('bluebird')
    , mkdirp            = require('mkdirp')


exports.make_dir = function(path){                          // takes full file-path
    return new Promise(function(resolve, reject) {
        var slash = path.lastIndexOf('/'),
            path2 = path.substr(0, slash);
        util.log("Looking to create folder tree " + path2);

        mkdirp(path2, function (err) {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
};


exports.copy_file = function(source, target){
    util.log('Looking to copy file from ' + source + ' to ' + target + '.');

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

exports.loop_list = function(source_path, target_path, array){
    return new Promise(function(resolve, reject) {
        function check_end(){
            total++;
            if (total >= length) {                            // if reached end of array, return successfully
                resolve();
            }
        }

        var length = array.length,
            total = 0;

        if (array.length <= 0){                         // empty list
            reject('Loop_list: no files in list to process.');
        }
        else {                                          // something exists in list
            array.forEach(function (element, index) {
                var target = target_path + '/' + element.file,
                    source = source_path + '/' + element.file;
                //console.log('###################', target, source);

                if (element.action === 'remove'){                           // remove
                    //console.log('!!!!!!!!!!!!!!!! REMOVING');
                    util.file_folder_exists(target)
                        .then(function(exists){
                            if (exists)                                     // if exists, delete it.
                                util.delete_file(target)
                                    .then(function(){
                                        check_end();
                                    })
                                    .catch(function(err){
                                        reject('Failed to delete file:' + err);
                                    });
                            else                                            // if doesn't exist - ignore
                                check_end();
                        })
                        .catch(function(err){
                            reject('Failed to remove file: ' + err);
                        })
                }
                else{                                                       // add
                    //console.log('!!!!!!!!!!!!!!!! ADDING: ' + target);
                    util.file_folder_exists(target)
                        .then(function(exists){
                            if (exists) {

                                return exports.copy_file(source, target)
                                    .then(function(){
                                        check_end();
                                    })
                                    .catch(function(err){
                                        reject('Error in copying file: ' + err)
                                    });
                            }
                            else{

                                return exports.make_dir(target)
                                    .then(function(){
                                        //console.log('88888888888888888888 made dir ' + target);
                                        return exports.copy_file(source, target);
                                    })
                                    .then(function(){
                                        check_end();
                                    })
                                    .catch(function(err){
                                        reject('Error making directory / copying file: ' + err);
                                    })
                            }
                        })
                        .catch(function(err){
                            reject('Failed to copy files: ' + err);
                        });
                }
            });
        }

    });
};

exports.process_list = function(source_path, target_path, force_process_list){
    var process_list = source_path + (force_process_list || util.settings.process_state_filename),                  // allow override for testing
        list_contents = [];
    return new Promise(function(resolve, reject) {
        util.get_file(process_list)
            .then(function (res) {
                list_contents = JSON.parse(res);
                util.log('>>>>>> Process state file', list_contents);
                return exports.loop_list(source_path, target_path, list_contents);
            })
            .then(function(){
                return util.make_file(list_contents, target_path + util.settings.state_filename);                       // create the "old" state (in the target-folder) for use next time
            })
            .then(function(){
                resolve();
            })
            .catch(function (err) {
                reject(err);
            });
    });
};