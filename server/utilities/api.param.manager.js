'use strict';

/**
 * Module dependencies
 */
const logger = require('./logger');
const path = require('path');
const _ = require('underscore');

/****  Private function Start ********/
/**
 * Access Nested Object Properties Using a String
 * http://blog.nicohaemhouts.com/2015/08/03/accessing-nested-javascript-objects-with-string-key/
 * @param theObject
 * @param path
 * @param separator
 * @returns {*}
 */
function getNested (theObject, path, separator) {
    try {
        separator = separator || '.';

        return path.
        replace('[', separator).replace(']','').
        split(separator).
        reduce(
            function (obj, property) {
                return obj[property];
            }, theObject
        );

    } catch (err) {
        return undefined;
    }
}
/****  Private function End ********/

/**
 * check get query params for get api
 * @param queryParams
 * @param acceptableQueryParams: acceptable params as array
 *  each value must be array of string
 * @returns {boolean}
 */
function checkGetQueryParams(queryParams, acceptableQueryParams) {
    logger.debugFuncCall(path.basename(__filename), checkGetQueryParams.name);

    let arrayLength = 0;
    let index = 0;
    let memberArrayLength = 0;
    let memberIndex = 0;
    let countMatchedItems = 0;

    if(_.isEmpty(queryParams)) {
        return true;
    } else {
        arrayLength = acceptableQueryParams.length;

        for (index = 0; index < arrayLength; index++) {
            if(acceptableQueryParams[index].constructor === Array) {
                //check for each member
                memberArrayLength = acceptableQueryParams[index].length;
                countMatchedItems = 0;
                for(memberIndex = 0; memberIndex < memberArrayLength; memberIndex++) {
                    if (queryParams.hasOwnProperty(acceptableQueryParams[index][memberIndex])) {
                        countMatchedItems += 1;
                    }
                }

                //validate after finishing of checking member
                if(countMatchedItems === memberArrayLength) {
                    return true;
                }
            } else {
                console.log('get query params are wrong');
                console.log(JSON.stringify(queryParams));
                return false;
            }
        }
    }

    console.log('get query params are wrong');
    console.log(JSON.stringify(queryParams));
    return false;
}

/**
 * make find object for get api
 * @param queryParams
 * @param acceptableFindFields: array of string for acceptable find fields
 * format of acceptableFindFields = [find Object field name list of query params]
 */
function makeFindObject(queryParams, acceptableFindFields) {
    logger.debugFuncCall(path.basename(__filename), makeFindObject.name);

    let findObject = {};
    let arrayLength = acceptableFindFields.length;
    let memberArrayLength = 0;

    for (let index = 0; index < arrayLength; index++) {
        if(acceptableFindFields[index].constructor === Array) {
            //check for each member
            memberArrayLength = acceptableFindFields[index].length;
            
            switch (memberArrayLength) {
                case 2: //to find one field
                    if(getNested(queryParams, acceptableFindFields[index][1])) {
                        findObject[acceptableFindFields[index][0]] = getNested(queryParams, acceptableFindFields[index][1]);
                    }
                    break;
                    
                case 3: //to find range
                    if(queryParams.hasOwnProperty(acceptableFindFields[index][1])
                        && queryParams.hasOwnProperty(acceptableFindFields[index][2]) ) {
                        findObject[acceptableFindFields[index][0]] = {
                            $gte:queryParams[acceptableFindFields[index][1]],
                            $lt:queryParams[acceptableFindFields[index][2]]
                        };
                    }
                    break;
                default:
                    logger.warnStdOut(path.basename(__filename),'not support for memberArrayLength = ' + memberArrayLength);
                    break;
            }
        }
    }

    logger.debugStdOut(path.basename(__filename), 'findObject ' + JSON.stringify(findObject));
    return findObject;
}

module.exports = {
    checkGetQueryParams:checkGetQueryParams,
    makeFindObject:makeFindObject
};