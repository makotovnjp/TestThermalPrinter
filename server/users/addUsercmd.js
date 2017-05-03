/**
 * Created by Dell on 12/6/2016.
 */
// used to add user by command line
(function(arglist){
    "use strict";
// arglist[0] is node; araglist[1] is filepath, additional arragument from [3]

    var User = require('./user.model');
    var configDB = require('../config/database.js');
    var mongoose    = require('mongoose');
    mongoose.connect(configDB.url); // connect to our database
    if (arglist.length==6){
        //noinspection JSUnresolvedFunction
        var user = {};
        user[arglist[2]]=arglist[3];
        user[arglist[4]]=arglist[5];
        if (user.hasOwnProperty('user')&& user.hasOwnProperty('pwd')){
            console.log('user is sent :' + JSON.stringify(user));
            user = new User({name:user.user,password:user.pwd});
            user.save(function(err){
            if (err){
                console.log('not add to user database');
            } else{
                console.log('successful add user');
            }

        });
        }else{
            console.log('input is not a :' + JSON.stringify(user));
        }
    }else {
        console.log('no extra input');
    }
})(process.argv);