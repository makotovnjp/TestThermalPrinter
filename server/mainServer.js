/**
 * Module dependencies
 */
const express  = require('express');
const app      = express();
const status = require('http-status');
const mongoose = require('mongoose');
const bodyParser   = require('body-parser');

const configDB = require('./config/database');
const productCacheMem = require('./product/product_cache_memory');

//for logging & debug
const logger = require('./utilities/logger');
const path = require('path');
logger.debugStdOut(path.basename(__filename), 'Start Debug Mode');

// pre-render io for seo
if(require('./config/auth').runningMode==200) {
    var prerenderIO=require('prerender-node').set('prerenderToken', require('./config/auth').prerenderToken)
        prerenderIO=prerenderIO.set('protocol','https');
    app.use(prerenderIO);
}
/**
 * Constant Value
 */
const PORT    = 8080;
mongoose.connect(configDB.url); // connect to our database

app.disable('x-powered-by');   // for security

app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/',express.static('../client'));

//Route
var categoryRoute = require('./product/category.route');
var productRoute = require('./product/product.route');
var orderRoute = require('./order/order.route');
var userRoute=require('./users/user.route');
var uploadRoute = require('./upload/uploadAPI');
var contactRoute= require('./contact/contact.route');
var sitemapRoute= require('./sitemap/sitemap.route');
app.use('/api/category',categoryRoute);
app.use('/api/product',productRoute);
app.use('/api/order',orderRoute);
app.use('/api/admin',userRoute);
app.use('/api/photo/',uploadRoute);
app.use('/api/contact/',contactRoute);
app.use('/sitemap/',sitemapRoute);
//ensure all routing handle by angularjs:
app.get('/*', function(req, res){
    res.sendFile('index.html',{ root: path.join(__dirname, '../client') });
});
//Error
// Add the error logger after all middleware and routes so that
// it can log errors from the whole application. Any custom error
// handlers should go after this.
app.use(logger.errorLogger);

// Basic 404 handler
app.use( function(req, res) {
    res.status(status.NOT_FOUND).send('Not Found');
});

// Basic error handler
app.use( function(err, req, res) {
    // If our routes specified a specific response, then send that. Otherwise,
    // send a generic message so as not to leak anything.
    res.status(status.INTERNAL_SERVER_ERROR).send(err.response || 'Something broke!');
});

// launch ======================================================================
//Initialize and start app
// OrderedSeatDbCtrl.InitOrderedSeat(function(err){
//     if(err) {
//         console.log('Can not Initialize to start server');
//     } else {
//         app.listen(PORT);
//         console.log('The magic happens on port ' + PORT);
//     }
// });
productCacheMem.initProductCacheMemory(function (err) {
    if(err) {
        console.log('Can not Initialize to start server');
    } else {
        app.listen(PORT);
        console.log('The magic happens on port ' + PORT);
    }
});
