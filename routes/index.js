var express = require('express');
var router = express.Router();
var bingImage = require('../bingimage');
var dateFormat = require('dateformat');
var fs = require('fs');
var pagination = require('pagination');

var bingHost = 'http://www.bing.com';

/* GET home page. */
router.get('/', async function(req, res, next) {
    var pagesize = 20;
    var page = req.query.page;
    if (page){}else{
        page = 1
    }
    var images = await bingImage.findAndCountAll({
        order: [ [ 'endDate', 'DESC' ] ],
        limit: pagesize,
        offset: (page - 1) * pagesize,
    });
    var paginator = new pagination.TemplatePaginator({
        current: page,
        rowsPerPage: pagesize,
        totalResult: images.count,
        template: function(result) {
            var i, len, prelink;
            var html = '<div><ul class="pagination">';
            if(result.pageCount < 2) {
                html += '</ul></div>';
                return html;
            }
            prelink = this.preparePreLink(result.prelink);
            if(result.previous) {
                html += '<li><a href="' + prelink + result.previous + '">' + '上一页' + '</a></li>';
            }
            if(result.range.length) {
                for( i = 0, len = result.range.length; i < len; i++) {
                    if(result.range[i] === result.current) {
                        html += '<li class="active"><a href="' + prelink + result.range[i] + '">' + result.range[i] + '</a></li>';
                    } else {
                        html += '<li><a href="' + prelink + result.range[i] + '">' + result.range[i] + '</a></li>';
                    }
                }
            }
            if(result.next) {
                html += '<li><a href="' + prelink + result.next + '" class="paginator-next">' + '下一页' + '</a></li>';
            }
            html += '</ul></div>';
            return html;
        }
    });
    res.render('index', {
        message: "共收集 " + images.count + " 张精美壁纸!",
        images: images.rows,
        dateFormat: dateFormat,
        parse: parse,
        paginator: paginator,
    });
});

router.get('/today', async function(req, res, next) {
    var savedImage = await bingImage.findOne({ order: [ [ 'endDate', 'DESC' ] ] });
    if(savedImage!=null){
        // savedImage.downloadCount++;
        // savedImage.save();
        var rootPath = './public/data'
        var bingName = `${savedImage.urlBase.split('/')[ savedImage.urlBase.split('/').length-1]}_1920x1080.jpg`;
        var bingPath = `${rootPath}/image/${bingName}`;
        fs.createReadStream(bingPath).pipe(res);
    }
});

router.get('/download', async function (req, res, next) {
    var id = req.query.key;
    var savedImage = await bingImage.findById(id);
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

function parse(str) {
    var y = str.substr(0,4),
        m = str.substr(4,2) - 1,
        d = str.substr(6,2);
    var D = new Date(y,m,d);
    return (D.getFullYear() == y && D.getMonth() == m && D.getDate() == d) ? D : 'invalid date';
}

module.exports = router;
