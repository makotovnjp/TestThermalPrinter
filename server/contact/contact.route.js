var express     = require('express');
var nodemailer = require("nodemailer");
var mail = nodemailer.createTransport();// work with new version on server
var apiRoutes = express.Router();

apiRoutes.post('/sendmail',function (req,res) {
    if (req.body.message){
        var msg= req.body.message;
        if (msg.subject&&msg.senderName&&msg.senderEmail&&msg.body){
            mail.sendMail({
                from: msg.senderEmail, // sender address
                to: "contact@bepvietjp.com", // list of receivers
                subject: msg.subject, // Subject line
                //text: "Hello world ✔", // plaintext body
                html: "<b>"+msg.body+"</b>" +"<br>"+"<p>From:"+ msg.senderName +"</p>" // html body
            },  function(error, info){
                if(error){
                    return console.log(error);
                }
                console.log('Message sent: ' + info.response);
            });
            res.json({ success: true, message: ' message is received properly'});
        }else{
            res.json({ success: false, message: 'not receive proper object'});
        }

        //console.log(JSON.stringify(req.body.message));


    } else{
        res.json({ success: false, message: 'not receive proper object'});
    }


});
module.exports = apiRoutes;