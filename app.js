var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var today = require('./routes/today')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/today', today);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var schedule = require('node-schedule');
var request = require('request');
var fs = require('fs');
var bingImage = require('./bingimage');
var dateFormat = require('dateformat');
var bingHost = 'http://www.bing.com';
var j = schedule.scheduleJob('0 1 0 * * *', function(){
    bingImage.findOne({ where: {startDate: dateFormat(new Date(), 'yyyymmdd')} }).then(savedImage => {
        startDownload(savedImage);
    })
});

function startDownload(savedImage) {
    request(`${bingHost}/HPImageArchive.aspx?format=js&idx=-1&n=1`, function (error, response, body) {
        var rootPath = './public/data'
        var publicRootPath = '/data'
        var rootObj = JSON.parse(body).images[0];
        var bingUrlBase = `${bingHost}${rootObj.urlbase}`;
        var bingUrl = `${bingUrlBase}_1920x1080.jpg`;
        var bingThumbUrl = `${bingUrlBase}_320x240.jpg`;
        var bingName = bingUrl.split('/')[ bingUrl.split('/').length-1];
        var bingThumbName = bingThumbUrl.split('/')[ bingThumbUrl.split('/').length-1];
        var bingPath = `${rootPath}/image/${bingName}`
        var bingThumbPath = `${rootPath}/thumb/${bingThumbName}`

        if(!fs.existsSync(`${rootPath}/thumb/${bingThumbName}`)){
            request(bingUrl).pipe(fs.createWriteStream(`${bingPath}.tmp`, {flags: 'w+'}))
                .on('close',function(){
                    request(bingThumbUrl).pipe(fs.createWriteStream(`${bingThumbPath}.tmp`, {flags: 'w+'}))
                        .on('close',function(){
                            fs.renameSync(`${bingPath}.tmp`, bingPath);
                            fs.renameSync(`${bingThumbPath}.tmp`, bingThumbPath);
                            if(savedImage != null){
                                savedImage.update({
                                    thumbnailUrl: `${publicRootPath}/thumb/${bingThumbName}`,
                                    downloadUrl: `${publicRootPath}/image/${bingName}`,
                                }).then(image => {
                                    console.log('update:'+image.get({
                                        plain: true
                                    }).endDate)
                                })
                            } else {
                                bingImage.create({
                                    startDate: rootObj.startdate,
                                    fullStartDate: rootObj.fullstartdate,
                                    endDate: rootObj.enddate,
                                    url: rootObj.url,
                                    urlBase: rootObj.urlbase,
                                    copyright: rootObj.copyright,
                                    copyrightLink: rootObj.copyrightlink,
                                    thumbnailUrl: `${publicRootPath}/thumb/${bingThumbName}`,
                                    downloadUrl: `${publicRootPath}/image/${bingName}`,
                                }).then(image => {
                                    console.log('create:'+image.get({
                                        plain: true
                                    }).endDate)
                                })
                            }
                        });
                });
        }
    });
}

module.exports = app;
