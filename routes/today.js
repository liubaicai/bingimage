var express = require('express');
var router = express.Router();
var axios = require('axios');
var request = require('request');

var bingHost = 'http://www.bing.com';

/* GET home page. */
router.get('/', function(req, res, next) {
    request(`${bingHost}/HPImageArchive.aspx?format=js&idx=0&n=1`, function (error, response, body) {
        var r = request.get(`${bingHost}${JSON.parse(body).images[0].url}`);
        r.pipe(res);
    });
});

module.exports = router;