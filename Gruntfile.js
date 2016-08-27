module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        mochaTest: {
            usual: {
                options: {
                    reporter: 'spec',
                    clearRequireCache: true
                },
                src: ['test/**/*.js', '!test/**/*.api.js']              // exclude api calls
            },
        },


        watch: {
            test: {
                options: {
                    spawn: false,
                    debounceDelay: 250
                },
                files: '**/*.js',
                tasks: ['mochaTest:usual']
            },
        }
    });

    // On watch events, if the changed file is a test file then configure mochaTest to only
    // run the tests from that file. Otherwise run all the tests
    var defaultTestSrc = grunt.config('mochaTest.test.src');
    grunt.event.on('watch', function(action, filepath) {
        grunt.config('mochaTest.usual.src', defaultTestSrc);
        if (filepath.match('test/')) {
            grunt.config('mochaTest.usual.src', filepath);
        }
    });

    grunt.registerTask('default', ['mochaTest:usual'] );


};