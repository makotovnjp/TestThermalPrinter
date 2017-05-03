'use strict';

/**
 * Module dependencies
 */
//database
const mongoose = require('mongoose');
const Order = require('./../order.model');
const Product = require('./../../product/product.model');
const async = require('async');

//http
const superagent = require('superagent');
const express = require('express');
const httpStatus = require('http-status');
const assert = require('assert');

/**
 * Constant variable
 */
const URL_ROOT = 'http://localhost:3000';

describe('Order API Tests', function() {
    let testOrderFirstData = {
        _id:'abcdef_thanh',
        // Product information
        listProduct:[{
            name:{
                vn: 'Pho'
            },
            price:500,
            quantity:2
        }],
        // Customer information
        customer:{
            name:'Thanh2',
            email: 'makotovnjp@gmail.com',
            tel: '08056152049',
            address:'Inuyama',
            postOfficeNumber:'484-0086'
        }
    };

    /**
     * Setup before each test
     */
    beforeEach(function (done) {
        let order1 = new Order(testOrderFirstData);

        order1.save(function (err) {
            if (err) {
                console.log('Can not create order1');
                throw  err;
            }
            done();
        });
    });

    /**
     * Setup after each test
     */
    afterEach(function (done) {
        //clear database
        Order.remove(function (err) {
            if (err) {
                console.log('Order remove error');
                throw err;
            }
            done();
        });
    });

    //get api
    {
        /**
         * get order with wrong parameter
         */
        it('[get /api/order/?thanh=hello] response should be bad request', function (done) {
            let url = URL_ROOT+'/api/order/?thanh=hello';
            superagent
                .get(url)
                .set('Content-Type', 'application/json')
                .end(function (error, res) {
                    //check res
                    assert.equal(res.status, httpStatus.BAD_REQUEST);

                    done();
                });
        });

        /**
         * get all orders
         */
        it('[get /api/order/] response should be OK', function (done) {
            let url = URL_ROOT+'/api/order/';
            superagent
                .get(url)
                .set('Content-Type', 'application/json')
                .end(function (error, res) {
                    //check res
                    assert.equal(res.status, httpStatus.OK);

                    //check data
                    assert.equal(res.body[0].listProduct[0].vn, testOrderFirstData.listProduct[0].vn);

                    done();
                });
        });

        /**
         * get by time
         */
        it('[get /api/order/?startOrderTime=yesterday&endOrderTime=tomorrow] response should be OK', function (done) {
            let yesterday = new Date();
            yesterday.setDate(yesterday.getDate() -1);

            let tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            let url = URL_ROOT+'/api/order/?' +'startOrderTime=' + yesterday.toDateString() + '&endOrderTime=' + tomorrow.toDateString();
            superagent
                .get(url)
                .set('Content-Type', 'application/json')
                .end(function (error, res) {
                    //check res
                    assert.equal(res.status, httpStatus.OK);

                    //check data
                    assert.equal(res.body[0].listProduct[0].vn, testOrderFirstData.listProduct[0].vn);

                    done();
                });
        });

        /**
         * get by customer
         */
        it('[get /api/order/?customer[name]=Thanh2] response should be OK', function (done) {
            let url = URL_ROOT+'/api/order/?customer[name]=Thanh2';
            superagent
                .get(url)
                .set('Content-Type', 'application/json')
                .end(function (error, res) {
                    //check res
                    assert.equal(res.status, httpStatus.OK);

                    //check data
                    assert.equal(res.body[0].listProduct[0].vn, testOrderFirstData.listProduct[0].vn);

                    done();
                });
        });
    }

    //post api
    {
        /**
         * post api test (create a new order)
         */
        // it('[post /api/order] post a new correct order', function (done) {
        //     let productInfo = {
        //         name:{
        //             vn:'testProduct',
        //         },
        //         category:{
        //             vn:['testCategory'],
        //         },
        //         details:{
        //             description:
        //                 {
        //                     vn:'Test',
        //                 }
        //         },
        //         /**
        //          * Properties with same value for vietnamese and japanese
        //          */
        //         pictures: ['https://www.google.co.jp/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&cad=rja&uact=8&ved=0ahUKEwiq24S6qvjRAhXKUrwKHbOZD4sQjRwIBw&url=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FPho&psig=AFQjCNFrrnMBDBpuThTqtkUls7gESUEz8w&ust=1486362636167528'],
        //         thumbnail: 'https://www.google.co.jp/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&cad=rja&uact=8&ved=0ahUKEwiq24S6qvjRAhXKUrwKHbOZD4sQjRwIBw&url=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FPho&psig=AFQjCNFrrnMBDBpuThTqtkUls7gESUEz8w&ust=1486362636167528',
        //         price:900,
        //         availableQuantity:20
        //     };
        //
        //     Product.create(productInfo, function (err, createdProduct) {
        //         assert.ifError(err);
        //         let testOrderData = {
        //             // Product information
        //             listProduct:[{
        //                 _id:createdProduct._id,
        //                 name:{
        //                     vn: 'testProduct'
        //                 },
        //                 price:900,
        //                 quantity:2
        //             }],
        //             // Customer information
        //             customer:{
        //                 name:'Thanh3',
        //                 email: 'makotovnjp@gmail.com',
        //                 tel: '08056152049',
        //                 address:'Inuyama',
        //                 postOfficeNumber:'484-0086'
        //             }
        //         };
        //
        //         let testOrderJson = JSON.stringify(testOrderData);
        //
        //         let url = URL_ROOT + '/api/order';
        //         superagent
        //             .post(url)
        //             .set('Content-Type', 'application/json')
        //             .send(testOrderJson)
        //             .end(function (error, res) {
        //                 assert.ifError(error);
        //
        //                 //check res
        //                 assert.equal(res.status, httpStatus.CREATED);
        //
        //                 //check database
        //                 Order.count({}, function (error, count) {
        //                     assert.ifError(error);
        //                     assert.equal(count, 2);
        //                     done();
        //                 });
        //
        //             });
        //
        //     });
        // });

        /**
         * create a new order with wrong price
         */
        it('[post /api/order] post a new order with wrong price', function (done) {
            let testData = {
                // Product information
                listProduct:[{
                    name:{
                        vn: 'BanhMy'
                    },
                    price:490,
                    quantity:2
                }],
                // Customer information
                customer:{
                    name:'Thanh3',
                    email: 'makotovnjp@gmail.com',
                    tel: '08056152049',
                    address:'Inuyama',
                    postOfficeNumber:'484-0086'
                }
            };

            var testDataJson = JSON.stringify(testData);

            let url = URL_ROOT + '/api/order';
            superagent
                .post(url)
                .set('Content-Type', 'application/json')
                .send(testDataJson)
                .end(function (error, res) {
                    //check res
                    assert.equal(res.status, httpStatus.CONFLICT);
                    done();
                });
        });

        /**
         * post a wrong order
         */
        it('[post /api/order] post a new wrong order', function (done) {
            let testData = {
                // Product information
                listProduct:[{
                    name:{
                        vn: 'BanhMy'
                    },
                    price:500,
                    quantity:2
                }],
                // Customer information
                customer:{
                    email: 'makotovnjp@gmail.com',
                    tel: '08056152049',
                    address:'Inuyama',
                    postOfficeNumber:'484-0086'
                }
            };

            var testDataJson = JSON.stringify(testData);

            let url = URL_ROOT + '/api/order';
            superagent
                .post(url)
                .set('Content-Type', 'application/json')
                .send(testDataJson)
                .end(function (error, res) {
                    //check res
                    assert.equal(res.status, httpStatus.BAD_REQUEST);

                    done();
                });
        });
    }

    //edit api
    {
        /**
         * edit name vn
         */
        it('[post /api/order/:orderID/edit] response should be OK', function (done) {
            let url = URL_ROOT+'/api/order';
            superagent
                .get(url)
                .set('Content-Type', 'application/json')
                .end(function (error, res) {
                    //check res
                    assert.equal(res.status, httpStatus.OK);

                    let editUrl = URL_ROOT +'/api/order/' + res.body[0]._id + '/edit';

                    let updateObject = {
                        'status.vn':'Đã gửi'
                    };

                    let JsonUpdateObject = JSON.stringify(updateObject);
                    console.log(JsonUpdateObject);

                    superagent
                        .post(editUrl)
                        .set('Content-Type', 'application/json')
                        .send(JsonUpdateObject)
                        .end(function (err, res) {
                            assert.ifError(error);
                            assert.equal(res.status, httpStatus.OK);

                            //check database
                            Order.find({},function (error, foundItems) {
                                assert.equal(foundItems[0].status.vn, 'Đã gửi');

                                done();
                            });
                        });
                });
        });
    }
});
