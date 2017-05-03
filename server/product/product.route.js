'use strict';

/**
 * Module dependencies
 */
const express = require('express');
const status = require('http-status');
const Product = require('./product.model');
const ProductCacheMem = require('./product_cache_memory');
const _ = require('underscore');

//utilities
const authenMiddlewares = require('./../utilities/authen.middlewares');
const logger = require('../utilities/logger');
const path = require('path');
const paramChecker = require('../utilities/api.param.manager');

const router = express.Router();

/**
 * Define constant value
 */
const MAX_LIMIT = 100;
const acceptableQueryParams = [
    ['_id'],
    ['response'],
    ['language'],
    ['name'],
    ['category']
];

/***************************************************************************
 * private function
 ***************************************************************************/

/**
 * Make Product information from request body
 * @param requestBody
 * @returns {{}}
 */
function makeCreateProductInfo(requestBody) {
    logger.debugFuncCall(path.basename(__filename), makeCreateProductInfo.name);

    let productInfo = {};

    //check required fields
    if(requestBody.hasOwnProperty('name')) {
        if(requestBody.name.hasOwnProperty('vn')) {
            productInfo.name = requestBody.name;

            //category
            if(requestBody.hasOwnProperty('category')) {
                productInfo.category = requestBody.category;
            }

            //details
            if(requestBody.hasOwnProperty('details')) {
                productInfo.details = requestBody.details;
            }

            //pictures
            if(requestBody.hasOwnProperty('pictures')) {
                productInfo.pictures = requestBody.pictures;
            }

            //thumbnail
            if(requestBody.hasOwnProperty('thumbnail')) {
                productInfo.thumbnail = requestBody.thumbnail;
            }

            //thumbnail
            if(requestBody.hasOwnProperty('price')) {
                productInfo.price = requestBody.price;
            }

            //availableQuantity
            if(requestBody.hasOwnProperty('availableQuantity')) {
                productInfo.availableQuantity = requestBody.availableQuantity;
            }

            //availableQuantity
            if(requestBody.hasOwnProperty('isDisplayedTopPage')) {
                productInfo.isDisplayedTopPage = requestBody.isDisplayedTopPage;
            }

            //lastModifiedDate
            if(requestBody.hasOwnProperty('lastModifiedDate')) {
                productInfo.lastModifiedDate = requestBody.lastModifiedDate;
            }
        }
    }

    return productInfo;
}

/**
 * make Find object for get api
 * @param queryParams
 * @returns {{}}
 */
function makeFindObject(queryParams) {
    logger.debugFuncCall(path.basename(__filename), makeFindObject.name);

    let findObject = {};

    //hide property
    if(queryParams.hasOwnProperty('language')) {
        if (queryParams.language === 'vn') {
            findObject['hide.vn'] = false;
        }
        else if(queryParams.language === 'jp') {
            findObject['hide.jp'] = false;
        } else {
            findObject['hide.vn'] = false;
            findObject['hide.jp'] = false;
        }
    }

    //_id property
    if(queryParams.hasOwnProperty('_id')) {
        findObject._id = queryParams._id;
    }

    //name property
    if(queryParams.hasOwnProperty('name.vn')) {
        findObject['name.vn'] = queryParams.name.vn;
    }
    if(queryParams.hasOwnProperty('name.jp')) {
        findObject['name.jp'] = queryParams.name.jp;
    }

    //category property
    if(queryParams.hasOwnProperty('category.vn')) {
        findObject['category.vn'] = queryParams.category.vn;
    }
    if(queryParams.hasOwnProperty('category.jp')) {
        findObject['category.jp'] = queryParams.category.jp;
    }


    return findObject;
}

/**
 * make select object for get api
 * @param queryParams
 * @returns {{}}
 */
