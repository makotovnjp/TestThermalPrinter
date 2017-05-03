'use strict';

//database
const mongoose = require('mongoose');
const configDB = require('../../config/database');
const Order = require('./../order.model');
const async = require('async');

let argv = require('yargs')
    .command('create','create orders', function (yargs) {
        yargs.options({
            number:{
                demand:true,
                alias:'n',
                description:'number of orders goes here',
                type:'string'
            }
        }).help('help');
    })
    .command('delete','delete all orders')
    .help('help')
    .argv;

let command = argv._[0];

/**
 * create products for test
 * @param number
 */
function createOrder(number) {
    let basicData = {
        _id: 'abcd',
        status: 'reserved',
        // Product information
        listProduct: [{
            name: {
                vn: 'Phở',
                jp: 'フォー'
            },
            price: 200,
            quantity: 10
        },
        {
            name: {
                vn: 'Phở',
                jp: 'フォー'
            },
            price: 200,
            quantity: 10
        }
        ],
        // Customer information
        customer: {
            name: 'thanh',
            email: 'makotovnjp@gmail.com',
            tel: '08056152059',
            address: 'Inuyama',
            postOfficeNumber: '84-0086'
        }
    };

    let testData = {
        _id: 'abcd',
        status: 'reserved',
        // Product information
        listProduct: [{
            name: {
                vn: 'Phở',
                jp: 'フォー'
            },
            price: 200,
            quantity: 10
        },
            {
                name: {
                    vn: 'Phở',
                    jp: 'フォー'
                },
                price: 200,
                quantity: 10
            }
        ],
        // Customer information
        customer: {
            name: 'thanh',
            email: 'makotovnjp@gmail.com',
            tel: '08056152059',
            address: 'Inuyama',
            postOfficeNumber: '484-0086'
        }
    };

    async.times(number, function(n, next) {
        testData._id = basicData._id + n.toString();
        let orderTime = new Date();
        orderTime.setDate(orderTime.getDate() -n);
        testData.orderTime = orderTime;

        testData.listProduct[0].name.vn = basicData.listProduct[0].name.vn + n.toString();
        testData.listProduct[0].price = basicData.listProduct[0].price * (n + 1);
        testData.listProduct[0].quantity = basicData.listProduct[0].quantity + (2* n + 1);


        testData.listProduct[1].name.vn = basicData.listProduct[1].name.vn + (5-n).toString();
        testData.listProduct[0].price = basicData.listProduct[0].price * (n + 1);
        testData.listProduct[0].quantity = basicData.listProduct[0].quantity + (20 + 2*n + 1);

        testData.customer.postOfficeNumber = n.toString() +  basicData.customer.postOfficeNumber;


        let order = new Order(testData);

        order.save(function (err) {
            if (err) {
                console.log('Can not create order' + n);
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
function deleteAllOrder(){
    //clear test database
    Order.remove(function (err) {
        if (err) {
            console.log('Order remove error');
            throw err;
        }
    });
}

(function main(){
    mongoose.connect(configDB.url); // connect to our database

    if(command === 'create') {
        createOrder(argv.number);
    }
    else if(command === 'delete'){
        deleteAllOrder();
    } else {
        console.log('Invalid command:' + command);
    }

    console.log('finished');

})();






