var express     = require('express');
var apiRoutes = express.Router();
sm = require('sitemap');
var sitemap_vn = sm.createSitemap ({
    hostname: 'https://bepvietjp.com',
    cacheTime: 600000,        // 600 sec - cache purge period
    urls: [
        { url: '/',  changefreq: 'monthly', priority: 0.3, lastmodISO: '2017-04-25T15:30:00.000Z'},
        { url: '/introduction',  changefreq: 'monthly',  priority: 0.7,lastmodISO: '2017-03-29T15:30:00.000Z'},
        { url: '/listProduct',    changefreq: 'weekly',  priority: 0.5,lastmodISO: '2017-04-25T15:30:00.000Z'},
        { url: '/product/58c485079069043670f37177',  changefreq: 'weekly',  priority: 0.5,lastmodISO: '2017-03-25T15:30:00.000Z'}
    ]
});
var sitemap_jp = sm.createSitemap ({
    hostname: 'https://vietnamkitchenjp.com',
    cacheTime: 600000,        // 600 sec - cache purge period
    urls: [
        { url: '/',  changefreq: 'monthly', priority: 0.3, lastmodISO: '2017-04-25T15:30:00.000Z'},
        { url: '/introduction',  changefreq: 'monthly',  priority: 0.7,lastmodISO: '2017-03-29T15:30:00.000Z'},
        { url: '/listProduct',    changefreq: 'weekly',  priority: 0.5,lastmodISO: '2017-04-25T15:30:00.000Z'},
        { url: '/product/58c485079069043670f37177',  changefreq: 'weekly',  priority: 0.5,lastmodISO: '2017-03-25T15:30:00.000Z'}
    ]
});
apiRoutes.get('/vn/sitemap.xml', function(req, res) {
    sitemap_vn.toXML( function (err, xml) {
        if (err) {
            return res.status(500).end();
        }
        res.header('Content-Type', 'application/xml');
        res.send( xml );
    });
});
apiRoutes.get('/jp/sitemap.xml', function(req, res) {
    sitemap_jp.toXML( function (err, xml) {
        if (err) {
            return res.status(500).end();
        }
        res.header('Content-Type', 'application/xml');
        res.send( xml );
    });
});
module.exports = apiRoutes;