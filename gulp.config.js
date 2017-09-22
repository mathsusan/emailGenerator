module.exports = function() {
var build = 'build';

	var config = {
		templates: 'templates/*',
		build: build,
		defaultPort: 8080,
		dist: 'dist/',
		emailtext: 'email_text',
		hpartials: 'htmlPartials/',
		hwhole: 'htmlWholeTemplates/**.*',
		htemplates: 'htmlemailTemplates',
		html: 'temp/*.html',
		styles: 'styles/*.css',
		temp: 'temp/',
		htmlemails: build + '/html_emails',
    	textemails: build + '/text_emails',
	}

	return config;
}