/*
 * grunt-intranslation
 *
 *
 */

var fs =            require('fs'),
	path_library =  require('path'),
	Promise =       require('bluebird');

var app = {},
	path_read = '',
	path_write = '',
	debug = false,
	data = [];


app.get_files = function(this_path){
	return new Promise(function(resolve, reject){									// promisify
		
		var walk = function(dir, done) {
		  var results = [];
		  
		  fs.readdir(dir, function(err, list) {
			  
			if (err) return done(err);
			var pending = list.length;
			if (!pending) return done(null, results);
			list.forEach(function(file) {
			  file = path_library.resolve(dir, file);
			  fs.stat(file, function(err, stat) {
				if (stat && stat.isDirectory()) {
				  walk(file, function(err, res) {
					results = results.concat(res);
					if (!--pending) done(null, results);
				  });
				} else {
				  results.push(file);
				  if (!--pending) done(null, results);
				}
			  });
			});
			
		  });
		};
		
		walk(this_path, function(err, results) {
			if (err) 
				reject(err);
			else
				resolve(results);
		});
	});
};
	
	

app.log = function(message){																	// print out, if in 'verbose' mode
	if (debug)
		console.log('\n' + message);
};

app.sort_array = function(data){
	data.sort(function(a, b) {
		var nameA = a.file.toUpperCase(); // ignore upper and lowercase
		var nameB = b.file.toUpperCase(); // ignore upper and lowercase

		if (nameA < nameB) {
			return -1;
		}
		if (nameA > nameB) {
			return 1;
		}

		// names must be equal
		return 0;
	});
	
	return data;
};

app.strip_empty = function(data){
	var rtn = [];
	
	data.forEach(function(file_val){													// loop files
		if (file_val && file_val.contents && (file_val.contents.length > 0))
			rtn.push(file_val);
	});
	
	return rtn;
};


app.get_count = function(data){
	var total = 0;
	
	data.forEach(function(file_val){													// loop files

		total = total + file_val.contents.length;	
	});
	
	return total;
};


app.readFiles = function(files){
	
	return new Promise(function(resolve, reject){
		
		if ((typeof files === 'undefined') || (files.length <= 0)){												// if no file, halt
			app.log('Found no files');
			resolve(data);
		}
		else {																			// if file exists
			app.log('Starting read of files');
			var	length = files.length,
				count = 0;
			
			files
			.forEach(function(file) { 
			
				app.log('Reading file ' + file + '.');

				app.readFile(file)
					.then(function(res){					// on success, add to array
						
						data.push(res);	
						
					})
					.catch(function(err){					// on failure, throw error
						reject(err);
					})
					.finally(function(){					// regardless, plus-up and check for end
						count++;
						app.log('Count ' + count + ' and length ' + length + '.');
						
						if (count === length){
							app.log('Reached the end of the file list.');
							resolve(data);
						}
							
					});

			});	
		}
		
		
    });
};



//// START
app.run = function(m, callback){
	
	// Set global flags
	path_read = m.path_read;
	path_write = m.path_write;
	debug = m.debug;

	
	app.readTranslations()																// get existing translations
	.then(function(content){
		if (app.is_json(content)){
			app.log('existing -- ' + JSON.stringify(content) + '.');
			
			if (content !== ''){
				content = JSON.parse(content);												// parse JSON
				
				
				if (typeof content.data !== 'undefined')									// if nested
					data_translations = content.data !== '';
				else																		// unnested
					data_translations = content;
									
			}
			
		}
		
		return app.get_files(path);		
	})
	.then(function(these_files){
		
		these_files = these_files.filter(function(file) { 
				app.log('Filtering file ' + file + '.');
				return ((file.substr(-4) === '.php') || (file.substr(-4) === '.hbs'));				// php or handlebars 
			});
			
			
		
		return app.readFiles(these_files);
	})
	.then(function(){																	// Gathered everything
		data = app.strip_empty(data);													    // strip files without translations
		
		console.log('\nFound ' + app.get_count(data) + ' words/phrases in ' + data.length + ' files.');
		
		data = app.sort_array(data);													// sort the array because async can vary the order
		if (data_translations.length > 0)													// if option for translation file and not empty
			data = app.add_translations(data);												// add the translations

		return app.write_file(data);
	})
	.then(function(){																	// Done with alll
		console.log('File written to ' + path_write + '.');
		callback();
	})
	.catch(function(err){
		console.log('Error at some point:', err);
	});
	
};

module.exports = app;