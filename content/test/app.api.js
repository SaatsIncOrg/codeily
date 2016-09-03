
var app 			    = require('../app/app.js')
    , expect            = require("chai").expect
    , util              = require('../app/util.js')


describe("Test App", function() {
    this.timeout(10000);
    var target_path = 'test_make',
        script_result = '/home/vagrant/codeily/test_make/bash_script_works.txt';

    afterEach(function(done) {                                  // clear new
        util.delete_file(target_path + '/another.txt')
            .then(function(){
                return util.delete_file(target_path + '/index.txt');
            })
            .then(function(){
                return util.delete_file(target_path + '/codeily_state.json');
            })
            .then(function(){
                return util.delete_file(target_path + '/codeily.json');
            })
            .then(function(){
                return util.delete_file(target_path + '/codeily_after_script.sh');
            })
            .then(function(){
                return util.delete_folder(target_path + '/folder');
            })
            .then(function(){                                   ///////// this may not run successfully, so don't chain things after it
                return util.delete_file(script_result);
            })
            .then(function(){
                done();
            })
            .catch(function(err){
                done();             // finish normally regardless
                //throw (err);
            });
    });

    it('should return a completed promise', function(done) {

        app.run_loop(true)
            .then(function(){
                done();
            })
            .catch(function(err){
                done(err);
            });
    });

    it('should result in a directory named Folder.', function(done) {
        app.run_loop(true)
            .then(function(){
                util.file_folder_exists(target_path + '/folder')
                    .then(function(exists){
                        if (exists)
                            done();
                        else
                            done('File does not exist.');
                    })
                    .catch(function(err){
                        done(err);
                    });
            })
            .catch(function(err){
                done(err);
            });
    });


    it('should result in Another.txt with certain content.', function(done) {
        app.run_loop(true)
            .then(function(){
                util.get_file(target_path + '/another.txt')
                    .then(function(res){
                        expect(util.strip_returns(res)).to.equal("Here's another file to go along with the first!");
                        done();
                    })
                    .catch(function(err){
                        done(err);
                    });
            })
            .catch(function(err){
                done(err);
            });
    });


    it('script execute should result in a file named bash_script_works.txt.', function(done) {
        app.run_loop()
            .then(function(){
                util.file_folder_exists(script_result)
                    .then(function(exists){
                        if (exists)
                            done();
                        else
                            done('File missing.');
                    })
                    .catch(function(err){
                        done(err);
                    });
            })
            .catch(function(err){
                done(err);
            });
    });


});
