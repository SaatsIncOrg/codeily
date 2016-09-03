var app             = require('./app.js'),
    util            = require('./util.js');

var args = process.argv.slice(2);       // cut off paths

util.settings.root_path = args[0];

// Run
app.run_loop();                  // take argument for provision path