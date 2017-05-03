'use strict';

/**
 * Module dependencies
 */
const express = require('express');
const status = require('http-status');
const Order = require('./order.model');
const ProductCacheMem = require('./../product/product_cache_memory');
const _ = require('underscore');
const authenConfig = require('../config/auth');

//utilities
const authenMiddlewares = require('./../utilities/authen.middlewares');
var emailUtil = require('./../utilities/emailAPI');

const logger = require('../utilities/logger');
const path = require('path');
const apiParamMng = require('../utilities/api.param.manager');

const router = express.Router();

/**
* Define constant value
*/
const MAX_LIMIT = 100;

const RANDOM_LENGTH = 2;
//not use character (O) and number 0 because they are similar to each other
//not use l because it is similar to 1
const RANDOM_CHARACTER = "abcdefghijkmnopqrstuvwxyzABCDEFGHIJKLMNPQRSTUVWXYZ0123456789";

//params to check query params
const acceptableQueryParams = [
    ['_id'],
    ['response'],
    ['status'],
    ['customer'],
    ['pageNo','ordersByPage'],
    ['startOrderTime','endOrderTime'],
    ['startSentTime','endSentTime'],
    ['startDeliveryTime','endDeliveryTime']
];

//body params for edit
const acceptableEditParams = [
    ['status.vn'],
    ['status.jp'],
    ['comment']
];

//params to make find object
const acceptableFindFields = [
    //find Object field name    //query params
    ['_id',                     '_id'],
    ['status',                  'status'],
    ['customer.name',           'customer.name'],
    ['customer.email',          'customer.email'],
    ['customer.tel',            'customer.tel'],
    ['orderTime',               'startOrderTime','endOrderTime'],
    ['sentTime',                'startSentTime','endSentTime'],
    ['deliveryTime',            'startDeliveryTime','endDeliveryTime']
];

/***************************************************************************
 * private function
 ***************************************************************************/

/**
 * make select object for get api
 * @param queryParams
 * @returns {{}}
 */
function makeSelectObject(queryParams) {
    logger.debugFuncCall(path.basename(__filename), makeSelectObject.name);

    return {};
}

/** Default : sort by order time
 * make sort Object
 * @param queryParams
 */
