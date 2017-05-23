const escpos = require('escpos');

// Select the adapter based on your printer type
//const device  = new escpos.USB();
// const device  = new escpos.Network('localhost');
const device  = new escpos.Serial('/dev/rfcomm1');

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
    printer.text("Thanh Test");
    printer.cut();
    printer.close();

});
