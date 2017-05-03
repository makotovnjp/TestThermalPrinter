'use strict';

/**
 * Module dependencies
 */
const express = require('express');
const status = require('http-status');
const Category = require('./category.model');
const _ = require('underscore');

//utilities
const authenMiddlewares = require('./../utilities/authen.middlewares');

const logger = require('../utilities/logger');
const path = require('path');
const paramChecker = require('../utilities/api.param.manager');

const router = express.Router();

/**
 * Constant Value
 */
const acceptableQueryParams = [
    ['language']
];

//Private Function

/**
 * Make Category information to create a new category document
 * @param requestBody
 * @returns {{}}
 */
function makeCreateCategoryInfo(requestBody) {
    let categoryInfo = {};

    //check required fields
    if(requestBody.hasOwnProperty('name')) {
        if (requestBody.name.hasOwnProperty('vn')) {
            categoryInfo.name = {};
            categoryInfo.name.vn = requestBody.name.vn.replace(/^\s+|\s+$/g, "");

            //add info for not required fields
            if (requestBody.name.hasOwnProperty('jp')) {
                categoryInfo.name.jp = requestBody.name.jp.replace(/^\s+|\s+$/g, "");
            }

            if (requestBody.hasOwnProperty('picture')) {
                categoryInfo.picture = requestBody.picture;
            }
        }
    }

    return categoryInfo;
}

//define Api
/**
 * Get api
 * 1. Lấy toàn bộ category: /api/category/
 * 2. Lấy category theo ngôn ngữ: /api/category/?language=value
 *   acceptable language value: vn, jp
 */
router.get('/', function (req, res, next) {
    logger.debugStdOut(path.basename(__filename), 'req.query ' + JSON.stringify(req.query));

    if(paramChecker.checkGetQueryParams(req.query, acceptableQueryParams)) {
        let selectObject = {};
        let findObject = {};

        //Set selectObject
        selectObject.picture = 1;
        if(req.query['language'] === 'vn') {
            selectObject['name.vn'] = 1;
            findObject['hide.vn'] = false;
        } else if(req.query['language'] === 'jp') {
            selectObject['name.jp'] = 1;
            findObject['hide.jp'] = false;
        } else {
            selectObject['name.vn'] = 1;
            selectObject['name.jp'] = 1;
            findObject['hide.vn'] = false;
            findObject['hide.jp'] = false;
        }

        Category.find(findObject).select(selectObject).exec(function(err, foundItems) {
            if(err) {
                next(err);
                return;
            }
            logger.debugStdOut(path.basename(__filename), 'foundItems ' + foundItems);
            res.status(status.OK).json(foundItems);
        });
    } else {
        res.status(status.BAD_REQUEST).json({"error": "Bad Request"});
    }
});

/**
 * Post Api: Tạo Category Mới
 */
router.use('/',authenMiddlewares.checkToken);
router.post('/', authenMiddlewares.isLoggedIn, function (req, res, next) {
    logger.debugStdOut(path.basename(__filename), 'req.body ' + JSON.stringify(req.body));

    let categoryInfo = makeCreateCategoryInfo(req.body);
    logger.debugStdOut(path.basename(__filename), 'categoryInfo ' + JSON.stringify(categoryInfo));

    if(_.isEmpty(categoryInfo)) {
        res.status(status.BAD_REQUEST).json({"error": "Bad Request"});
    } else {
        Category.create(categoryInfo, function (err)  {
            if(err) {
                if(err.code === 11000) {
                    res.status(status.CONFLICT).json({"error": "Category is existed"});
                    return;
                } else {
                    next(err);
                    return;
                }
            }
            res.sendStatus(status.CREATED);
        });
    }
});

/**
 * Update Category
 * Acceptable update field: vnname, jpname, hide, picture
 */
router.use('/:categoryID/edit',authenMiddlewares.checkToken);
router.post('/:categoryID/edit', authenMiddlewares.isLoggedIn, function(req, res, next) {
    logger.debugStdOut(path.basename(__filename), 'categoryID ' + req.params.categoryID);
    logger.debugStdOut(path.basename(__filename), 'req.body ' +  JSON.stringify(req.body));


    let updateObject = {};

    if(req.body.hasOwnProperty('name')) {
        updateObject.name = {};

        if(req.body.name.hasOwnProperty('vn')) {
            updateObject.name.vn = req.body.name.vn;
        }

        if(req.body.name.hasOwnProperty('jp')) {
            updateObject.name.jp = req.body.name.jp;
        }
    }

    if(req.body.hasOwnProperty('hide')) {
        updateObject.hide = {};
        if(req.body.hide.hasOwnProperty('vn') === true) {
            if(req.body.hide.vn === true) {
                updateObject.hide.vn = true;
            }
        }

        if(req.body.hide.hasOwnProperty('jp') === true) {
            if(req.body.hide.jp === true) {
                updateObject.hide.jp = true;
            }
        }
    }

    if(req.body.hasOwnProperty('picture')) {
        updateObject.picture = req.body.picture;
    }

    if(_.isEmpty(updateObject)) {
        res.status(status.BAD_REQUEST).json({"error": "Bad Request"});
    } else {

        logger.debugStdOut(path.basename(__filename), 'updateObject ' + JSON.stringify(updateObject));

        Category.findOneAndUpdate({_id:req.params.categoryID}, {$set:updateObject}).exec( function (err) {
            if(err) {
                next(err);
                return;
            }
            res.sendStatus(status.OK);
        });
    }
});


/**
 * Errors
 */
router.use(function(err, req, res, next) {
    // Format error and forward to generic error handler for logging and
    // responding to the request
    err.response = err.message;
    next(err);
});

//Router function End
module.exports = router;




