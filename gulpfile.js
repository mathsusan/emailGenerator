var gulp = require('gulp');

var args = require('yargs').argv;
var browserSync = require('browser-sync');
var config = require('./gulp.config')();
var del = require('del');
var fs = require("fs");
var inlinesource = require('gulp-inline-source');
var inlineCss = require('gulp-inline-css');
var reload = browserSync.reload;
var rename = require("gulp-rename");
var replace = require('gulp-replace');
var gulpSequence = require('gulp-sequence');
var $ = require('gulp-load-plugins')({lazy: true});

var port = config.defaultPort;

gulp.task('help', $.taskListing);
gulp.task('default', ['help']);

gulp.task('clean', function(done){
  if (browserSync.active) {
    done();
    return;
  }
  del([config.temp, config.build], done);
});


gulp.task('inline-css', function(done) {
  log(config.html);
  return gulp.src(config.html)
        .pipe(inlinesource())
        .pipe(inlineCss({
          preserveMediaQueries: true,
        }))
      .pipe(gulp.dest(config.build), done);
});

/////////////////////////////////////////
// SINGLE EMAIL GENERATION FROM emailText.json for development 
/////////////////////////////////////////

gulp.task('replace-emailtext', function(done){
    tmpText = fs.readFileSync('./' + config.emailtext + '/emailText.json', 'utf8');
    tmpText = tmpText.replace(/^\uFEFF/, '');
    var emailObject = JSON.parse(tmpText);
    var templateToUse =  emailObject.template + '.html'
    
      return gulp.src(['templates/' + templateToUse])        
              .pipe(replace('$$HEADER', emailObject.header))
              .pipe(replace('$$WEBPAGELINK', emailObject.href_logo))
              .pipe(replace('$$LOGO', emailObject.logo))
              .pipe(replace('$$ALTLOGO', emailObject.logo_alt))
              .pipe(replace('$$PARA1', emailObject.firstParagraph))
              .pipe(replace('$$PARA2', emailObject.secondParagraph))
              .pipe(replace('$$PARA3', emailObject.thirdParagraph))
              .pipe(replace('$$CLOSING', emailObject.closing))
              .pipe(replace('$$COPYRIGHT', emailObject.copyright))
              .pipe(rename('index.html'))
              .pipe(gulp.dest(config.temp), done);
  
})

gulp.task('build', function(callback) {
  gulpSequence('clean', 'replace-emailtext', 'inline-css')(callback)
}); 

/**
 * Serve and BrowserSync
 */

gulp.task('serve', gulpSequence('build', 'browser-sync'));

gulp.task('browser-sync', function(){
  if (browserSync.active) {
    return;
  }

  var browser;

  if (args.browserall) {
    if (isLinux()) {
      browser = ['google-chrome', 'firefox', 'safari'];
    } else {
      browser = ['google chrome', 'firefox', 'safari'];
    }
  } else if (args.firefox) {
    browser = ['firefox'];
  } else if (args.safari) {
    browser = ['safari'];
  } else {
    if (isLinux()) {
      browser = ['google-chrome'];
    } else {
      browser = ['google chrome'];
    }
  }

  var options = {
    port: 8080,
    server: {
      baseDir: config.build
    },
    ghostMode: {
      clicks: true,
      location: false,
      forms: true,
      scroll: true
    },
    injectChanges: true,
    logFileChanges: true,
    logLevel: 'info',
    logPrefix: 'browser-sync',
    reloadDelay: 1000,
    browser: browser
  };

  browserSync(options);

  gulp.watch([ config.styles, config.emailtext + '/*.json', config.templates + '*.html'], ['build', 'browser-sync', browserSync.reload]);


});



function changeEvent(event) {
    var srcPattern = new RegExp('/.*(?=/' + config.source + ')/');
    log('File ' + event.path.replace(srcPattern, '') + ' ' + event.type);
}
/**
 * Check if in Linux environment
 */
function isLinux() {
  return process.platform === 'linux';
}

function log(msg) {
    if (typeof(msg) === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item)) {
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    } else {
        $.util.log($.util.colors.blue(msg));
    }
}

function getFiles (dir, files_){
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files){
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()){
            getFiles(name, files_);
        } else {
            files_.push(name);
        }
    }
    return files_;
}