function makeSortObject(queryParams){
    logger.debugFuncCall(path.basename(__filename), makeSortObject.name);

    let sortObject = {};

    if(queryParams.hasOwnProperty('sortBy') && queryParams.hasOwnProperty('sortWay')){
        if( (queryParams.sortWay === 1) || (queryParams.sortWay === -1) ) {
            sortObject[queryParams.sortBy] = queryParams.sortWay;
        } else {
            sortObject = {
                orderTime: -1
            }
        }
    } else {
        sortObject = {
            orderTime: -1
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

    if(queryParams.hasOwnProperty('ordersByPage')){
        if( (0 < queryParams.ordersByPage ) && (queryParams.ordersByPage < MAX_LIMIT) )
        limitValue = queryParams.ordersByPage
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
            skipValue = limitValue * ( parseInt(queryParams.pageNo) -1);
        }
    }

    return parseInt(skipValue);
}

/**
 * generate order id = RANDOM(1 chu/so) + convert_timestamp + '-' + 'buyerName'
 *
 */
function generateOrderId(convertedOrderedTime, buyerName) {
    logger.debugFuncCall(path.basename(__filename), generateOrderId.name);

    let i;
    let randomCharacter = '';
    let encodeTimeString = '';

    let orderedTimeSplit = convertedOrderedTime.split(':');
    for(i = 0; i < orderedTimeSplit.length; i++) {
        encodeTimeString += RANDOM_CHARACTER[parseInt(orderedTimeSplit[i])];
    }


    for(i =0; i<RANDOM_LENGTH; i++) {
        randomCharacter += RANDOM_CHARACTER[Math.floor(Math.random() * RANDOM_CHARACTER.length)];
    }

    //set orderId
    let orderId = randomCharacter + encodeTimeString + '-' + buyerName.replace(/\s+/g, "");

    logger.debugStdOut(path.basename(__filename), 'orderID: '+ orderId);

    return orderId;
}

/**
 * make order info to create a new order
 * @param requestBody
 * @returns {*}
 */
function makeCreateOrderInfo(requestBody) {
    logger.debugFuncCall(path.basename(__filename), makeCreateOrderInfo.name);

    let orderInfo = {};

    if( (requestBody.hasOwnProperty('listProduct')) &&
        (requestBody.hasOwnProperty('customer'))
    ) {
        if(requestBody.customer.hasOwnProperty('name')) {
            orderInfo = requestBody;

            //make _id
            let now = new Date();
            let convertedOrderedTime =
                (now.getMonth() + 1).toString() + ':'
                + now.getDate().toString() + ':'
                + now.getHours().toString() + ':'
                + now.getMinutes().toString() + ':'
                + now.getSeconds().toString();

            orderInfo._id = generateOrderId(convertedOrderedTime, orderInfo.customer.name);
        }
    }
         // console.log(orderInfo);
    return orderInfo;
}

/*********************************************************************
 * API
 ********************************************************************/
/**
 * create a new order
 */
router.post('/', function (req, res,next) {
    logger.debugStdOut(path.basename(__filename), 'Post Create Api(req.body) ' + JSON.stringify(req.body));

    let orderInfo = makeCreateOrderInfo(req.body);

    logger.debugStdOut(path.basename(__filename), 'orderInfo ' + JSON.stringify(orderInfo));

    if(_.isEmpty(orderInfo)) {
        res.status(status.BAD_REQUEST).json({"error": "Bad Request"});
    } else {
        if(ProductCacheMem.isAvailableToOrder(orderInfo.listProduct) === true) {
            Order.create(orderInfo, function (err, doc) {
                if (err) {
                    if (err.code === 11000) {
                        res.status(status.CONFLICT).json({"error": "same order is existed"});
                        return;
                    } else {
                        next(err);
                        return;
                    }
                }

                //update Product cache memory
                var productNum = orderInfo.listProduct.length;
                var productInfo = {};

                for(var index = 0; index < productNum; index++) {
                    productInfo = {};
                    productInfo._id = doc.listProduct[index]._id;
                    productInfo.quantity = doc.listProduct[index].quantity;
                    ProductCacheMem.updateProductCacheMemory('sub',productInfo);
                }


                res.sendStatus(status.CREATED);
                //console.log(orderInfo);
                if (authenConfig.runningMode== authenConfig.Production){
                    emailUtil.confirmEmail(orderInfo,'contact@bepvietjp.com');
                }////working email integration
            });
        } else {
            res.status(status.CONFLICT).json({"error": "Not available for order"});
        }
    }
});

/**
 * Get order
 * Acceptable query params
 * empty
 * _id
 * pageNo&ordersByPage
 * status
 * startOrderTime & endOrderTime
 * startSentTime & endSentTime
 * startDeliveryTime & endDeliveryTime
 * customer[name], customer[email], customer[tel]
 * /api/product/?response=count
 * paymentMethod
 * deliveryMethod
 */
router.use('/',authenMiddlewares.checkToken);
router.get('/', authenMiddlewares.isLoggedIn, function (req, res, next) {
    logger.debugStdOut(path.basename(__filename), 'getAPI(req.query) ' + JSON.stringify(req.query));

    if(apiParamMng.checkGetQueryParams(req.query, acceptableQueryParams)) {
        if(req.query.hasOwnProperty('response')) {
            if(req.query.response === 'count') {
                Order.count({}, function (err, count) {
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

            let findObject = apiParamMng.makeFindObject(req.query,acceptableFindFields);
            let selectObject = makeSelectObject(req.query);
            let sortObject = makeSortObject(req.query);
            let limitValue = parseInt(getLimitValueToGet(req.query));
            let skipValue = parseInt(getSkipValueToGet(req.query));

            logger.debugStdOut(path.basename(__filename), 'findObject ' + JSON.stringify(findObject));
            logger.debugStdOut(path.basename(__filename), 'selectObject ' + JSON.stringify(selectObject));
            logger.debugStdOut(path.basename(__filename), 'sortObject ' + JSON.stringify(sortObject));
            logger.debugStdOut(path.basename(__filename), 'limitValue ' + limitValue);
            logger.debugStdOut(path.basename(__filename), 'skipValue ' + skipValue);

            Order.find(findObject)
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
                    res.status(status.OK).json(foundItems);
                });
        }

    } else {
        res.status(status.BAD_REQUEST).json({"error": "Bad Request"});
    }
});



/**
 * Update order
 */

router.use('/:orderID/edit',authenMiddlewares.checkToken);
router.post('/:orderID/edit', authenMiddlewares.isLoggedIn, function(req, res, next){
    logger.debugStdOut(path.basename(__filename), 'orderID ' + req.params.orderID);
    logger.debugStdOut(path.basename(__filename), 'req.body ' +  JSON.stringify(req.body));

    logger.stream.write("IP:" + req.connection.remoteAddress + ", edit order id: " + req.params.orderID.toString() + ", edit request:" +JSON.stringify(req.body));

    if(apiParamMng.checkGetQueryParams(req.body, acceptableEditParams)) {
        //order schema has many field so we don't check reg.body here
        Order.findOneAndUpdate({_id: req.params.orderID}, {$set: req.body})
            .exec(function (err) {
                if (err) {
                    next(err);
                    return;
                }

                res.sendStatus(status.OK);
            });
    } else {
        res.status(status.BAD_REQUEST).json({"error": "Bad Request"});
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
