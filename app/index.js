var app             = require('./app.js');

var args = process.argv.slice(2);       // cut off paths

// Run
app.run_loop(args[0]);                  // take argument for provision path