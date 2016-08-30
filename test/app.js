var app 			    = require('../app/app.js')
    , expect            = require("chai").expect
    , util              = require('../app/util.js')



describe("Get Provision", function() {
    this.timeout(1000);

    var expect_this = [{
        "path": "test_make\\",
        "repo": "https://github.com/SaatsIncOrg/test.git",
        "branch": "master"
    }];

    it('should respond with resolved promise', function(done) {

        app.get_provision()
            .then(function() {
                done();
            })
            .catch(function(err){
                done(err);
            });
    });

    it('should return an object with the correct info.', function(done) {

        app.get_provision()
            .then(function(res) {
                util.log('Get provision:', res);
                expect(res).to.deep.equal(expect_this);
                done();
            })
            .catch(function(err){
                done(err);
            });
    });
});