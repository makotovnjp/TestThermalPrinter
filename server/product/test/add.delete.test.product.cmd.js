'use strict';

//database
const mongoose = require('mongoose');
const configDB = require('../../config/database');
const Product = require('./../product.model');
const async = require('async');

let argv = require('yargs')
    .command('create','create products', function (yargs) {
        yargs.options({
            number:{
                demand:true,
                alias:'n',
                description:'number of products goes here',
                type:'string'
            }
        }).help('help');
    })
    .command('delete','delete all products')
    .help('help')
    .argv;

let command = argv._[0];

/**
 * create products for test
 * @param number
 */
function createProduct(number) {
    let basicData = {
        name:{
            vn:'Bánh Mỳ',
            jp:'バンミ'
        },
        category:{
            vn:['Món phụ'],
            jp:['サブメニュー']
        },
        details:{
            shortDescription:
            {
                vn:'Bánh mỳ Ngon',
                jp:'美味しいバンミ'
            },
            description:
            {
                vn:'Mỳ ngon hảo hạng',
                jp:'ベトナムの美味しいパン'
            },
            unit:
            {
                vn:'hộp',
                jp:'箱'
            }
        },
        /**
         * Properties with same value for vietnamese and japanese
         */
        pictures: ['image'],
        thumbnail: 'thumbnail',
        price:210,
        availableQuantity:5
    };

    let testData = {
        name:{
            vn:'Bánh Mỳ',
            jp:'バンミ'
        },
        category:{
            vn:['Món phụ'],
            jp:['サブメニュー']
        },
        details:{
            shortDescription:
            {
                vn:'Bánh mỳ Ngon',
                jp:'美味しいバンミ'
            },
            description:
            {
                vn:'Mỳ ngon hảo hạng',
                jp:'ベトナムの美味しいパン'
            },
            unit:
            {
                vn:'hộp',
                jp:'箱'
            }
        },
        /**
         * Properties with same value for vietnamese and japanese
         */
        pictures: ['image'],
        thumbnail: 'thumbnail',
        price:210,
        availableQuantity:5
    };

    async.times(number, function(n, next) {
        let categoryNo = parseInt(n / 100);
        console.log(categoryNo);
        testData.name.vn = basicData.name.vn + n.toString();
        testData.name.jp = basicData.name.jp + n.toString();

        testData.category.vn[0] = basicData.category.vn[0] + categoryNo.toString();
        testData.category.jp[0] = basicData.category.jp[0] + categoryNo.toString();
        testData.price = basicData.price * (n + 1);

        let product = new Product(testData);

        product.save(function (err) {
            if (err) {
                console.log('Can not create product' + n);
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
function deleteAllProduct(){
    //clear test database
    Product.remove(function (err) {
        if (err) {
            console.log('Product remove error');
            throw err;
        }
    });
}

(function main(){
    mongoose.connect(configDB.url); // connect to our database

    if(command === 'create') {
        createProduct(argv.number);
    }
    else if(command === 'delete'){
        deleteAllProduct();
    } else {
        console.log('Invalid command:' + command);
    }

    console.log('finished');

})();






