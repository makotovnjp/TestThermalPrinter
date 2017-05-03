'use strict';

/**
 * Module dependencies
 */
const winston = require('winston');
const expressWinston = require('express-winston');
const fs = require('fs');
winston.emitErrs = true;
/**
 * Define Constant value
 */
let logFileDirectory = __dirname.replace('utilities','');
logFileDirectory += 'log';
let logFilePath = logFileDirectory + '/log-all.log';

/**
 * Config logger
 */
var logger = new winston.Logger({
    transports: [
        new winston.transports.File({
            level: 'info',
            filename: logFilePath,
            handleExceptions: true,
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false
        }),
        new winston.transports.Console({
            //set level debug when development
            //set level warn for production
            level: 'warn',
            handleExceptions: true,
            json: false,
            colorize: true
        })
    ],
    exitOnError: false
});

// Logger to capture any top-level errors and output json diagnostic info.
const errorLogger = expressWinston.errorLogger({
    transports: [
        new winston.transports.Console({
            json: true,
            colorize: true
        })
    ]
});

//private function

/**
 * debug value
 * @param filename
 * @param msg
 */
function debugStdOut(filename,msg) {
    logger.debug('file(' + filename + '): ' + msg);
}

/**
 * debug value
 * @param filename
 * @param msg
 */
function warnStdOut(filename,msg) {
    logger.warn('file(' + filename + '): ' + msg);
}

/**
 * debug function call
 * @param filename
 * @param functionName
 */
function debugFuncCall(filename, functionName) {
    logger.debug('file(' + filename + '): ' + functionName + ' called');
}

function debugError(filename,msg) {
    logger.error('file(' + filename + '): ' + msg);
}

module.exports = {
    errorLogger: errorLogger,
    debugStdOut,
    debugFuncCall,
    debugError,
    warnStdOut,
    stream:{
        write: function(message){
            if (!fs.existsSync(logFileDirectory)){
                fs.mkdirSync(logFileDirectory);
            }

            if(fs.existsSync(logFilePath) === false) {
                fs.writeFile(logFilePath, '', function (err) {
                    if (err) throw err;
                    logger.info(message);
                });
            } else {
                logger.info(message);
            }
        }
    }
};