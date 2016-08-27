var simpleGit     = require('simple-git')
    , fs              = require('fs')
    , Promise         = require('bluebird')
    , util            = require('./util.js');

var rand = util.settings.set_temp_file;


exports.retrieve = function(){

    return new Promise(function (resolve, reject) {                     // promisify
        console.log('Starting clone function - cloning from ' + util.settings.repo + ', to directory ' + util.settings.upload_dir(rand) + '.');

        util.make_folder(util.settings.upload_dir(rand))
            .then(function(){

                simpleGit(util.settings.upload_dir(rand))
                    .clone(util.settings.repo, util.settings.upload_dir(rand))                                                            // clone
                    .then(function (err) {
                        console.log('Clone finished');

                        if (err) {                                                                      // if can't clone, faile and delete directory
                            console.log('Clone failed');

                            util.cleanup(rand)
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
};