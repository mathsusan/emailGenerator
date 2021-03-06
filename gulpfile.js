var gulp = require('gulp');

var argv = require('yargs').argv;
var browserSync = require('browser-sync');
var config = require('./gulp.config')();
var del = require('del');
var fs = require("graceful-fs");
var inlinesource = require('gulp-inline-source-html');
var inlineCss = require('gulp-inline-css');
var reload = browserSync.reload;
var rename = require("gulp-rename");
var replace = require('gulp-replace');
var concat = require('gulp-concat-multi');

var tasklisting = require('gulp-task-listing');
var log = require('fancy-log');

gulp.task('help', tasklisting);




gulp.task('clean-build', async function(callback){
  del([config.build], callback)
})


gulp.task('clean-htemplates', async function(callback){ 
  del([config.htemplates], callback);
});

gulp.task('clean', gulp.series('clean-build',  'clean-htemplates'));

gulp.task('create-templates', function(callback) {
  concat ( {
    'BasicTemplate.html' : [
      config.hpartials + 'top.html',
      config.hpartials + 'logo.html',
      config.hpartials + 'header.html',
      config.hpartials + 'body.html',
      config.hpartials + 'closing.html',
      config.hpartials + 'footer.html',
      config.hpartials + 'fileclose.html',
    ], 

    'ButtonTemplate.html' : [
      config.hpartials + 'top.html',
      config.hpartials + 'logo.html',
      config.hpartials + 'header.html',
      config.hpartials + 'body.html',
      config.hpartials + 'button.html',
      config.hpartials + 'closing.html',
      config.hpartials + 'footer.html',
      config.hpartials + 'fileclose.html',
    ], 

    'ImageTemplate.html' : [
      config.hpartials + 'top.html',
      config.hpartials + 'logo.html',
      config.hpartials + 'header.html',
      config.hpartials + 'image.html',
      config.hpartials + 'body.html',
      config.hpartials + 'button.html',
      config.hpartials + 'closing.html',
      config.hpartials + 'footer.html',
      config.hpartials + 'fileclose.html',
    ], 

    'SecondaryMsgTemplate.html' : [
      config.hpartials + 'top.html',
      config.hpartials + 'logo.html',
      config.hpartials + 'header.html',
      config.hpartials + 'body.html',
      config.hpartials + 'secondarymessage.html',
      config.hpartials + 'closing.html',
      config.hpartials + 'footer.html',
      config.hpartials + 'fileclose.html',
    ], 

    'SecondaryMsg_ButtonTemplate.html' : [
      config.hpartials + 'top.html',
      config.hpartials + 'logo.html',
      config.hpartials + 'header.html',
      config.hpartials + 'body.html',
      config.hpartials + 'button.html',
      config.hpartials + 'secondarymessage.html',
      config.hpartials + 'closing.html',
      config.hpartials + 'footer.html',
      config.hpartials + 'fileclose.html',
    ],     
    
  })
  .pipe(gulp.dest(config.htemplates))
  .on('end', function () { callback(); });

  return;
});

gulp.task('copy-templates', function(callback){
    gulp.src(config.hwhole)
      .pipe(gulp.dest(config.htemplates));
    callback();
    return;
})