function makeSelectObject(queryParams) {
    let selectObject = {};

    //default
    selectObject.pictures = 1;
    selectObject.thumbnail = 1;
    selectObject.price = 1;
    selectObject.availableQuantity = 1;
    selectObject.isDisplayedTopPage = 1;

    if(queryParams.hasOwnProperty('language')) {
        if (queryParams.language === 'vn') {
            selectObject['name.vn'] = 1;
            selectObject['category.vn'] = 1;
            selectObject['details.shortDescription.vn'] = 1;
            selectObject['details.description.vn'] = 1;
            selectObject['details.unit.vn'] = 1;
        }

        if(queryParams.language === 'jp') {
            selectObject['name.jp'] = 1;
            selectObject['category.jp'] = 1;
            selectObject['details.shortDescription.jp'] = 1;
            selectObject['details.description.jp'] = 1;
            selectObject['details.unit.jp'] = 1;
        }
    } else {
        selectObject['name.vn'] = 1;
        selectObject['category.vn'] = 1;
        selectObject['details.shortDescription.vn'] = 1;
        selectObject['details.description.vn'] = 1;
        selectObject['details.unit.vn'] = 1;

        selectObject['name.jp'] = 1;
        selectObject['category.jp'] = 1;
        selectObject['details.shortDescription.jp'] = 1;
        selectObject['details.description.jp'] = 1;
        selectObject['details.unit.jp'] = 1;
    }

    return selectObject;
}

/** Default : sort by categoryName
 * make sort Object
 * @param queryParams
 */
function makeSortObject(queryParams) {
    logger.debugFuncCall(path.basename(__filename), makeSortObject.name);

    let sortObject = {};

    if(queryParams.hasOwnProperty('sortBy') && queryParams.hasOwnProperty('sortWay')){
        if( (queryParams.sortWay === 1) || (queryParams.sortWay === -1) ) {
            sortObject[queryParams.sortBy] = queryParams.sortWay;
        } else {
            sortObject = {
                'category.vn': 1
            }
        }
    } else {
        sortObject = {
            'category.vn': 1
        }
    }

    return sortObject;
}

/**
 * get Limit value to find database
 * @param queryParams
 */
function getLimitValueToGet(queryParams) {
    logger.debugFuncCall(path.basename(__filename), getLimitValueToGet.name);

    let limitValue = MAX_LIMIT;

    if(queryParams.hasOwnProperty('productsByPage')){
        if( (0 < queryParams.productsByPage ) && (queryParams.productsByPage < MAX_LIMIT) )
            limitValue = queryParams.productsByPage
    }

    return parseInt(limitValue);
}

/**
 * get skip value to find database
 * @param queryParams
 */
function getSkipValueToGet(queryParams){
    logger.debugFuncCall(path.basename(__filename), getSkipValueToGet.name);

    let skipValue = 0;

    let limitValue = getLimitValueToGet(queryParams);

    if(limitValue < MAX_LIMIT) {
        if(queryParams.hasOwnProperty('pageNo')){
            skipValue = limitValue * ( parseInt(queryParams.pageNo) - 1);
        }
    }

    return parseInt(skipValue);
}

/*********************************************************************
 * API
 ********************************************************************/

/**
 * Get Product
 * Acceptable api
 * /api/product/?language=vn/jp
 * /api/product/?_id = value
 * /api/product/?name[vn/jp] = ??
 * /api/product/?response=count
 * Có thể dùng & để nối các query với nhau
 */
router.get('/', function (req, res, next) {
    logger.debugStdOut(path.basename(__filename), 'req.query ' + JSON.stringify(req.query));

    if(paramChecker.checkGetQueryParams(req.query, acceptableQueryParams)) {
        if(req.query.hasOwnProperty('response')) {
            if(req.query.response === 'count') {
                Product.count({}, function (err, count) {
                    if (err) {
                        next(err);
                        return;
                    }
                    res.status(status.OK).json({count:count});
                });
            } else {
                res.status(status.BAD_REQUEST).json({"error": "Bad Request"});
            }
        } else {

            let findObject = makeFindObject(req.query);
            let selectObject = makeSelectObject(req.query);
            let sortObject = makeSortObject(req.query);
            let limitValue = parseInt(getLimitValueToGet(req.query));
            let skipValue = parseInt(getSkipValueToGet(req.query));

            logger.debugStdOut(path.basename(__filename), 'findObject ' + JSON.stringify(findObject));
            logger.debugStdOut(path.basename(__filename), 'selectObject ' + JSON.stringify(selectObject));
            logger.debugStdOut(path.basename(__filename), 'sortObject ' + JSON.stringify(sortObject));
            logger.debugStdOut(path.basename(__filename), 'limitValue ' + limitValue);
            logger.debugStdOut(path.basename(__filename), 'skipValue ' + skipValue);

            Product.find(findObject)
                .select(selectObject)
                .limit(limitValue)
                .skip(skipValue)
                .sort(sortObject)
                .exec(function (err, foundItems) {
                    if (err) {
                        next(err);
                        return;
                    }
                    logger.debugStdOut(path.basename(__filename), 'foundItems ' + foundItems);
                
                    //use cache memory for quantity
                    for(var index = 0; index <foundItems.length; index++) {
                        foundItems[index].availableQuantity = ProductCacheMem.getProductCacheMemory(foundItems[index]._id);
                    }
                    res.status(status.OK).json(foundItems);
            });
        }
    } else {
        res.status(status.BAD_REQUEST).json({"error": "Bad Request"});
    }

});

