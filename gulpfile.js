var gulp = require('gulp');

var argv = require('yargs').argv;
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
var runSequence = require('run-sequence');
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

gulp.task('clean-emails', function(done){ 
     del([config.htmlemails], done);
});
gulp.task('clean-txtemails', function(done){ 
     del([config.textemails], done);
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

gulp.task('create-all-emails', cb => {
    runSequence ( ['clean-emails', 'clean-txtemails', 'create-htmlemails', 'create-txtemails'], cb);
});


gulp.task('create-htmlemails' , function(callback){
  var tmpText;
  var emailObject;
  var dir;
  var fileList = getFiles(config.emailtext);

  for ( var i in fileList) {
       // skip .DS_Store
   
        tmpText = fs.readFileSync(fileList[i], 'utf8');
        log('reading ' + fileList[i]);
        dir = fileList[i].replace (/email_text\//, ' ');
        dir = dir.replace(/\/.+/g, ' ');
        tmpText = tmpText.replace(/^\uFEFF/, '');
        emailObject = JSON.parse(tmpText);

        var templateToUse = emailObject.template + '.html'
        stringReplaceText(emailObject, gulp.src(['htmlemailTemplates/' + templateToUse]), false)
            .pipe(rename(emailObject.emailName + '.html'))
            .pipe(inlinesource())
            .pipe(inlineCss({
                preserveMediaQueries: true,
            }))
            .pipe(replace(/<style>/, '<style>  a:link,span.MsoHyperlink {mso-style-priority: 99;color: #aeaeaf;text-decoration: none;}  .crazyaddress a {color: #AEAEAF !important;text-decoration: none;} .header .crazyaddress a {color: #AEAEAF !important;text-decoration: none;  } .lead a {color: #6A6B6C !important;text-decoration: none;  } .bodyParagraph a {color: #858688 !important;text-decoration: none;  }' ))
            .pipe(gulp.dest(config.htmlemails + '/'  +  dir));


  }
    callback();
    return;
})


gulp.task('create-onemail',['clean-emails'] , function(callback){
  if (!argv.textfile) {
      log('Please send in a textfile name --textfile <filename>')
  }
   var tmpText;
   var emailObject;
   var file = config.emailtext + '/' + argv.textfile;


   tmpText = fs.readFileSync(file, 'utf8');
   log('reading ' + file);
   tmpText = tmpText.replace(/^\uFEFF/, '');
   emailObject = JSON.parse(tmpText);

   var templateToUse = emailObject.template + '.html'
   stringReplaceText(emailObject, gulp.src(['htmlemailTemplates/' + templateToUse]), false)
       .pipe(rename('index.html'))
       .pipe(inlinesource())
       .pipe(inlineCss({
           preserveMediaQueries: true,
       }))
      .pipe(replace(/<style>/, '<style>  a:link,span.MsoHyperlink {mso-style-priority: 99;color: #aeaeaf;text-decoration: none;}  .crazyaddress a {color: #AEAEAF !important;text-decoration: none;} .header .crazyaddress a {color: #AEAEAF !important;text-decoration: none;  } .lead a {color: #6A6B6C !important;text-decoration: none;  } .bodyParagraph a {color: #858688 !important;text-decoration: none;  }' ))
       .pipe(gulp.dest(config.build));


   callback();
   return;
})

gulp.task('create-txtemails', function(callback){
  var tmpText;
  var dir;
  var emailObject;
  var fileList = getFiles(config.emailtext);

  for ( var i in fileList) {

        tmpText = fs.readFileSync(fileList[i], 'utf8');
        log('reading ' + fileList[i]);
        dir = fileList[i].replace (/email_text\//, ' ');
        dir = dir.replace(/\/.+/g, ' ');
        tmpText = tmpText.replace(/^\uFEFF/, '');
        emailObject = JSON.parse(tmpText);

        var templateToUse = emailObject.template + '.txt'
        stringReplaceText(emailObject, gulp.src(['textTemplates/' + templateToUse]), true)
            .pipe(rename(emailObject.emailName + '.txt'))
            .pipe(gulp.dest(config.textemails + '/' + dir));

  }
    callback();
    return;
})


gulp.task('build', function(callback) {
  gulpSequence('clean', 'create-onemail', 'inline-css')(callback)
}); 

/**
 * Serve and BrowserSync
 */

gulp.task('serveone', gulpSequence('build', 'browser-sync'));

gulp.task('browser-sync', function(){
  if (browserSync.active) {
    return;
  }

  var browser;

  if (argv.browserall) {
    if (isLinux()) {
      browser = ['google-chrome', 'firefox', 'safari'];
    } else {
      browser = ['google chrome', 'firefox', 'safari'];
    }
  } else if (argv.firefox) {
    browser = ['firefox'];
  } else if (argv.safari) {
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
        // don't forget to ignore DS_Store from Mac
        if (fs.statSync(name).isDirectory()){
            getFiles(name, files_);
        } else if (name.indexOf('DS_Store') === -1 ){
            files_.push(name);
        }
    }
    return files_;
}

function stringReplaceText(emailObject, inputStream, textOnly){
   var commonText = fs.readFileSync('./' + config.emailtext + '/commonText.json', 'utf8');
   commonText = commonText.replace(/^\uFEFF/, '');
   var commonObject = JSON.parse(commonText);

  inputStream
        .pipe(replace('{{$$HEADER}}', emailObject.header))
        .pipe(replace('{{$$MESSAGE}}', emailObject.message))
        .pipe(replace('{{$$MESSAGE}}', emailObject.message))
        .pipe(replace('{{$$IMAGE1}}', emailObject.image1))
        .pipe(replace('{{$$ALTIMG1}}', emailObject.altimage1))
        .pipe(replace('{{$$DESC1}}', emailObject.desc1))
        .pipe(replace('{{$$DESC2}}', emailObject.desc2))
        .pipe(replace('{{$$PARA1}}', emailObject.firstParagraph))
        .pipe(replace('{{$$PARA2}}', emailObject.secondParagraph))
        .pipe(replace('{{$$PARA3}}', emailObject.thirdParagraph))
        .pipe(replace('{{$$WEBEXMSG}}', emailObject.WebExmsg))
        .pipe(replace('{{$$TEXTLINK}}', emailObject.textlink))
        .pipe(replace('{{$$LINK}}', emailObject.link_dest))
        .pipe(replace('{{$$SECONDARYMSG}}', emailObject.secondaryMsg))
        .pipe(replace('{{$$BUTTONTXT}}', emailObject.button_text))
        .pipe(replace('{{$$CTALINK}}', emailObject.button_link))
        .pipe(replace('{{$$EMAILID}}', emailObject.uniqueemailID))
        .pipe(replace('{{$$FOOTERMSG}}', emailObject.footerMsg))
        .pipe(replace('{{$$SIDEBARTXT}}', emailObject.sidebartext))
        .pipe(replace('{{$$SSTXT}}', emailObject.sidebarsecondary))
        .pipe(replace('{{$$1VIDEO}}', emailObject.video1Link))
        .pipe(replace('{{$$1THUMB}}', emailObject.video1thumb))
        .pipe(replace('{{$$1VDESC}}', emailObject.video1Desc))
        .pipe(replace('{{$$1ALTTEXT}}', emailObject.video1AltTxt))
        .pipe(replace('{{$$2VIDEO}}', emailObject.video2Link))
        .pipe(replace('{{$$2THUMB}}', emailObject.video2thumb))
        .pipe(replace('{{$$2VDESC}}', emailObject.video2Desc))
        .pipe(replace('{{$$2ALTTEXT}}', emailObject.video2AltTxt))
        .pipe(replace('{{$$3VIDEO}}', emailObject.video3Link))
        .pipe(replace('{{$$3THUMB}}', emailObject.video3thumb))
        .pipe(replace('{{$$3VDESC}}', emailObject.video3Desc))
        .pipe(replace('{{$$3ALTTEXT}}', emailObject.video3AltTxt))
        .pipe(replace('{{$$MARKETING}}', emailObject.marketing))
        .pipe(replace('{{$$SENT}}', emailObject.sent))
        .pipe(replace('{{$$RECIPIENT}}', emailObject.recipient))
        .pipe(replace('{{$$UNSUBSCRIBE}}', emailObject.unsubscribe))
        .pipe(replace('{{$$UNSLINK}}', emailObject.unsubscribe_link))
        .pipe(replace('{{$$HELPTEXT}}', emailObject.help_text))
        .pipe(replace('{{$$HELPLINK}}', emailObject.help_link))
        .pipe(replace('{{$$SECHELP}}', emailObject.help_second))
        .pipe(replace('{{$$LOCHELP}}', emailObject.help_location))
        .pipe(replace('{{$$DISCLAIMER}}', emailObject.disclaimer))


        .pipe(replace('{{$$PORTALLINK}}', commonObject.href_logo))
        .pipe(replace('{{$$LOGO}}', commonObject.logo))
        .pipe(replace('{{$$ALTLOGO}}', commonObject.logo_alt))
        .pipe(replace('{{$$CLOSING}}', commonObject.closing))
        .pipe(replace('{{$$WEBCLOSING}}', commonObject.webex_closing))
        .pipe(replace('{{$$WEBEXPORTALLINK}}', commonObject.webex_href))
        .pipe(replace('{{$$COPYRIGHT}}', commonObject.copyright))
        .pipe(replace('{{$$TEXTCOPYRIGHT}}', commonObject.textcopyright))
        .pipe(replace('{{$$FROM}}', commonObject.from))

        //remove any empty paragraphs
        .pipe(replace('<p> </p>', ' '))
        .pipe(replace('<p class="header"></p>', ' '))
        .pipe(replace('<p class="message"></p>', ' '))

      if (textOnly) {
        inputStream
            .pipe(replace('&#8217;', '\''))
            .pipe(replace('<span>', ' ' ))
            .pipe(replace('</span>', ' ' ))
            .pipe(replace('<br>', ' '))
      }
      return inputStream;

}