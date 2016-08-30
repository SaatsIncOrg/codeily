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


function loop_run(target_path){
    return new Promise(function(resolve, reject) {
        var config = {};

        retrieve.get_provision(target_path)
            .then(function(res){
                return retrieve.retrieve(res.repo);
            })
            .then(function(){
                return retrieve.get_config();
            })
            .then(function(res){                                                           // Build NEW STATE into repo-folder
                config = res;
                return retrieve.build_state(util.settings.temp_pathname(), config.ignore, target_path);
            })
            .then(function(){
                return make.process_list(util.settings.temp_pathname(), target_path);
            })
            .then(function(){                                                           // Delete temp repo folder
                //return util.delete_folder(util.settings.temp_pathname());
            })
            .then(function(){
                resolve();
            })
            .catch(function(err){
                reject('Error in Loop Run: ' + err);
            })
    });
}

exports.run = function(force_target_path){                      // "force_target_path" only for testing
    var target_paths = force_target_path || util.settings.target_path;

    return new Promise(function(resolve, reject){
        function check_end(){
            total++;
            if (total >= length) {                            // if reached end of array, return successfully
                resolve();
            }
        }

        var length = target_paths.length,
            total = 0;

        target_paths.forEach(function(element, index){
            loop_run(element)
                .then(function(){
                    check_end();
                })
                .catch(function(err){
                    reject('Error in Run: ' + err);
                });
        });
    });

};
