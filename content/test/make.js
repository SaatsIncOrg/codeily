var app 			    = require('../app/make.js')
    , expect            = require("chai").expect
    , util              = require('../app/util.js')



describe("Make directory tree", function() {                     // test simple read of DB
    var test_bottom = 'test_make/bottom',
        test_folder = test_bottom + '/inner/another',
        test_file = test_folder + '/hey.txt';

    this.timeout(1000);

    afterEach(function(done) {                                  // clear both mail and mail-info
        util.delete_folder(test_bottom)
            .then(function(){
                done();
            })
            .catch(function(err){
                throw (err);
            });
    });

    describe("Creating a folder tree", function() {
        it('should respond with resolved promise', function(done) {

            app.make_dir(test_file)
                .then(function() {
                    done();
                })
                .catch(function(err){
                    done(err);
                });
        });

        it('should result in a new folder', function(done) {

            app.make_dir(test_file)
                .then(function() {
                    util.get_folder(test_folder)
                        .then(function(){
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
    });

});


describe("Make file", function() {                     // test simple read of DB
    var test_source = 'test_source/test.txt',
        test_dest = 'test_make/test.txt';

    this.timeout(1000);

    afterEach(function(done) {                                  // clear both mail and mail-info
        util.delete_file(test_dest)
            .then(function(){
                done();
            })
            .catch(function(err){
                throw (err);
            });
    });

    describe("Copying file", function() {
        it('should respond with resolved promise', function(done) {

            app.copy_file(test_source, test_dest)
                .then(function() {
                    done();
                })
                .catch(function(err){
                    done(err);
                });
        });

        it('should result in a new file with same content', function(done) {

            app.copy_file(test_source, test_dest)
                .then(function() {
                    util.get_file(test_dest)
                        .then(function(res){
                            expect(res).to.be.equal("Hey, this is some text that should be copied!");
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
    });

});

var expect_res = [
    {file: 'inside/inside.txt', action: 'add'},
    {file: 'test.txt', action: 'add'}
];

describe("Make file", function() {                     // test simple read of DB
    var test_source = 'test_source',
        test_dest = 'test_make',
        force_process_list = '/keep_here_codeily_process_state.json';

    this.timeout(5000);

    afterEach(function(done) {                                  // clear both mail and mail-info
        util.delete_file(test_dest + '/test.txt')
            .then(function(){
                return util.delete_file(test_dest + util.settings.state_filename);
            })
            .then(function(){
                return util.delete_folder(test_dest + '/inside');
            })
            .then(function(){
                done();
            })
            .catch(function(err){
                throw (err);
            });
    });


    describe("Process List to copy / remove files", function() {
        it('should respond with resolved promise', function(done) {

            app.process_list(test_source, test_dest, force_process_list)
                .then(function() {
                    done();
                })
                .catch(function(err){
                    done(err);
                });
        });

        it('should result in a new file with same content', function(done) {

            app.process_list(test_source, test_dest, force_process_list)
                .then(function() {
                    util.file_folder_exists(test_dest + '/inside/inside.txt')
                        .then(function(exists){
                            if (exists)
                                done();
                            else
                                done('test.txt file was not created');
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

});
