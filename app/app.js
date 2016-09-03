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


function run_sequence(prov_vars){
    return new Promise(function(resolve, reject) {
        var config = {};

        retrieve.retrieve(prov_vars.repo, prov_vars.branch)
            .then(function(){
                return retrieve.get_config();
            })
            .then(function(res){                                                           // Build NEW STATE into repo-folder
                config = res;
                return retrieve.build_state(util.settings.temp_pathname(), config.ignore, prov_vars.path);
            })
            .then(function(){
                return make.process_list(util.settings.temp_pathname(), prov_vars.path);
            })
            .then(function(){                                                           // Delete temp repo folder
                //return util.delete_folder(util.settings.temp_pathname());
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

exports.run_loop = function(prov_path){                      // "force_target_path" only for testing
    prov_path = prov_path || (util.get_root() + util.settings.provision_filename);

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

                provision.forEach(function(element, index){
                    run_sequence(element)
                        .then(function(){
                            check_end();
                        })
                        .catch(function(err){
                            reject('Error in Run: ' + err);
                        });
                });
            });
    });

};
