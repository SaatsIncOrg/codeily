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

exports.run = function(force_target_path){                      // "force_target_path" only for testing
    var target_path = force_target_path || util.settings.target_path,
        config = {};

    return new Promise(function(resolve, reject) {

        retrieve.get_provision(target_path)
            .then(function(res){
                return retrieve.retrieve(res.repo);
            })
            .then(function(){
                return retrieve.get_config();
            })
            .then(function(res){                                                           // Build NEW STATE into repo-folder
                config = res;
                return retrieve.build_state(util.settings.temp_pathname(), config.ignore);
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
                reject('Error in running App: ' + err);
            })
    });
};
