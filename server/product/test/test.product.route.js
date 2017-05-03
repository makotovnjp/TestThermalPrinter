'use strict';

/**
 * Module dependencies
 */
//database
const mongoose = require('mongoose');
const Product = require('./../product.model');
const ProductCacheMem = require('./../product_cache_memory');
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


describe('Product API Tests', function() {
    let testProductFirstData = {
        name:{
            vn:'Pho',
            jp:'フォー'
        },
        category:{
            vn:['Mon Chinh'],
            jp:['メインメニュー']
        },
        details:{
            description:
            {
                vn:'Pho Ngon',
                jp:'美味しいフォー'
            }
        },
        /**
         * Properties with same value for vietnamese and japanese
         */
        pictures: ['https://www.google.co.jp/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&cad=rja&uact=8&ved=0ahUKEwiq24S6qvjRAhXKUrwKHbOZD4sQjRwIBw&url=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FPho&psig=AFQjCNFrrnMBDBpuThTqtkUls7gESUEz8w&ust=1486362636167528'],
        thumbnail: 'https://www.google.co.jp/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&cad=rja&uact=8&ved=0ahUKEwiq24S6qvjRAhXKUrwKHbOZD4sQjRwIBw&url=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FPho&psig=AFQjCNFrrnMBDBpuThTqtkUls7gESUEz8w&ust=1486362636167528',
        price:900,
        availableQuantity:20
    };

    /**
     * Setup before each test
     */
    beforeEach(function (done) {
        let product1 = new Product(testProductFirstData);

        product1.save(function (err) {
            if (err) {
                console.log('Can not create product1');
                throw  err;
            }
            done();
        });

    });

    /**
     * Setup after each test
     */
    afterEach(function (done) {
        //clear test database
        Product.remove(function (err) {
            if (err) {
                console.log('Product remove error');
                throw err;
            }
            done();
        });
    });

    //get api
    {
        /**
         * get product with wrong parameter
         */
        it('[get /api/product/?thanh=hello] response should be error', function (done) {
            let url = URL_ROOT+'/api/product/?thanh=hello';
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
         * get all product
         */
        it('[get /api/product] response should be OK', function (done) {
            let url = URL_ROOT+'/api/product';
            superagent
                .get(url)
                .set('Content-Type', 'application/json')
                .end(function (error, res) {
                    //check res
                    assert.equal(res.status, httpStatus.OK);
                    assert.equal(res.body[0].name.vn, testProductFirstData.name.vn);

                    done();
                });
        });

        /**
         * get product by category
         */
        it('[get /api/product/?category[vn]=Mon Chinh] response should be OK', function (done) {
            let url = URL_ROOT+'/api/product/?category[vn]=Mon Chinh';
            superagent
                .get(url)
                .set('Content-Type', 'application/json')
                .end(function (error, res) {
                    //check res
                    assert.equal(res.status, httpStatus.OK);
                    assert.equal(res.body[0].name.vn, testProductFirstData.name.vn);

                    done();
                });
        });


        /**
         * get /api/product/?language=vn
         */
        it('[get /api/product/language=vn] response should be OK', function (done) {
            let url = URL_ROOT+'/api/product/?language=vn';
            superagent
                .get(url)
                .set('Content-Type', 'application/json')
                .end(function (error, res) {
                    //check res
                    assert.equal(res.body[0].name.vn, testProductFirstData.name.vn);
                    assert.equal(res.body[0].name.jp, undefined);

                    done();
                });
        });


        /**
         * get /api/product/?name[jp]=フォー
         */
        it('[get /api/product/?name[jp]=フォー] response should be OK', function (done) {
            let url = URL_ROOT+'/api/product/?name[jp]=フォー';
            superagent
                .get(url)
                .set('Content-Type', 'application/json')
                .end(function (error, res) {
                    //check res
                    assert.equal(res.status, httpStatus.OK);
                    assert.equal(res.body[0].name.jp, testProductFirstData.name.jp);
                    assert.equal(res.body[0].name.vn, testProductFirstData.name.vn);

                    done();
                });
        });

        /**
         * get /api/product/?_id
         */
        it('[get /api/product/?_id] response should be OK', function (done) {
            let url = URL_ROOT+'/api/product/';
            superagent
                .get(url)
                .set('Content-Type', 'application/json')
                .end(function (error, res) {
                    //check res
                    assert.equal(res.status, httpStatus.OK);

                    let urlGetById = URL_ROOT+'/api/product/?_id=' + res.body[0]._id;
                    superagent
                        .get(urlGetById)
                        .set('Content-Type', 'application/json')
                        .end(function (error, res) {
                            //check res
                            assert.equal(res.status, httpStatus.OK);
                            assert.equal(res.body[0].name.jp, testProductFirstData.name.jp);
                            assert.equal(res.body[0].name.vn, testProductFirstData.name.vn);

                            done();
                        });
                });
        });

        /**
         * get /api/product/?language=vn&name[vn]=Pho
         */
        it('[get /api/product/?language=vn&name[vn]=Pho] response should be OK', function (done) {
            let url = URL_ROOT+'/api/product/?language=vn&name[vn]=Pho';
            superagent
                .get(url)
                .set('Content-Type', 'application/json')
                .end(function (error, res) {
                    //check res
                    assert.equal(res.status, httpStatus.OK);
                    assert.equal(res.body[0].name.jp, undefined);
                    assert.equal(res.body[0].name.vn, testProductFirstData.name.vn);

                    done();
                });
        });
    }

    //post create api
    {
        /**
         * post api test (create a new product)
         */
        it('[post /api/product] post a new correct product', function (done) {
            let testData = {
                name:{
                    vn:'Banh My',
                    jp:'パン'
                },
                category:{
                    vn:['Mon Phu'],
                    jp:['サブメニュー']
                },
                details:{
                    description:
                    {
                        vn:'Banh My tuyet hao',
                        jp:'美味しいパン'
                    }
                },
                /**
                 * Properties with same value for vietnamese and japanese
                 */
                pictures: ['https://www.google.co.jp/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&cad=rja&uact=8&ved=0ahUKEwjFg8mhq_jRAhXKvLwKHe_cAwYQjRwIBw&url=https%3A%2F%2Fwww.restaurants-in-hanoi.com%2Fcuisines%2Fbanh-mi.html&psig=AFQjCNFavFfLqbZAiuXgpm5XF5_2rGqcAQ&ust=1486362853323589'],
                thumbnail: 'https://www.google.co.jp/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&cad=rja&uact=8&ved=0ahUKEwjFg8mhq_jRAhXKvLwKHe_cAwYQjRwIBw&url=https%3A%2F%2Fwww.restaurants-in-hanoi.com%2Fcuisines%2Fbanh-mi.html&psig=AFQjCNFavFfLqbZAiuXgpm5XF5_2rGqcAQ&ust=1486362853323589',
                price:500,
                availableQuantity:19
            };

            var testDataJson = JSON.stringify(testData);

            let url = URL_ROOT + '/api/product';
            superagent
                .post(url)
                .set('Content-Type', 'application/json')
                .send(testDataJson)
                .end(function (error, res) {
                    assert.ifError(error);

                    //check res
                    assert.equal(res.status, httpStatus.CREATED);

                    //check Product Cache Memory
                    assert.equal(ProductCacheMem.getProductCacheMemory(res.body._id),19);

                    //check database
                    Product.count({}, function (error, count) {
                        assert.ifError(error);
                        assert.equal(count, 2);
                        done();

                    });

                });
        });

        it('[post /api/product] number of document should be 0 when post a new product blank of vn name', function (done) {
            let testData = {
                name:{
                    jp:'パン'
                },
                category:{
                    vn:['Mon Phu'],
                    jp:['サブメニュー']
                },
                details:{
                    description:
                    {
                        vn:'Banh My tuyet hao',
                        jp:'美味しいパン'
                    }
                },
                /**
                 * Properties with same value for vietnamese and japanese
                 */
                pictures: ['https://www.google.co.jp/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&cad=rja&uact=8&ved=0ahUKEwjFg8mhq_jRAhXKvLwKHe_cAwYQjRwIBw&url=https%3A%2F%2Fwww.restaurants-in-hanoi.com%2Fcuisines%2Fbanh-mi.html&psig=AFQjCNFavFfLqbZAiuXgpm5XF5_2rGqcAQ&ust=1486362853323589'],
                thumbnail: 'https://www.google.co.jp/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&cad=rja&uact=8&ved=0ahUKEwjFg8mhq_jRAhXKvLwKHe_cAwYQjRwIBw&url=https%3A%2F%2Fwww.restaurants-in-hanoi.com%2Fcuisines%2Fbanh-mi.html&psig=AFQjCNFavFfLqbZAiuXgpm5XF5_2rGqcAQ&ust=1486362853323589',
                price:500,
                availableQuantity:20
            };
            var testDataJson = JSON.stringify(testData);

            let url = URL_ROOT + '/api/product';
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

    //post edit api
    {
        /**
         * edit name vn
         */
        it('[post /api/product/:productID/edit] response should be OK', function (done) {
            let url = URL_ROOT+'/api/product';
            superagent
                .get(url)
                .set('Content-Type', 'application/json')
                .end(function (error, res) {
                    //check res
                    assert.equal(res.status, httpStatus.OK);
                    assert.equal(res.body[0].name.vn, testProductFirstData.name.vn);

                    let editUrl = URL_ROOT+'/api/product/' + res.body[0]._id + '/edit';
                    var productID = res.body[0]._id;

                    let updateObject = {
                        availableQuantity:113
                    };

                    let JsonUpdateObject = JSON.stringify(updateObject);

                    superagent
                        .post(editUrl)
                        .set('Content-Type', 'application/json')
                        .send(JsonUpdateObject)
                        .end(function (err, res) {
                            assert.ifError(error);
                            assert.equal(res.status, httpStatus.OK);

                            //check cache mem
                            assert.equal(ProductCacheMem.getProductCacheMemory(productID),113);

                            //check database
                            Product.count({}, function (error, count) {
                                assert.equal(count, 1);

                                done();
                            });
                        });
                });
        });
    }
    
});