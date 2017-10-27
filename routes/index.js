var express = require('express');
var router = express.Router();
var bingImage = require('../bingimage');

/* GET home page. */
router.get('/', function(req, res, next) {
    bingImage.findAndCountAll({ order: [ [ 'endDate', 'DESC' ] ] }).then(function (images) {
        res.render('index', {
            title: "There are " + images.count + " images!",
            images: images.rows,
        });
    })
});

module.exports = router;
