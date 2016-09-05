var simpleGit               = require('simple-git')
    , fs                    = require('graceful-fs')
    , path_library          = require('path')
    , Promise               = require('bluebird')
    , util                  = require('./util.js');

function go_retrieve(tag, repo, branch){
    return new Promise(function(resolve, reject){
        branch = branch || "master";

        util.make_folder(util.settings.temp_pathname(tag))
            .then(function(){
                simpleGit()
                    .clone(repo, util.settings.temp_pathname(tag), ['-b', branch])                                                            // clone
                    .then(function (err) {
                        console.log('Clone finished');

                        if (err) {                                                                      // if can't clone, faile and delete directory
                            console.log('Clone failed');

                            util.cleanup(tag)
                                .finally(function (err) {
                                    reject(err);
                                });
                        }
                        else {
                            console.log('Successfully cloned');
                            resolve();
                        }
                    });
            })
            .catch(function(err){
                reject(err);
            })
    });
}
function go_pull(tag, branch){
    return new Promise(function(resolve, reject){
        branch = branch || "master";

        console.log('About to pull branch ' + branch + ' at folder ' + util.settings.temp_pathname(tag));

        simpleGit(util.settings.temp_pathname(tag))
            .pull()
            .checkout(branch)
            .then(function (err) {

                if (err) {                                                                      // if can't clone, faile and delete directory
                    console.log('Pull/checkout failed');

                    util.cleanup(tag)
                        .finally(function (err) {
                            reject(err);
                        });
                }
                else {
                    console.log('Successfully pulled & checked-out branch!');
                    resolve();
                }
            });

    });
}

exports.retrieve = function(tag, repo, branch){

    return new Promise(function (resolve, reject) {                     // promisify
        util.log('Starting clone/pull - from ' + util.settings.test_repo + ', to directory ' + util.settings.temp_pathname(tag) + '.');

        util.file_folder_exists(util.settings.temp_pathname(tag))
            .then(function(exists){
                if (exists)
                    return go_pull(tag, branch);
                else
                    return go_retrieve(tag, repo, branch);


                //if (exists)                                 // if temp folder already there, delete it.
                //    return util.delete_folder(util.settings.temp_pathname(tag));
            })
            .then(function(){
                resolve();
            })
            .catch(function(err){
                reject('Error with removing/creating folder or retrieveing repo: ' + err);
            })


    });
};

function is_in_ignore(ignore, string){
    var ignore_length = ignore.length;
    for(var i=0; i<ignore_length; i++){
        if (string.indexOf(ignore[i]) > -1)
            return true;
    }
    return false;
}

exports.get_files = function(this_path, ignore){
    ignore = ignore || [];
    return new Promise(function(resolve, reject){									// promisify

        var walk = function(dir, done) {
            var results = [];

            fs.readdir(dir, function(err, list) {

                if (err) return done(err);
                var pending = list.length;
                if (!pending) return done(null, results);
                list.forEach(function(file, index, this_array) {                    // this_array is within closure

                    file = path_library.resolve(dir, file);
                    util.log('_____ Files list before slice:', file);
                    var file_text = file.substr(file.lastIndexOf(this_path) + this_path.length);
                    util.log('_____ Files list after slice:', file_text);
                    fs.stat(file, function(err, stat) {
                        //console.log('$$$$$$$$$$$$$', file, file_text);
                        if (stat && stat.isDirectory()) {
                            walk(file, function(err, res) {
                                results = results.concat(res);
                                if (!--pending) done(null, results);
                            });
                        } else {
                            //console.log('^^^^^^^^', file_text);
                            if (
                                (file_text.indexOf(util.settings.process_state_filename) === -1)                        // don't save process-state file as as a file
                                && !is_in_ignore(ignore, file_text)                                                         // not in ignore array
                            )
                                results.push({file: file_text, action: 'add'});
                            if (!--pending) done(null, results);
                        }
                    });
                });

            });
        };

        walk(this_path, function(err, results) {
            if (err)
                reject(err);
            else {
                util.sort_array(results);
                resolve(results);
            }
        });
    });
};

exports.diff_state = function(old_state, new_state){

    var old_i = -1;

    // Remove any still-existing items from the old array
    new_state.forEach(function(element, index){
        old_i = util.in_array(element.file, old_state, 'file');
        if (old_i !== -1)
            old_state.splice(old_i, 1);
    });

    // Loop the remaining Old-array
    // Add-in the old items that used to exist but don't now, and flag 'remove'
    old_state.forEach(function(element, index){
        element.action = 'remove';
        new_state.push(element);
    });

    return util.sort_array(new_state);
};

exports.create_state = function(array, path){
    return new Promise(function(resolve, reject){
        if (path){
            util.make_file(array, path)
                .then(function(){
                    resolve();
                })
                .catch(function(){
                    reject();
                });

        }
        else
            reject('No path provided to create state.');
    });
};

exports.build_state = function(source_path, ignore, target_path){                // creates new "process" state-file
    var target_state = target_path + util.settings.state_filename;
    return new Promise(function(resolve, reject){
        if (source_path){
            var new_state = [];

            exports.get_files(source_path, ignore)
                .then(function(res){
                    new_state = res;
                    return util.file_folder_exists(target_state)
                        .then(function(exists){
                            if (exists)                                                 // if old 'state' exists, return it
                                return util.get_file(target_state);
                            else
                                return "[]";                                              // if no old 'state' return empty
                        })
                        .catch(function(err){
                            return 'Error getting old state.';
                        });
                })
                .then(function(old_state){
                    old_state = JSON.parse(old_state);
                    //console.log('old state is ', old_state, ' and new state', new_state);
                    var diff = exports.diff_state(old_state, new_state);
                    return util.make_file(diff, source_path + util.settings.process_state_filename);             // writes "process_state" file into repo folder
                })
                .then(function(){
                    resolve();
                })
                .catch(function(){
                    reject();
                });

        }
        else
            reject('Source-path must both be provided.');
    });
};


/*

// Get the provisioning (put on machine ahead of time & specifies repo)
exports.get_provision = function(target_path){                   // "force_target_path" used only for testing

    return new Promise(function(resolve, reject){
        util.get_file(target_path + util.settings.provision_filename)
            .then(function(res){
                if (util.is_json(res))
                    resolve(JSON.parse(res));
                else
                    reject('Config file codeily.json is not valid JSON.')
            })
            .catch(function(err){
                reject(err);
            });
    });
};
*/

// Get config (the file that comes from the repo)
exports.get_config = function(tag, force_temp_path){                   // "force_target_path" used only for testing
    var temp_path = force_temp_path || util.settings.temp_pathname(tag);
    return new Promise(function(resolve, reject){
        util.file_folder_exists(temp_path + util.settings.config_filename)
            .then(function(exists){
                if (exists){                                                        // exists, get contents
                    util.get_file(temp_path + util.settings.config_filename)
                        .then(function(res){
                            if (util.is_json(res))
                                resolve(JSON.parse(res));
                            else
                                reject('Config file codeily.json is not valid JSON.')
                        })
                        .catch(function(err){
                            reject(err);
                        });
                }
                else                                                                // does not exist
                    resolve({ignore: [], script_after: []});                        // return empty
            })

    });
};
