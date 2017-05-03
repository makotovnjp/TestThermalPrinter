/**
 * Created by Dell on 1/24/2017.
 */
//utilities function for email transaction for this particular product
var config = require('../config/email_keys');
var sg = require('sendgrid')(config.sendGridKey);
var util={};
/**
 * 
 * @param order
 * @param bcc_mail
 */
util.confirmEmail= function(orderInfor,bcc_mail){
    /* this function expected to call when a order is reserved*/
    if (!orderInfor){
        return
    }
    //initialize bcc_email with empty string if not defined
     bcc_mail =bcc_mail||"jankoller888@outlook.com";
    var requestObj={
        method: 'POST',
        path: '/v3/mail/send',
        body: {
            personalizations: [
                {
                    bcc:[
                        {
                            email: bcc_mail,
                        },
                    ],
                    to: [
                        {
                            email: orderInfor.customer.email,
                        },

                    ],
                    'substitutions': {
                        '-totalcost-': util.totalcost(orderInfor).toString(),
                        '-codename-': orderInfor._id.split('-')[0],
                    },
                    subject: 'Đơn đặt hàng#'+ orderInfor._id+'#đã xác lập.Your order is reserved',
                },
            ],
            from: {
                email: 'no-reply@bepvietjp.com',
            },
            content: [
                {
                    type: 'text/html',
                    value: util.prepareOrderList(orderInfor),
                },
            ],
            'template_id': config.bepvietTemplateID,
        },
    };

    if (bcc_mail==orderInfor.customer.email){
        delete requestObj.body.personalizations[0].bcc;
    }
    var request = sg.emptyRequest(requestObj);

    sg.API(request, function(error, response) {
        if (error) {
            console.log('send_email: Error response received');
        }
            console.log(response.statusCode);

    });


};
/**
 *
 * @param order
 * @param bcc_email
 * todo: fix this complete email
 * not work for this project
 */
util.completeEmail= function (order,bcc_email) {
    /* this function expected to call when a order is completed, payment received*/
    if (!order) //order.status !=="done" )
        return;
    //initialize bcc_email with empty string if not defined
    bcc_email =bcc_email||"jankoller888@outlook.com";
    var requestObj={
        method: 'POST',
        path: '/v3/mail/send',
        body: {
            personalizations: [
                {
                    bcc:[
                        {
                            email: bcc_email,
                        },
                    ],
                    to: [

                        {
                            email: order.email,
                        },
                    ],
                    'substitutions': {
                        '-codename-': order._id.split('-')[0],
                    },
                    subject: 'Đơn đặt vé#'+ order._id+'#đã thanh toán.',
                },
            ],
            from: {
                email: 'no-reply@thegioiamnhacjp.com',
            },
            content: [
                {
                    type: 'text/html',
                    value: util.perapareTicketforCode(order.tickets),
                },
            ],
            'template_id': config.completeTemplateID,
        },
    };
    if (bcc_email==order.email){
        delete requestObj.body.personalizations[0].bcc;
    }
    var request = sg.emptyRequest(requestObj);
    sg.API(request, function(error, response) {
        if (error) {
            console.log('Error sending email received');
        }
            console.log(response.statusCode);
    });
};
/**
 *
 * @param contactObj
 * @param receivedEmail
 */
util.contactEmail= function(contactObj,receivedEmail){
    if (!contactObj) //order.status !=="done" )
        return;
    //initialize bcc_email with empty string if not defined
    receivedEmail =receivedEmail||"jankoller888@outlook.com";
    var requestObj={
        method: 'POST',
        path: '/v3/mail/send',
        body: {
            personalizations: [
                {
                    to: [

                        {
                            email: receivedEmail,
                        },
                    ],
                    subject: contactObj.subject,
                },
            ],
            from: {
                email: contactObj.senderEmail,
            },
            content: [
                {
                    type: 'text/html',
                    value: '<div>'+contactObj.body+ '</div>',
                },
            ],
            'template_id': config.contactTemplateID,
        },
    };

    var request = sg.emptyRequest(requestObj);
    sg.API(request, function(error, response) {
        if (error) {
            console.log('Error sending email received');
        }
        console.log(response.statusCode);
    });

};

util.prepareOrderList= function(orderInfor){
    var content='<ol type="1">';
    var  products=orderInfor.listProduct;
    var namevn='';
    var namejp='';
    for (var i = 0; i < products.length; i++) {
        if (products[i].name.hasOwnProperty('vn')){
            namevn=  products[i].name.vn;
        }else{
            namevn='';
        }
        if (products[i].name.hasOwnProperty('jp')){
            namejp=  products[i].name.jp;
        }else{
            namejp='';
        }
        content+='<li>' + namevn+' |' + namejp +  '<br>'+  '¥'+ products[i].price+'x'+products[i].quantity + '</li>';
    }
        content+='<li>' +'Phí khác (その他の費用)'+ '<br>'+ '+¥'+orderInfor.paymentMethod.price+ '</li>';
    content+='</ol>';
    return content;
};
util.totalcost= function(orderInfor){
    var total =0;
    var  products=orderInfor.listProduct;
    for (var i = products.length - 1; i >= 0; i--) {
        total += products[i].price;
    };
    total +=orderInfor.paymentMethod.price;
    return total;
};
util.perapareTicketforCode=function(tickets){
    var content='<ol type="1">'
    for (var i = 0; i < tickets.length; i++) {
        content+='<li> Số Ghế: ' + tickets[i]._id + ',  Mã số Vé(ticket_ID)#: '+'<strong>'+ tickets[i].code + '</strong>'+
            ', Khán Giả sở hữu: '+ tickets[i].owner + '</li>';
    };
    content+='</ol>';
    return content;
};
module.exports=util;