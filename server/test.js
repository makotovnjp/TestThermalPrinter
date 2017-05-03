'use strict';

/**
 * Module dependencies
 */
//database
const mongoose = require('mongoose');
const configDB = require('./config/database');
const productCacheMem = require('./product/product_cache_memory');

//http
const express = require('express');
const bodyParser   = require('body-parser');

describe("Starting Test", function () {
    //set timeout for mocha
    this.timeout(5000);  //5ms

    let server;

    /**
     * Setup before all tests
     */
    before(function () {
        // connect to test database
        mongoose.connect(configDB.testURI); // connect to our database

        // start server
        let categoryRoute = require('./product/category.route');
        let productRoute = require('./product/product.route');
        let orderRoute = require('./order/order.route');

        let app = express();
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));

        app.use('/api/category',categoryRoute);
        app.use('/api/product',productRoute);
        app.use('/api/order',orderRoute);

        productCacheMem.initProductCacheMemory(function (err) {
            if(err) {
                console.log('Can not Initialize to start server');
            } else {
                server = app.listen(3000);
            }
        });
    });

    /**
     * Setup after all tests
     */
    after( function () {
        server.close();
    });

    //category api test
    require('./product/test/test.category.route');

    //product api test
    require('./product/test/test.product.route');
    
    //order api test
    require('./order/test/test.order.route');

    //hack order api test
    require('./order/test/test.order.hack.route');


});
