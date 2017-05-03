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
 * Define product Schema
 */
const productSchema = new Schema({
    /**
     * Properties with different value for vietnamese and japanese
     */
    name:{
        vn:{type: String, required:true},
        jp:{type: String, default: ''}
    },
    category:{
        vn:[{type: String, default: ''}],
        jp:[{type: String, default: ''}]
    },
    details:{
        shortDescription:
        {
            vn:{type: String, default: ''},
            jp:{type: String, default: ''}
        },
        description:
        {
            vn:{type: String, default: ''},
            jp:{type: String, default: ''}
        },
        unit:
        {
            vn:{type: String, default: ''},
            jp:{type: String, default: ''}
        }
    },
    hide:{
        vn:{type:Boolean, default:false},
        jp:{type:Boolean, default:false}
    },
    /**
     * Properties with same value for vietnamese and japanese
     */
    pictures: [{ type: String,default:''}],
    thumbnail: { type: String,default:''},
    price:{type:Number, default:0},
    availableQuantity:{type:Number, default:0},
    isDisplayedTopPage:{type:Boolean, default:false},
    lastModifiedDate:{type:Date, default:Date.now}
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
module.exports = mongoose.model('Product', productSchema);






