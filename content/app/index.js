var app                 = require('./app.js')
    , util               = require('./util.js')
    , path_library              = require('path')

var args = process.argv.slice(2);       // cut off paths

util.settings.root_path = args[0];

console.log('app_path: ', util.settings.app_path, '.');

// Run
app.run_loop();                  // take argument for provision path