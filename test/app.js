
var app 			= require('../app/app.js');
var expect          = require("chai").expect;


describe("Test", function() {

    it('should return the number fudge', function() {

        var res = app.run();

        expect(res).to.be.equal("fudge");
    });

});
