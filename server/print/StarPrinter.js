var printer = require('./../lib/node-thermal-printer');

printer.init({
    type: 'star',
    interface: '/dev/rfcomm1'
});
printer.alignCenter();
printer.println("Hello world");
printer.cut();
// printer.printImageBuffer(/* PNG image buffer */, function(done){})
// printer.printImage('./assets/olaii-logo-black.png', function(done){
//     printer.cut();
//     printer.execute(function(err){
//         if (err) {
//             console.error("Print failed", err);
//         } else {
//             console.log("Print done");
//         }
//     });
// });