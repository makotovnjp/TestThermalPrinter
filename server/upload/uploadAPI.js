/**
 * Created by Dell on 2/16/2017.
 */
var express = require('express');
var app = express.Router();
var multer = require('multer');
const status = require('http-status');

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, '../client/images/uploads/') //'reference from the mainServerfile'
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '_' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    }
});
var upload = multer({ //multer settings
    storage: storage
}).single('file');
/** API path that will upload the files */
app.post('/upload', function(req, res) {
    upload(req,res,function(err){
        if(err){
            res.status(status.NOT_ACCEPTABLE).json({msg:"can't upload to the server"});
            return;
        }
        res.status(status.OK).json({msg:'/images/uploads/'+req.file.filename});
    })
});
module.exports = app;