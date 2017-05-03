'use strict';

//database
const mongoose = require('mongoose');
const configDB = require('../../config/database');
const Category = require('./../category.model');
const async = require('async');

let argv = require('yargs')
    .command('create','create categories', function (yargs) {
        yargs.options({
            number:{
                demand:true,
                alias:'n',
                description:'number of categories goes here',
                type:'string'
            }
        }).help('help');
    })
    .command('delete','delete all categories')
    .help('help')
    .argv;

let command = argv._[0];

/**
 * create products for test
 * @param number
 */
function createCategory(number) {
    let basicData = {
        name:{
            vn:'Món ngon ăn kèm',
            jp:'サブメニュー'
        },
        pictures: ['image']
    };

    let testData = {
        name:{
            vn:'Món ngon ăn kèm',
            jp:'サブメニュー'
        },
        pictures: ['image']
    };

    async.times(number, function(n, next) {
        testData.name.vn = basicData.name.vn;
        testData.name.jp = basicData.name.jp;

        let category = new Category(testData);

        category.save(function (err) {
            if (err) {
                console.log('Can not create category' + n);
                next(err);
            }
        });

    }, function(err) {
        console.log('Something is broken' + err.toString());
    });
}

/**
 * Delete all product
 */
function deleteAllCategory(){
    //clear test database
    Category.remove(function (err) {
        if (err) {
            console.log('Product remove error');
            throw err;
        }
    });
}

(function main(){
    mongoose.connect(configDB.url); // connect to our database

    if(command === 'create') {
        createCategory(argv.number);
    }
    else if(command === 'delete'){
        deleteAllCategory();
    } else {
        console.log('Invalid command:' + command);
    }

    console.log('finished');
})();
