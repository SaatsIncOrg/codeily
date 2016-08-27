var app 			    = require('../app/retrieve.js')
    , expect            = require("chai").expect
    , fs                = require('fs')
    , util              = require('../app/util.js')



describe("Retrieve repo", function() {                     // test simple read of DB
    this.timeout(10000);

    afterEach(function(done) {                                  // clear both mail and mail-info
        util.delete_folder(util.settings.upload_dir(util.settings.set_temp_file))
            .then(function(){
                done();
            })
            .catch(function(err){
                throw (err);
            });

    });

    describe("Cloning down repo", function() {
        it('should respond with resolved promise', function(done) {

            app.retrieve()
                .then(function() {
                    done();
                })
                .catch(function(err){
                    done(err);
                });
        });

        it('should result in a new folder', function(done) {

            app.retrieve()
                .then(function() {
                    util.get_folder(util.settings.upload_dir(util.settings.set_temp_file))
                        .then(function(res){
                            console.log('res is ', res);
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
