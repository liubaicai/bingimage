var express = require('express');
var router = express.Router();
var bingImage = require('../bingimage');
var dateFormat = require('dateformat');
var fs = require('fs');

var bingHost = 'http://www.bing.com';

/* GET home page. */
router.get('/', function(req, res, next) {
    bingImage.findAndCountAll({ order: [ [ 'endDate', 'DESC' ] ] }).then(function (images) {
        res.render('index', {
            title: "There are " + images.count + " images!",
            images: images.rows,
            dateFormat: dateFormat,
            parse: parse,
        });
    });
});

router.get('/today', function(req, res, next) {
    bingImage.findOne({ order: [ [ 'endDate', 'DESC' ] ] }).then(savedImage => {
        if(savedImage!=null){
            savedImage.downloadCount++;
            savedImage.save();
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

function parse(str) {
    var y = str.substr(0,4),
        m = str.substr(4,2) - 1,
        d = str.substr(6,2);
    var D = new Date(y,m,d);
    return (D.getFullYear() == y && D.getMonth() == m && D.getDate() == d) ? D : 'invalid date';
}

module.exports = router;
