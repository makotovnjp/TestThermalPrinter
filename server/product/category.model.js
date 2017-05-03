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
mongoose.Promise = require('bluebird'); //avoid warning when starts server

const Schema = mongoose.Schema;

/**
 * Define product Schema
 */
const categorySchema = new Schema({
    /**
     * Properties with different value for vietnamese and japanese
     */
    name:{
        vn: {type: String, unique: true, required:true},
        jp: {type: String, default: ''}
    },
    hide:{
        vn:{type:Boolean, default:false},
        jp:{type:Boolean, default:false}
    },

    /**
     * Properties with same value for vietnamese and japanese
     */
    picture:{type:String},
    modifiedData:{type:Date, default:Date.now}
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
module.exports = mongoose.model('Category', categorySchema);






