/**
 * Created by Dell on 1/10/2017.
 */
/**
 * Created by Dell on 1/10/2017.
 */
'use strict';

/**
 * Module dependencies
 */
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;

/**
 * Define constant value
 */
const ORDER_STATUS_VN = {
    RESERVED:'Chưa thanh toán',
    CONFIRMED:'Đã thanh toán',
    SENT:'Đã gửi',
    CANCELED:'Hủy',
    RETURN:'Bị trả lại'
};

const ORDER_STATUS_JP = {
    RESERVED:'予約済',
    CONFIRMED:'確認済',
    SENT:'配送済',
    CANCELED:'キャンセル',
    RETURN:'返品'
};

const PAYMENT_METHOD = {
    CASH_ON_DELIVERY: 0,
    CASH_ON_TRANSFER: 1
};

const DELIVERY_OPTIONS = {
    TO_HOME:0
};

const LANGUAGE = {
    VN: 'vn',
    JP: 'jp'
};

/**
 * Define product Schema
 */
const orderSchema = new Schema({
    _id:{type: String, required:true, unique:true}, //customize _id by system
    status: {
        vn: {type: String, default: ORDER_STATUS_VN.RESERVED},
        jp: {type: String, default: ORDER_STATUS_JP.RESERVED}
    },
    // Product information
    listProduct:[{
        _id:Schema.Types.ObjectId,
        name:{
            vn: {type: String, default: ''},
            jp: {type: String, default: ''}
        },
        price:{type:Number, default:0},
        quantity:{type:Number, default:0}
    }],
    // Customer information
    customer:{
        name:{type: String, required:true},
        email: {
            type: String,
            required:true,
            validate: {
                validator: function(emailText) {
                    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(emailText);
                },
                message: 'not a valid e-mail address'
            }
        },
        tel: {
            type: String,
            required:true,
            validate: {
                validator: function(phoneNumber) {
                    return /^[0-9]{10,12}$/.test(phoneNumber);
                },
                message: 'not a valid phone number!'
            }
        },
        address:{type: String, required:true},
        postOfficeNumber:{
            type: String,
            validate: {
                validator: function(officeNumber) {
                    return /^\d{3}-\d{4}$/.test(officeNumber);
                },
                message: 'not a valid office number!'
            }
        }
    },

    //Payment information
    paymentMethod: {
        code:{type:Number, default:PAYMENT_METHOD.CASH_ON_DELIVERY},
        price:{type:Number, default:0},
        name: {
            vn: {type: String, default: ''},
            jp: {type: String, default: ''}
        }
    },

    //Deliver Options
    deliveryOption:{
        code:{type:Number, default:DELIVERY_OPTIONS.TO_HOME},
        price:{type:Number, default:0},
        name: {
            vn: {type: String, default: ''},
            jp: {type: String, default: ''}
        }
    },

    //Additional information
    comment:{type: String, default: ''},
    language:{type: String, default: LANGUAGE.VN},

    //Time information
    orderTime:{type:Date, default:Date.now},
    deliveryTime:{type:Date, default:'1/1/2100'},
    sentTime:{type:Date, default:Date.now}
});

/**
 * Virtual
 */
orderSchema.virtual('totalPrice').get(function(){
    let totalPrice = 0;

    this.listProduct.forEach(function(product) {
        totalPrice += (product.price * product.quantity);
    });

    return totalPrice;
});

/**
 * Validations
 */

/**
 * Index
 */
orderSchema.index({orderTime:-1, sentTime:-1});

orderSchema.set('toObject', { virtuals: true });
orderSchema.set('toJSON', { virtuals: true });
/**
 * create the model and expose it to our app
 */
module.exports = mongoose.model('Order', orderSchema);
module.exports.ORDER_STATUS_VN = ORDER_STATUS_VN;
module.exports.ORDER_STATUS_JP = ORDER_STATUS_JP;
