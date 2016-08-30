
var app 			    = require('../app/app.js')
    , expect            = require("chai").expect
    , util              = require('../app/util.js')


describe("Test App", function() {
    this.timeout(10000);
    var target_paths = ['test_make'];

    afterEach(function(done) {                                  // clear new
        util.delete_file(target_paths + '\\another.txt')
            .then(function(){
                return util.delete_file(target_paths + '\\index.txt');
            })
            .then(function(){
                return util.delete_file(target_paths + '\\codeily_state.json');
            })
            .then(function(){
                return util.delete_file(target_paths + '\\codeily.json');
            })
            .then(function(){
                return util.delete_folder(target_paths + '\\folder');
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

        app.run(target_paths)
            .then(function(){
                done();
            })
            .catch(function(err){
                done(err);
            });
    });

    it('should result in a directory named Folder.', function(done) {
        app.run(target_paths)
            .then(function(){
                util.file_folder_exists(target_paths + '\\folder')
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


    it('should result in Another.txt with certain content.', function(done) {
        app.run(target_paths)
            .then(function(){
                util.get_file(target_paths + '\\another.txt')
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


});
