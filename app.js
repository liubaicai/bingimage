var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');

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
var archiver = require('archiver');
var bingImage = require('./bingimage');
var dateFormat = require('dateformat');
// var qiniu = require('qiniu');

var bingHost = 'http://www.bing.com';
var j = schedule.scheduleJob('0 0 6 * * *', function(){
    bingImage.findOne({ where: {startDate: dateFormat(new Date(), 'yyyymmdd')} }).then(savedImage => {
        startDownload(savedImage);
    })
});
bingImage.findOne({ where: {startDate: dateFormat(new Date(), 'yyyymmdd')} }).then(savedImage => {
    startDownload(savedImage);
})

// zip()

function startDownload(savedImage) {
    request(`${bingHost}/HPImageArchive.aspx?format=js&idx=-1&n=1`, async function (error, response, body) {
        var rootPath = './public/data'
        var publicRootPath = '/data'
        var rootObj = JSON.parse(body).images[0];
        var bingUrlBase = `${bingHost}${rootObj.urlbase}`;
        var bingUrl = `${bingUrlBase}_1920x1080.jpg`;
        var bingThumbUrl = `${bingUrlBase}_320x240.jpg`;
        var bingName = bingUrl.split('/')[ bingUrl.split('/').length-1].replace('th?id=','');
        var bingThumbName = bingThumbUrl.split('/')[ bingThumbUrl.split('/').length-1].replace('th?id=','');
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
                                    // console.log('update:'+image.get({
                                    //     plain: true
                                    // }).endDate)
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
                                }).then(async image => {
                                    // await zip()
                                    // console.log('create:'+image.get({
                                    //     plain: true
                                    // }).endDate)
                                })
                            }
                        });
                });
        }
    });
}

async function zip () {
    // var accessKey = process.env.Qiniu_AccessKey;
    // var secretKey = process.env.Qiniu_SecretKey;
    // var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    // var config = new qiniu.conf.Config();
    // config.zone = qiniu.zone.Zone_z0;

    var rootPath = './public/data'
    let zipDir = `${ rootPath }/zip`
    let filename = `${ dateFormat(new Date(), 'yyyymmdd') }.zip`;
    let lastPath = `${ zipDir }/${ dateFormat(new Date() - 1, 'yyyymmdd') }.zip`
    let todayPath = `${ zipDir }/${ filename }`
    if (await fs.existsSync(lastPath)) {
        await fs.unlinkSync(lastPath)
        // var bucketManager = new qiniu.rs.BucketManager(mac, config);
        // var bucket = "www-6mao-wang";
        // var key = `${ dateFormat(new Date() - 1, 'yyyymmdd') }.zip`;
        // bucketManager.delete(bucket, key, function(err, respBody, respInfo) {
        //     if (err) {
        //         console.log(err);
        //     }
        //     if (respInfo.statusCode !== 200) {
        //         console.log(respInfo.statusCode);
        //         console.log(respBody);
        //     }
        // });
    }
    if (await fs.existsSync(todayPath)) {
        //
    } else {
        var output = fs.createWriteStream(todayPath);
        var archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });
        archive.pipe(output);
        archive.directory(`${ rootPath }/image`, false);
        archive.finalize();
        // output.on('close', function() {
        //     var options = {
        //         scope: 'www-6mao-wang',
        //     };
        //     var putPolicy = new qiniu.rs.PutPolicy(options);
        //     var uploadToken=putPolicy.uploadToken(mac);
        //
        //
        //     var localFile = todayPath;
        //     var resumeUploader = new qiniu.resume_up.ResumeUploader(config);
        //     var putExtra = new qiniu.resume_up.PutExtra();
        //
        //     putExtra.params = {
        //         "x:name": "",
        //         "x:age": 27,
        //     }
        //     putExtra.fname = filename;
        //     putExtra.resumeRecordFile = `${ zipDir }/progress.log`;
        //     var key = null;
        //     resumeUploader.putFile(uploadToken, key, localFile, putExtra, function(respErr, respBody, respInfo) {
        //         if (respErr) {
        //             throw respErr;
        //         }
        //         if (respInfo.statusCode !== 200) {
        //             console.log(respInfo.statusCode);
        //             console.log(respBody);
        //         }
        //     });
        // });
    }
}

module.exports = app;
