var app 			    = require('../app/retrieve.js')
    , expect            = require("chai").expect
    , fs                = require('fs')
    , util              = require('../app/util.js')


var expect_res = [
    {file: 'codeily.json', action: 'add'},
    {file: 'inside\\inside.txt', action: 'add'},
    {file: 'keep_here_codeily_process_state.json', action: 'add'},
    {file: 'test.txt', action: 'add'}
];

describe("Read folder", function() {
    this.timeout(1000);

    var folder_path = "test_source\\";

    it('should respond with resolved promise', function(done) {

        app.get_files(folder_path)
            .then(function() {
                done();
            })
            .catch(function(err){
                done(err);
            });
    });

    it('should return an array with the correct info', function(done) {

        app.get_files(folder_path)
            .then(function(res) {
                util.log('Folder array:', res);
                expect(res).to.be.deep.equal(expect_res);
                done();
            })
            .catch(function(err){
                done(err);
            });
    });
});

describe("Get Provision", function() {
    this.timeout(1000);

    var folder_path = "test_make",
        expect_this = {
            repo: "https://github.com/SaatsIncOrg/test.git"
        };

    it('should respond with resolved promise', function(done) {

        app.get_provision(folder_path)
            .then(function() {
                done();
            })
            .catch(function(err){
                done(err);
            });
    });

    it('should return an object with the correct info', function(done) {

        app.get_provision(folder_path)
            .then(function(res) {
                util.log('Get provision:', res);
                expect(res.repo).to.be.equal(expect_this.repo);
                done();
            })
            .catch(function(err){
                done(err);
            });
    });
});

describe("Get Config", function() {
    this.timeout(1000);

    var folder_path = "test_source",
        expect_this = {
            ignore: [".git/"]
        };

    it('should respond with resolved promise', function(done) {

        app.get_config(folder_path)
            .then(function() {
                done();
            })
            .catch(function(err){
                done(err);
            });
    });

    it('should return an object with the correct info', function(done) {

        app.get_config(folder_path)
            .then(function(res) {
                util.log('Get config:', res);
                expect(res.ignore).to.be.deep.equal(expect_this.ignore);
                done();
            })
            .catch(function(err){
                done(err);
            });
    });
});

describe("Diff state", function() {
    this.timeout(1000);

    var diff_old = [
        {file: 'test1', action: 'add'},
        {file: 'test2', action: 'add'},
        {file: 'test3', action: 'add'}
    ],
        diff_new = [
            {file: 'test1', action: 'add'},
            {file: 'test3', action: 'add'}
        ],
        diff_expect = [
            {file: 'test1', action: 'add'},
            {file: 'test2', action: 'remove'},              // flag to remove the item missing from the 2nd array
            {file: 'test3', action: 'add'}
        ];


    it('should return an array with the correct info', function() {

        var res = app.diff_state(diff_old, diff_new);
        expect(res).to.be.deep.equal(diff_expect);

    });
});

describe("Make state file", function() {                     // test simple read of DB
    this.timeout(1000);

    var input = [
        'hey/test.txt',
        'yo/test.txt'
    ],
        process_state = "test_source" + util.settings.process_state_filename,
        folder_path = "test_source\\";


    afterEach(function(done) {                                  // clear new
        util.delete_file(process_state)
            .then(function(){
                return util.delete_file(state);
            })
            .then(function(){
                done();
            })
            .catch(function(err){
                done();             // finish normally regardless
                //throw (err);
            });

    });


    describe("Create state file from sample data", function() {
        it('should respond with resolved promise', function(done) {

            app.create_state(input, process_state)
                .then(function() {
                    done();
                })
                .catch(function(err){
                    done(err);
                });
        });

        it('should result in a file with correct JSON data', function(done) {

            app.create_state(input, process_state)
                .then(function() {
                    util.get_file(process_state)
                        .then(function(res){
                            util.log('res is ', res);
                            expect(res).to.be.equal(JSON.stringify(input, null, 4));
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

    describe("Create state file from test folder", function() {
        it('should respond with resolved promise', function(done) {

            app.build_state(folder_path)
                .then(function() {
                    done();
                })
                .catch(function(err){
                    done(err);
                });
        });

        it('should result in a file with correct JSON data', function(done) {

            app.build_state(folder_path)
                .then(function() {
                    util.get_file(process_state)
                        .then(function(res){
                            util.log('res is ', res);
                            expect(res).to.be.equal(JSON.stringify(expect_res, null, 4));
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
