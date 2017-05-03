'use strict';

/**
 * Module dependencies
 */
//database
const mongoose = require('mongoose');
const Order = require('./../order.model');
var Product = require('./../../product/product.model');
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

    //post api
    {
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
         * 1. post a wrong name+price order
         */
        it('[post /api/order] post a new wrong name+price order', function (done) {
            let testData = {
                // Product information
                listProduct:[{
                    name:{
                        vn: 'Pho Co'
                    },
                    price:1500,
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
         * 2. post a order with fake email
         */
        it('[post /api/order] post a new wrong order with fake email', function (done) {
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
                    name:'Thanh3',
                    email: 'ai_cho_toi_luong_thien.gmail.com',
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
         * 3. post a order with fake tel
         */
        it('[post /api/order] post a new wrong order with fake tel', function (done) {
            let testData = {
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
                    name:'Thanh3',
                    email: 'makotovnjp@gmail.com',
                    tel: '080.5615.2049',
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
         * 4. post a order with double customer info
         */
        it('[post /api/order] post a new wrong order with double customer info', function (done) {
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
                customer_1:{
                    name:'Thanh3',
                    email: 'makotovnjp@gmail.com',
                    tel: '08056152049',
                    address:'Inuyama',
                    postOfficeNumber:'484-0086'
                },

                customer_2:{
                    name:'Trung day',
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

        /**
         * 5. post a order with a true product and a fake product
         */
        it('[post /api/order] post a new order with a true product and a fake product', function (done) {
            let testData = {
                // Product information
                listProduct:[{
                    name:{
                        vn: 'BanhMy'
                    },
                    price:500,
                    quantity:2
                }, {
                  name:{
                      vn: 'Pho'
                  },
                  price:500,
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
         * 6. post two products with wrong price
         */
        it('[post /api/order] post a new order two products, wrong prices', function (done) {
            let testData = {
                // Product information
                listProduct:[{
                    name:{
                        vn: 'Pho'
                    },
                    price:490,
                    quantity:2
                },{
                  name:{
                      vn: 'Pho'
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
    }

    //edit api
    {
        /**
         * edit name vn
         */
        it('[post /api/order/:orderID/edit] response should be NG', function (done) {
            let url = URL_ROOT+'/api/order';
            superagent
                .get(url)
                .set('Content-Type', 'application/json')
                .end(function (error, res) {
                    //check res
                    assert.equal(res.status, httpStatus.OK);

                    let editUrl = URL_ROOT +'/api/order/' + res.body[0]._id + '/edit';

                    let updateObject = {
                        customer:{
                            name:'Trung'
                        },
                        status:'sent'
                    };

                    let JsonUpdateObject = JSON.stringify(updateObject);

                    superagent
                        .post(editUrl)
                        .set('Content-Type', 'application/json')
                        .send(JsonUpdateObject)
                        .end(function (err, res) {
                            assert.equal(res.status, httpStatus.BAD_REQUEST);

                            //check database
                            Order.find({},function (error, foundItems) {
                                assert.equal(foundItems[0].customer.name, 'Thanh2');

                                done();
                            });
                        });
                });
        });

        /**
         * edit product name in order
         */
        it('[post /api/order/:orderID/edit] response should be NG', function (done) {
            let url = URL_ROOT+'/api/order';
            superagent
                .get(url)
                .set('Content-Type', 'application/json')
                .end(function (error, res) {
                    //check res
                    assert.equal(res.status, httpStatus.OK);

                    let editUrl = URL_ROOT +'/api/order/' + res.body[0]._id + '/edit';

                    let updateObject = {
                        listProduct:[{
                            name:{
                                vn: 'BANH_MY_KIEU_MY'
                            },
                            price:500,
                            quantity:2
                        }],
                        customer:{
                            name:'Trung'
                        },
                        status:'sent'
                    };

                    let JsonUpdateObject = JSON.stringify(updateObject);

                    superagent
                        .post(editUrl)
                        .set('Content-Type', 'application/json')
                        .send(JsonUpdateObject)
                        .end(function (err, res) {
                            assert.equal(res.status, httpStatus.BAD_REQUEST);

                            //check database
                            Order.find({},function (error, foundItems) {
                                assert.equal(foundItems[0].customer.name, 'Thanh2');

                                done();
                            });
                        });
                });
        });

        /**
         * edit product price in order
         */
        it('[post /api/order/:orderID/edit] response should be NG', function (done) {
            let url = URL_ROOT+'/api/order';
            superagent
                .get(url)
                .set('Content-Type', 'application/json')
                .end(function (error, res) {
                    //check res
                    assert.equal(res.status, httpStatus.OK);

                    let editUrl = URL_ROOT +'/api/order/' + res.body[0]._id + '/edit';

                    let updateObject = {
                        listProduct:[{
                            name:{
                                vn: 'BanhMy'
                            },
                            price:120,
                            quantity:2
                        }],
                        customer:{
                            name:'Trung'
                        },
                        status:'sent'
                    };

                    let JsonUpdateObject = JSON.stringify(updateObject);

                    superagent
                        .post(editUrl)
                        .set('Content-Type', 'application/json')
                        .send(JsonUpdateObject)
                        .end(function (err, res) {
                            assert.equal(res.status, httpStatus.BAD_REQUEST);

                            //check database
                            Order.find({},function (error, foundItems) {
                                assert.equal(foundItems[0].customer.name, 'Thanh2');

                                done();
                            });
                        });
                });
        });

        /**
         * edit product quantity in order
         */
        it('[post /api/order/:orderID/edit] response should be NG', function (done) {
            let url = URL_ROOT+'/api/order';
            superagent
                .get(url)
                .set('Content-Type', 'application/json')
                .end(function (error, res) {
                    //check res
                    assert.equal(res.status, httpStatus.OK);

                    let editUrl = URL_ROOT +'/api/order/' + res.body[0]._id + '/edit';

                    let updateObject = {
                        listProduct:[{
                            name:{
                                vn: 'BanhMy'
                            },
                            price:500,
                            quantity:120
                        }],
                        customer:{
                            name:'Trung'
                        },
                        status:'sent'
                    };

                    let JsonUpdateObject = JSON.stringify(updateObject);

                    superagent
                        .post(editUrl)
                        .set('Content-Type', 'application/json')
                        .send(JsonUpdateObject)
                        .end(function (err, res) {
                            assert.equal(res.status, httpStatus.BAD_REQUEST);

                            //check database
                            Order.find({},function (error, foundItems) {
                                assert.equal(foundItems[0].customer.name, 'Thanh2');

                                done();
                            });
                        });
                });
        });
    }
});
