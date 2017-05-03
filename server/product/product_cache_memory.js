'use strict';

/**
 * Module dependencies
 */
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird'); //plug in promise library
const Product = require('./product.model');
const Order = require('./../order/order.model');
const async = require('async');

//for logging & debug
const logger = require('../utilities/logger');
const path = require('path');

let productCacheMemory = {}; //key: productID, value: quantity
let productPriceCacheMemory = {}; //key: productID, value: price

function initSubProductCacheMemoryFromOrder(productID, lastModifiedDate, cb) {
    let OrderFindObject = {};
    OrderFindObject['status.vn'] = {
        $ne: Order.ORDER_STATUS_VN.CANCELED
    };
    OrderFindObject['status.jp'] = {
        $ne: Order.ORDER_STATUS_JP.CANCELED
    };

    //search Oder from lastModifiedDate to now
    OrderFindObject.orderTime = {
        $gte:lastModifiedDate,
        $lt:Date.now()
    };

    let order;
    let product;

    Order.find(OrderFindObject).exec(function (err, orders) {
        if(err) {
            logger.debugError(path.basename(__filename), err);
            cb(err);
            return;
        }

        for(let indexOrder = 0; indexOrder < orders.length; indexOrder++) {
            order = orders[indexOrder];

            for(let indexListProduct = 0; indexListProduct < order.listProduct.length; indexListProduct++) {
                product = order.listProduct[indexListProduct];
                if(product._id.toString() === productID.toString()) {
                    productCacheMemory[productID] -= product.quantity;
                }
            }
        }

        cb(null);

    })
}

/**
 * Init productCacheMemory
 * @param cb
 */
function initProductCacheMemory(cb) {
    logger.debugFuncCall(path.basename(__filename), initProductCacheMemory.name);
    let findObject = {};
    findObject['hide.vn'] = false;
    findObject['hide.jp'] = false;

    let indexProduct;

    Product.find(findObject).exec(function (err, products) {
        if(err) {
            logger.debugError(path.basename(__filename), err);
            cb(err);
            return;
        }

        for(indexProduct = 0; indexProduct < products.length; indexProduct++) {
            productCacheMemory[products[indexProduct]._id] = products[indexProduct].availableQuantity;
            productPriceCacheMemory[products[indexProduct]._id] = products[indexProduct].price;
        }

        async.times(products.length, function (indexProduct, next) {
            initSubProductCacheMemoryFromOrder(products[indexProduct]._id,products[indexProduct].lastModifiedDate, function (err) {
                if(err) {
                    cb(err);
                }
                next();
            });
        }, function(err) {
            if(err) {
                cb(err);
            } else {
                logger.debugStdOut(path.basename(__filename), 'productCacheMemory: '+ JSON.stringify(productCacheMemory));
                logger.debugStdOut(path.basename(__filename), 'productPriceCacheMemory: '+ JSON.stringify(productPriceCacheMemory));
                cb(null);

            }
        });

    });
}

/**
 * check available to post order
 * @param listProducts
 * @returns {boolean}
 */
function isAvailableToOrder(listProducts){
    for(let index = 0; index < listProducts.length; index++) {
        if(productCacheMemory.hasOwnProperty(listProducts[index]._id)) {
            if( (productCacheMemory[listProducts[index]._id] < listProducts[index].quantity) ||
                (productPriceCacheMemory[listProducts[index]._id] != listProducts[index].price)
            ) {
                return false;
            }
        } else {
            return false;
        }
    }

    return true;
}

/**
 * Get value of cache memory
 * @param id
 * @returns {*}
 */
function  getProductCacheMemory(id) {
    return productCacheMemory[id];
}

/**
 * Update Cache Memory
 * @param cmd
 * @param productInfo
 */
function updateProductCacheMemory(cmd, productInfo) {
    switch(cmd) {
        case 'changeQuantity': //when post new order
                productCacheMemory[productInfo._id] = productInfo.availableQuantity;
            break;

        case 'add': //when cancel order
            productCacheMemory[productInfo._id] += productInfo.quantity;
            break;

        case 'sub': //when post new order
            if(productCacheMemory[productInfo._id] >= productInfo.quantity) {
                productCacheMemory[productInfo._id] -= productInfo.quantity;
            }
            break;

        case 'delete': //when hide product
            delete productCacheMemory[productInfo._id];
            break;

        default:
            break;
    }

    logger.debugStdOut(path.basename(__filename), 'productCacheMemory: '+ JSON.stringify(productCacheMemory));
}

/**
 * update productPriceCacheMemory
 * @param cmd
 * @param info (has _id and price property)
 */
function updateProductPriceCacheMemory(cmd, info) {
    switch(cmd) {
        case 'createNewProduct': //when post new product
        case 'changePrice': //when edit price of product
            productPriceCacheMemory[info._id] = info.price;
            break;

        case 'delete': //when hide product
            delete productPriceCacheMemory[info._id];
            break;

        default:
            break;
    }

    logger.debugStdOut(path.basename(__filename), 'productPriceCacheMemory: '+ JSON.stringify(productPriceCacheMemory));
}

module.exports = {
    initProductCacheMemory,
    isAvailableToOrder,
    updateProductCacheMemory,
    getProductCacheMemory,
    updateProductPriceCacheMemory
};