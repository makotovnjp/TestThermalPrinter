/**
 * Created by Dell on 12/14/2016.
 */
var mongoose    = require('mongoose');

var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config/auth'); // get our config file
var User   = require('../users/user.model'); // get our mongoose model
var middlewares={};
middlewares.checkToken=function(req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.headers['authorization']||req.body.token || req.query.token || req.headers['x-access-token'];

    req.isAuthenticated= function(){return false};// compatible with passport package

    // decode token
    if (token) {
        // assume token provide with <type> <space> <token> or no token type in the authorization
        token= token.split(' ');
        token= token[token.length-1];
        // verifies secret and checks exp
        jwt.verify(token, config.jwsSecret, function(err, decoded) {
            if (err) {
                console.log({ success: false, message: 'Failed to authenticate token.' });
                // return res.json({ success: false, message: 'Failed to authenticate token.' });
                next();
            } else {
                // if everything is good, save to request for use in other routes
                req.token =token; // a valid token is sent
                User.findOne({token: token})
                    .exec(function(err,user){
                        if (err) throw err;
                        if (!user){
                            console.log('invalid token is submitted');
                            next();
                            //res.status(401).json({ success: false, message: 'invalid token submitted. new login require.' });
                        }else{
                            if(user.token === token){ // only check token by this method
                                console.log('token matched')
                            }else{
                                console.log('token not matched')
                            }
                            req.user=user;
                            req.decoded = decoded;
                            req.isAuthenticated= function(){return true}; // provide similar interface like passport
                            next();
                        }

                    });


            }
        });

    } else {

        // if there is no token
        // return an error
        next();
        /*return res.status(403).send({
         success: false,
         message: 'No token provided.'
         });*/

    }
};
// middleware to check whether a user is authorized/ if not return with status 401
middlewares.isLoggedIn = function (req, res, next) {
        if (req.isAuthenticated()){
            next();
        }else{
            res.status(401).json({success:false, message: 'you are not authorized' });
        }
    };


module.exports = middlewares;
