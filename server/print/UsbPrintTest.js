//const escpos = require('escpos');
const escpos = require('./../lib/escpos');

// Select the adapter based on your printer type
//const device  = new escpos.USB();
// const device  = new escpos.Network('localhost');
const device  = new escpos.Serial('/dev/rfcomm0');

const printer = new escpos.Printer(device);

device.open(function(){
    //
    // printer
    //     .font('a')
    //     .align('ct')
    //     .style('bu')
    //     .size(1, 1)
    //     .text('Thanh Test')
    //     .barcode('12345678', 'EAN8')
    //     .qrimage('https://github.com/song940/node-escpos', function(err){
    //         this.cut();
    //         this.close();
    //     });
    //
    //printer.font('a');
    //printer.font('a');
    //
    // printer.text("ご利用ありがとうございます1",'Shift_JIS');
    //
    //
    // printer.text("ご利用ありがとうございます2",'Shift_JIS');
    //
    //
     //printer.text("ご利用ありがとうございます3");

    printer.text("abc");

    //printer.cut();

    //printer.cashdraw();

    //printer.cashdraw(5);
    this.close();

});





// printer.text("ご利用ありがとうございます",'Shift_JIS');
//
// printer.text("ご利用ありがとうございます",'GB18030');
//
// printer.text("Số lượng",'tcvn');
//
// printer.text("Số lượng",'GB18030');
//
// printer.text("abc",'GB18030');
//
//
// printer.cut();
//
// device.close();
