var express = require('express');
var router = express.Router();
var bingImage = require('../bingimage');
var dateFormat = require('dateformat');

/* GET home page. */
router.get('/', function(req, res, next) {
    bingImage.findAndCountAll({ order: [ [ 'endDate', 'DESC' ] ] }).then(function (images) {
        res.render('index', {
            title: "There are " + images.count + " images!",
            images: images.rows,
            dateFormat: dateFormat,
            parse: parse,
        });
    })
});

function parse(str) {
    var y = str.substr(0,4),
        m = str.substr(4,2) - 1,
        d = str.substr(6,2);
    var D = new Date(y,m,d);
    return (D.getFullYear() == y && D.getMonth() == m && D.getDate() == d) ? D : 'invalid date';
}

module.exports = router;
