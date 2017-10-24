var express = require('express');
var router = express.Router();
var bingImage = require('../bingimage');

/* GET home page. */
router.get('/', function(req, res, next) {
    bingImage.count().then(c => {
        res.render('index', { title: "There are " + c + " images!" });
    })
});

module.exports = router;
