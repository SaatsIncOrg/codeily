var simpleGit     = require('simple-git')
    , fs              = require('fs')
    , path_library =  require('path')
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

exports.get_files = function(this_path){
    return new Promise(function(resolve, reject){									// promisify

        var walk = function(dir, done) {
            var results = [];

            fs.readdir(dir, function(err, list) {

                if (err) return done(err);
                var pending = list.length;
                if (!pending) return done(null, results);
                list.forEach(function(file) {
                    file = path_library.resolve(dir, file);
                    fs.stat(file, function(err, stat) {
                        if (stat && stat.isDirectory()) {
                            walk(file, function(err, res) {
                                results = results.concat(res);
                                if (!--pending) done(null, results);
                            });
                        } else {
                            results.push(file);
                            if (!--pending) done(null, results);
                        }
                    });
                });

            });
        };

        walk(this_path, function(err, results) {
            if (err)
                reject(err);
            else
                resolve(results);
        });
    });
};

exports.create_state = function(array, path){
    return new Promise(function(resolve, reject){
        if (path){
            exports.write_file(array, path)
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

exports.write_file = function(data, path){

    return new Promise(function(resolve, reject){
        fs.writeFile(path, JSON.stringify(data, null, 4), function (err) {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
};