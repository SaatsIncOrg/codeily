/*
 * codeily
 * 
 *
 */

'use strict';

var util                = require('./util')
    , Promise           = require('bluebird')
    , make              = require('./make.js')
    , retrieve          = require('./retrieve.js')
    , exec              = require('child_process').exec


function run_sequence(prov_vars, suppress_exec){
    suppress_exec = suppress_exec || false;

    return new Promise(function(resolve, reject) {
        var config = {},
            source_path = '';

        retrieve.retrieve(prov_vars.tag, prov_vars.repo, prov_vars.branch)
            .then(function(){
                return retrieve.get_config(prov_vars.tag);
            })
            .then(function(res){                                                           // Build NEW STATE into repo-folder
                config = res;
                source_path = util.settings.temp_pathname(prov_vars.tag) + (config.repo_path || '');
                return retrieve.build_state(source_path, config.ignore, prov_vars.path);               // use repo-path to limit copies, if available
            })
            .then(function(){
                return make.process_list(source_path, prov_vars.path);                                  // use same repo-path as above
            })
            .then(function(){
                if (!suppress_exec && config.script_after && config.script_after.length > 0)
                    return exports.loop_execute(prov_vars.tag, config.script_after);                             // passes the script_after array for looping on execute
            })
            .then(function(){                                                           // Delete temp repo folder
                //return util.delete_folder(util.settings.temp_pathname(prov_vars.tag));
            })
            .then(function(){
                resolve();
            })
            .catch(function(err){
                reject('Error in Loop Run: ' + err);
            });
    });
}

exports.get_provision = function(prov_path){


    return util.get_file(prov_path)
        .then(function(content){
            var rtn = [];
            if (util.is_json(content))
                rtn = JSON.parse(content);
            return rtn;
        })
        .catch(function(err){
            return err;
        });
};

exports.execute = function(tag, path){
    return new Promise(function(resolve, reject){
        var this_path = util.settings.temp_pathname(tag) + '/' + path;
        var to_execute = "sudo sed -i 's/\r//' " + this_path + "; sudo chmod 770 " + this_path + "; sudo " + this_path;
        util.log('Looking to execute: ' + to_execute);

        exec(to_execute, // command line argument directly in string
            function (err, stdout, stderr) {      // one easy function to capture data/errors
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
                if (err)
                    reject('Error Executing Script: ', err);
                else
                    resolve();
            });
    });
};

exports.loop_execute = function(tag, scripts){
    return new Promise(function(resolve, reject){
        function check_end(){
            total++;
            if (total >= length) {                            // if reached end of array, return successfully
                resolve();
            }
        }

        // Start
        var length = scripts.length,
            total = 0;

        scripts.forEach(function(element, index){
            exports.execute(tag, element)
                .then(function(){
                    check_end();
                })
                .catch(function(err){
                    reject('Error in execute_list: ' + err);
                });
        });
    });
};

exports.run_loop = function(suppress_exec){                      // "force_target_path" only for testing
    var prov_path = util.settings.get_root() + util.settings.provision_filename;

    return new Promise(function(resolve, reject){
        exports.get_provision(prov_path)
            .then(function(provision){
                function check_end(){
                    total++;
                    if (total >= length) {                            // if reached end of array, return successfully
                        resolve();
                    }
                }

                var length = provision.length,
                    total = 0;

                provision.forEach(function(element, index){             // loop on provisions and run each
                    var tags = element.repo.split('/');
                    element.tag = (tags[tags.length-2] + '_' + tags[tags.length-1]).toLowerCase().replace('.', '_');          // create tag from repo name, and append to prov_vars

                    run_sequence(element, suppress_exec)
                        .then(function(){
                            check_end();
                        })
                        .then(function(){
                            resolve();
                        })
                        .catch(function(err){
                            reject('Error in Run: ' + err);
                        });
                });
            });
    });

};
