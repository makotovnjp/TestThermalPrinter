/**
 * Created by Dell on 12/6/2016.
 */
var express     = require('express');
//var app         = express();
var morgan      = require('morgan');
var mongoose    = require('mongoose');

var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config/auth'); // get our config file
var User   = require('../users/user.model'); // get our mongoose model
var authenMiddlewares = require('../utilities/authen.middlewares')
var apiRoutes = express.Router();

// middleware use to attach user to req (i.e reg.user); it looks find the tokens, verify it,
// then check with the database to see if there is a user associated with it
// if yes --> attach user, call next()
// if no --> call next()
// version 0.2
// TO DO: review the refactor of  the code, mode the middleware to a single file  for further improvement

apiRoutes.use(authenMiddlewares.checkToken);
//example of protected api
apiRoutes.get('/userProfile', authenMiddlewares.isLoggedIn, function(req, res ) {

    res.json(req.user);
});
//--------------------------------------------------------------------------------------
// route to authenticate a user (POST http://localhost:8080/api/token)
apiRoutes.post('/token', function(req, res) {
    // if the token present, user already has a valid token 
    if (req.isAuthenticated() ){
        res.json({
            success: true,
            message: 'Enjoy your token!',
            access_token: req.token
        });
    } else{
        // find the user
        User.findOne({
            name: req.body.username
        }, function(err, user) {

            if (err) throw err;

            if (!user) {
                res.status(401).json({ success: false, message: 'Authentication failed. User not found. why'});
            } else if (user) {

                // check if password matches
                if (user.password != req.body.password) {
                    res.status(401).json({ success: false, message: 'Authentication failed. Wrong password.' });
                } else {

                    // if user is found and password is right
                    // create a token
                    // only pass object, not a string for jwt.sign first argument
                    var token = jwt.sign({name:user.name}, config.jwsSecret, {
                        expiresIn: 60*60*24// expires in 24 hours
                    });
                    console.log('here');
                    user.token = token;
                    user.save(function(err){
                        if(err){
                            console.log("err: can't update token for user" + err)
                            res.status(500).json({message:'internal error cannot reach database'});
                        }else{
                            // return the information including token as JSON
                            res.json({
                                success: true,
                                message: 'Enjoy your token!',
                                access_token: token


                            });
                        }
                    })
                   
                }

            }

        });
    }

});
apiRoutes.post('/revoke',function(req,res){
    //if invalid token is sent or expire
    if (!req.user){
        if(!req.token){
            res.status(400).send({message:'token is expired or tampered'});
        }else{
            res.status(401).send({status:false ,message:'already log out!'});
        }
    }
    else{
        var user= req.user;
        user.token='';
        user.save(function(err){
            if (err){
                console.log("err: can't update token for user" + err);
                res.status(500).json({message:'internal error cannot reach database'});
            }else{
                res.status(200).send({message:'token revoke successfully!'});
            }

        })
    }

});
//email routes:


// route to show a random message (GET http://localhost:8080/api/)


// route to return all users (GET http://localhost:8080/api/users)


// apply the routes to our application with the prefix /api
//app.use('/api', apiRoutes);
apiRoutes.get('/',function(req,res){
    res.status(200).json({message:'Hello, this is an admin page'});
});
//

module.exports = apiRoutes;