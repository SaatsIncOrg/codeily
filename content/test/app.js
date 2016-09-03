var app 			    = require('../app/app.js')
    , expect            = require("chai").expect
    , util              = require('../app/util.js')



describe("Get Provision", function() {
    this.timeout(1000);

    var expect_this = [{
        "path": "test_make/",
        "repo": "https://github.com/SaatsIncOrg/test.git",
        "branch": "master"
    }],
        prov_path = util.settings.get_root() + util.settings.provision_filename;
    //console.log('(((((((((((((((( ', prov_path);

    it('should respond with resolved promise', function(done) {

        app.get_provision(prov_path)
            .then(function() {
                done();
            })
            .catch(function(err){
                done(err);
            });
    });

    it('should return an object with the correct info.', function(done) {

        app.get_provision(prov_path)
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