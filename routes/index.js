var express = require('express');
var router = express.Router();
var bingImage = require('../bingimage');
var request = require('request');
var dateFormat = require('dateformat');
var fs = require('fs');

var bingHost = 'http://www.bing.com';

/* GET home page. */
router.get('/', function(req, res, next) {
    bingImage.findAndCountAll({ order: [ [ 'endDate', 'DESC' ] ] }).then(function (images) {
        res.render('index', {
            message: "共收集 " + images.count + " 张精美壁纸!",
            images: images.rows,
            dateFormat: dateFormat,
            parse: parse,
        });
    });
});

router.get('/today', function(req, res, next) {
    bingImage.findOne({ order: [ [ 'endDate', 'DESC' ] ] }).then(savedImage => {
        if(savedImage!=null){
            // savedImage.downloadCount++;
            // savedImage.save();
            var rootPath = './public/data'
            var bingName = `${savedImage.urlBase.split('/')[ savedImage.urlBase.split('/').length-1]}_1920x1080.jpg`;
            var bingPath = `${rootPath}/image/${bingName}`;
            fs.createReadStream(bingPath).pipe(res);
        }
    });
});

router.get('/download', function (req, res, next) {
    var id = req.query.key;
    bingImage.findById(id).then(savedImage => {
        if (savedImage==null){
            var err = new Error('Not Found');
            err.status = 404;
            next(err);
        }else{
            savedImage.downloadCount++;
            savedImage.save();
            var rootPath = './public/data'
            var bingName = `${savedImage.urlBase.split('/')[ savedImage.urlBase.split('/').length-1]}_1920x1080.jpg`;
            var bingPath = `${rootPath}/image/${bingName}`;
            res.download(bingPath, bingName);
        }
    });
});

router.get('/start', function (req, res, next) {
    bingImage.findOne({ where: {startDate: dateFormat(new Date(), 'yyyymmdd')} }).then(savedImage => {
        startDownload(savedImage);
    })
});

function parse(str) {
    var y = str.substr(0,4),
        m = str.substr(4,2) - 1,
        d = str.substr(6,2);
    var D = new Date(y,m,d);
    return (D.getFullYear() == y && D.getMonth() == m && D.getDate() == d) ? D : 'invalid date';
}

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

module.exports = router;


