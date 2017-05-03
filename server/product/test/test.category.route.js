'use strict';

/**
 * Module dependencies
 */
//database
const mongoose = require('mongoose');
const Category = require('../category.model');
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


describe('category API Tests', function() {
    let testCategoryFirstData = {
        name:{
            vn: 'Món chính',
            jp: 'メインメニュ'
        }
    };
    /**
     * Setup before each test
     */
    beforeEach(function (done) {
        let category1 = new Category(testCategoryFirstData);

        category1.save(function (err) {
            if (err) {
                console.log('Can not create category1');
                throw  err;
            }
            done();
        });
    });

    /**
     * Setup after each test
     */
    afterEach(function (done) {
        //clean database
        Category.remove(function (err) {
            if (err) {
                console.log('Category remove error');
                throw err;
            }
            done();
        });
    });

    //get Api
    {
        /**
         * Bad request
         */
        it('[get /api/category/?hello=thanh] response should be a bad request', function (done) {
            let url = URL_ROOT+'/api/category/?hello=thanh';
            superagent
                .get(url)
                .set('Content-Type', 'application/json')
                .end(function (error, res) {
                    //check res
                    assert.equal(res.status, httpStatus.BAD_REQUEST);
                    assert.equal(res.body.error, 'Bad Request');

                    done();
                });
        });

        /**
         * Get /api/category
         */
        it('[get /api/category] response should be OK', function (done) {
            let url = URL_ROOT+'/api/category';
            superagent
                .get(url)
                .set('Content-Type', 'application/json')
                .end(function (error, res) {
                    //check res
                    assert.equal(res.status, httpStatus.OK);
                    assert.equal(res.body[0].name.vn, testCategoryFirstData.name.vn);

                    done();
                });
        });


        /**
         * Get /api/category/?language=vn
         */
        it('[get /api/category/?language=vn] response should be OK', function (done) {
            let url = URL_ROOT+'/api/category/?language=vn';
            superagent
                .get(url)
                .set('Content-Type', 'application/json')
                .end(function (error, res) {
                    //check res
                    assert.equal(res.status, httpStatus.OK);
                    assert.equal(res.body[0].name.vn, testCategoryFirstData.name.vn);
                    assert.equal(res.body[0].name.jp,undefined);


                    done();
                });
        });

        /**
         * Get /api/category/?language=jp
         */
        it('[get /api/category/?language=jp] response should be OK', function (done) {
            let url = URL_ROOT+'/api/category/?language=jp';
            superagent
                .get(url)
                .set('Content-Type', 'application/json')
                .end(function (error, res) {
                    //check res
                    assert.equal(res.status, httpStatus.OK);
                    assert.equal(res.body[0].name.jp, testCategoryFirstData.name.jp);
                    assert.equal(res.body[0].name.vn,undefined);


                    done();
                });
        });
    }

    //post Api
    {
        /**
         * Post /api/category: Bad Request
         */
        it('[post /api/category/] response should be bad request when post a new category without vn name field', function (done) {
            let testCategory = {
                name:{
                    vnThanh: 'Món chính',
                    jp: 'Main Menu'
                }
            };

            var testCategoryJson = JSON.stringify(testCategory);

            let url = URL_ROOT+'/api/category';
            superagent
                .post(url)
                .set('Content-Type', 'application/json')
                .send(testCategoryJson)
                .end(function (error, res) {
                    //check res
                    assert.equal(res.status, httpStatus.BAD_REQUEST);

                    done();
                });
        });

        /**
         * Duplicate Error
         */
        it('[post /api/category/] response should be conflict when post a new category which is duplicated by vn name', function (done) {
            let testCategory = {
                name:{
                    vn: 'Món chính',
                    jp: 'Main Menu'
                }
            };

            var testCategoryJson = JSON.stringify(testCategory);

            let url = URL_ROOT+'/api/category';
            superagent
                .post(url)
                .set('Content-Type', 'application/json')
                .send(testCategoryJson)
                .end(function (error, res) {
                    //check res
                    assert.equal(res.status, httpStatus.CONFLICT);

                    done();
                });
        });
        /**
         * Post OK
         */
        it('[post /api/category/] response should be created', function (done) {
            let testCategory = {
                name:{
                    vn: 'Trang Mieng',
                    jp: 'デザート'
                }
            };

            var testCategoryJson = JSON.stringify(testCategory);

            let url = URL_ROOT+'/api/category';
            superagent
                .post(url)
                .set('Content-Type', 'application/json')
                .send(testCategoryJson)
                .end(function (error, res) {
                    //check res
                    assert.equal(res.status, httpStatus.CREATED);

                    //check database
                    Category.count({'name.vn': 'Trang Mieng'}, function (error, count) {
                        assert.equal(count, 1);
                        done();
                    });

                });
        });
    }

    //post /api/category/:CategoryID/edit Api
    {
        /**
         * Post /api/category/:CategoryID/edit: OK
         */
        it('[post /api/category/:CategoryID/edit] response should be OK', function (done) {
            let getUrl = URL_ROOT+'/api/category/?language=vn';
            superagent
                .get(getUrl)
                .set('Content-Type', 'application/json')
                .end(function (error, res) {
                    //check res
                    assert.equal(res.status, httpStatus.OK);

                    let editUrl = URL_ROOT+'/api/category/' + res.body[0]._id + '/edit';

                    let updateObject = {
                        name:{
                            vn:'Nuoc Sup'
                        },
                        hide:{
                            vn:true
                        }
                    };
                    //
                    let JsonUpdateObject = JSON.stringify(updateObject);

                    superagent
                        .post(editUrl)
                        .set('Content-Type', 'application/json')
                        .send(JsonUpdateObject)
                        .end(function (err, res) {
                            assert.ifError(error);
                            assert.equal(res.status, httpStatus.OK);

                            //check database
                            Category.count({'name.vn': 'Nuoc Sup'}, function (error, count) {
                                assert.equal(count, 1);

                                Category.count({'hide.vn': false}, function (error, count) {
                                    assert.equal(count, 0);
                                });

                                done();
                            });

                        });
                });
        });
    }
});
