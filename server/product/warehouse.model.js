/**
 * Created by Dell on 1/10/2017.
 */
'use strict';

/**
 * Module dependencies
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * Define product Schema
 */
const warehouseSchema = new Schema({
    /**
     * Properties with different value for vietnamese and japanese
     */
    vnProductName: {type: String, default: '', required:true},
    jpProductName: {type: String, default: ''},

    /**
     * Properties with same value for vietnamese and japanese
     */
    expiration: { type: Date, default:Date.now},
    comment:{type: String, default: ''},
    quantity:{type:Number, default:0},
    hide:{type:Boolean, default:false},
    log:[{
        timeStamp:{type:Date, default:Date.now},
        quantity:{type:Number, default:0},
        method:{type: String, default: ''}
    }]
});

/**
 * Virtual
 */

/**
 * Validations
 */

/**
 * create the model and expose it to our app
 */
module.exports = mongoose.model('Warehouse', warehouseSchema);






