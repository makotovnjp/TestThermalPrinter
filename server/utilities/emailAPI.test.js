/*Tạm thời dùng đển send mail cho missing order*/
var utilEmail=require('./emailAPI');
order ={listProduct: [{_id:"58c485a09069043670f37178",price:1500,name:{vn:"Phở hộp 6 túi"},quantity:1,availableQuantity:10}],
    paymentMethod:{code:1,name:{vn:"chuyển khoản qua ngân hàng",jp:"振込"},price:0},
    customer:{name:"abcTest",email:"jankoller888@outlook.com",tel:"12345678910",postOfficeNumber:"111-4444",address:"abc123test"},
    _id:"apdEhZK-abcTest"};
utilEmail.confirmEmail(order,'contact@bepvietjp.com');