gulp.task('create-htmlemails' , function(callback){
  var tmpText;
  var emailObject;
  var dir;
  var fileList = getFiles(config.emailtext);

  for ( var i in fileList) {
       // skip .DS_Store
        tmpText = fs.readFileSync(fileList[i], 'utf8');
        myLog('reading ' + fileList[i]);
        dir = fileList[i].replace (/email_text\//, ' ');
        dir = dir.replace(/\/.+/g, ' ');
        tmpText = tmpText.replace(/^\uFEFF/, '');
        emailObject = JSON.parse(tmpText);

        var templateToUse = figureOutTemplate(emailObject)  + '.html';
        myLog('using template ' + templateToUse);
        stringReplaceText(emailObject, gulp.src(['htmlemailTemplates/' + templateToUse]), false)
            .pipe(rename(emailObject.emailName + '.html'))
            .pipe(inlinesource())
            .pipe(inlineCss({
                preserveMediaQueries: true,
            }))
          .pipe(replace(/<style>/, '<style>  a:link,span.MsoHyperlink {mso-style-priority: 99;color: #aeaeaf;text-decoration: none;}  .crazyaddress a {color: #AEAEAF !important;text-decoration: none;} .header .crazyaddress a {color: #AEAEAF !important;text-decoration: none;  } .lead a {color: #6A6B6C !important;text-decoration: none;  } .bodyParagraph a {color: #858688 !important;text-decoration: none;  }' ))
          .pipe(gulp.dest(config.htmlemails + '/'  +  dir))

  }
    callback();
    return;
})


gulp.task('create-onemail', gulp.series('clean-build' , function(callback){
  if (!argv.textfile) {
      myLog('Please send in a textfile name --textfile <filename>')
  }
   var tmpText;
   var emailObject;
   var file = config.emailtext + '/' + argv.textfile;


   tmpText = fs.readFileSync(file, 'utf8');
   myLog('reading ' + file);
   tmpText = tmpText.replace(/^\uFEFF/, '');
   emailObject = JSON.parse(tmpText);

   var templateToUse = figureOutTemplate(emailObject) + '.html';
   
   myLog('using ' + templateToUse);

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
}))


gulp.task('create-txtemails', function(callback){
  var tmpText;
  var dir;
  var emailObject;
  var fileList = getFiles(config.emailtext);

  for ( var i in fileList) {

        tmpText = fs.readFileSync(fileList[i], 'utf8');
        myLog('reading ' + fileList[i]);
        dir = fileList[i].replace (/email_text\//, ' ');
        dir = dir.replace(/\/.+/g, ' ');
        tmpText = tmpText.replace(/^\uFEFF/, '');
        emailObject = JSON.parse(tmpText);

        var templateToUse = figureOutTemplate(emailObject) + '.txt'
        stringReplaceText(emailObject, gulp.src(['textTemplates/' + templateToUse]), true)
            .pipe(rename(emailObject.emailName + '.txt'))
            .pipe(gulp.dest(config.textemails + '/' + dir));

  }
    callback();
    return;
})



/**
 * Serve and BrowserSync
 */



gulp.task('browser-sync', async function(){
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
  // gulp.watch(config.styles, gulp.series('build'));
  
  // gulp.watch(config.templates + '*.html').on('change', reload);

 gulp.watch([ config.styles, config.emailtext + '/*.json', config.templates + '*.html'], gulp.series('create-onemail', 'browser-sync')).on('change', reload);
});

gulp.task('serveone', gulp.series('create-templates', 'copy-templates','create-onemail', 'browser-sync'));

gulp.task('create-all-emails', gulp.series( 'create-templates', 'copy-templates', 'create-htmlemails', 'create-txtemails'));

function changeEvent(event) {
    var srcPattern = new RegExp('/.*(?=/' + config.source + ')/');
    myLog('File ' + event.path.replace(srcPattern, '') + ' ' + event.type);
}
/**
 * Check if in Linux environment
 */
function isLinux() {
  return process.platform === 'linux';
}

function myLog(msg) {
    if (typeof(msg) === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item)) {
               log((msg[item]));
            }
        }
    } else {
       log((msg));
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
   var commonText = fs.readFileSync('./' + 'commonText.json', 'utf8');
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

function figureOutTemplate(emailObject, callback){
  var templateName = ' ';
  if (emailObject.secondary === 'true' && emailObject.button === 'true'){
      templateName = 'SecondaryMsg_ButtonTemplate';
  } else if (emailObject.secondary === 'true'){
      templateName = 'SecondaryMsgTemplate';
  } else if (emailObject.image === 'true' &&emailObject.button === 'true'){
     templateName = 'ImageTemplate';
  } else if (emailObject.button === 'true' ){
    templateName = 'ButtonTemplate';
  } else {
    templateName = 'BasicTemplate';
  }

  return (templateName)

}