/**
 * Create a product (This api is used for hachi-x admin)
 */
router.use('/',authenMiddlewares.checkToken);
router.post('/', authenMiddlewares.isLoggedIn, function (req, res,next) {
    logger.debugStdOut(path.basename(__filename), 'req.body ' + JSON.stringify(req.body));

    logger.stream.write("IP:" + req.connection.remoteAddress + ",post new product: " + JSON.stringify(req.body));

    let productInfo = makeCreateProductInfo(req.body);
    logger.debugStdOut(path.basename(__filename), 'productInfo ' + JSON.stringify(productInfo));
    
    if(_.isEmpty(productInfo)) {
        res.status(status.BAD_REQUEST).json({"error": "Bad Request"});
    } else {
        Product.create(productInfo, function (err, createdProduct) {
            if(err) {
                if(err.code === 11000) {
                    res.status(status.CONFLICT).json({"error": "product is existed"});
                } else {
                    next(err);
                }
                return;
            }

            //update productCacheMem
            productInfo._id = createdProduct._id;
            ProductCacheMem.updateProductCacheMemory('changeQuantity',productInfo);

            //update productPriceCacheMem
            ProductCacheMem.updateProductPriceCacheMemory('createNewProduct',productInfo);

            res.status(status.CREATED).json(createdProduct);
        });
    }

});

/**
 * Update product
 */
router.use('/:productID/edit',authenMiddlewares.checkToken);
router.post('/:productID/edit', authenMiddlewares.isLoggedIn, function(req, res, next){
    logger.debugStdOut(path.basename(__filename), 'productID ' + req.params.productID);
    logger.debugStdOut(path.basename(__filename), 'req.body ' +  JSON.stringify(req.body));

    logger.stream.write("IP:" + req.connection.remoteAddress + ",edit product id: " + req.params.productID.toString() + ", edit request:" +JSON.stringify(req.body));

    if(req.body.hasOwnProperty('availableQuantity')) {
        //when update available Quantity, update also lastModifiedDate
        req.body.lastModifiedDate = Date.now();
    }

    //product schema has many field so we don't check reg.body here
    Product.findOneAndUpdate({_id:req.params.productID}, {$set:req.body})
        .exec(function (err) {
            if(err) {
                next(err);
                return;
            }

            //update productCacheMem
            if(req.body.hasOwnProperty('availableQuantity')) {
                let productInfo = {};
                productInfo._id = req.params.productID;
                productInfo.availableQuantity = req.body.availableQuantity;
                ProductCacheMem.updateProductCacheMemory('changeQuantity',productInfo);
            }

            //update productPriceCacheMem
            if(req.body.hasOwnProperty('price')) {
                let priceInfo = {};
                priceInfo._id = req.params.productID;
                priceInfo.price = req.body.price;
                ProductCacheMem.updateProductPriceCacheMemory('changePrice',priceInfo);
            }

            //when hide product
            if(req.body.hasOwnProperty('hide')) {
                if(req.body.hide) {
                    let productInfo = {};
                    productInfo._id = req.params.productID;
                    ProductCacheMem.updateProductCacheMemory('delete', productInfo);
                    ProductCacheMem.updateProductPriceCacheMemory('delete', productInfo);
                }
            }

            res.sendStatus(status.OK);
        });
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

module.exports = router;
