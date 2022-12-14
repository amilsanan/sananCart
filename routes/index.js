var express = require('express');
var router = express.Router();
var MongClient = require('mongodb').MongoClient
const userHelpers=require('../helpers/user-helpers')
var productHelpers=require('../helpers/product-helpers')
var verify=require('../helpers/verify');
const { response } = require('express');

const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}


var phonenumber

/* GET home page. */
router.get('/', function(req, res, next) { 
  let userOn=true
  let user=req.session.user
  res.render('index',{user,userOn});

});

router.get('/signin',(req,res)=>{
  
  res.render('user/user-signin')
})


router.post('/signin',(req,res)=>{
  phonenumber=req.body.phoneNo
  userHelpers.doSignup(req.body).then((response)=>{   
    console.log('reqq=',req.body);
    req.session.userId=req.body._id
    verify.doSms(req.body).then((response)=>{                     //otp
      console.log("sms send===",response);
      res.render('user/otp')
    })
   
  })
  verify.doSms(req.body).then((response)=>{
    
    console.log("sms send");
    res.render('user/otp')
  })
  
})

router.post('/otp', (req, res)=> {
  console.log(phonenumber);
  verify.otpVerify(req.body,phonenumber).then((response)=>{
    req.session.loggedIn=true
    req.session.coupon=0
    console.log(response);
    res.redirect('/')

  })
});

router.get('/login',async function(req, res, next) {
  if(req.session.loggedIn){
    let u=req.session.userId
   let a= await userHelpers.getAUser(req.session.userId)
   console.log('req=',req.session.userId);
   console.log('a=',a);
    res.render('user/user-profile',{a,u})
  }else{
    res.render('user/user-login');
  }
});

router.post('/login',(req,res)=>{
  console.log("posted login",req.body);
  userHelpers.doLogin(req.body).then((response)=>{
    console.log(response);
    if(response.status){
      req.session.loggedIn=true
      req.session.userId=response.user._id
      req.session.coupon=0
      res.redirect('/')
    }else{
      res.redirect("/login")
    }
  })
})

router.get('/her', function(req, res, next) {
    res.render('user/her');  
});

router.get('/him', function(req, res, next) {
  res.render('user/him');  
});

router.get('/allProducts-view', function(req, res, next) {
  
  productHelpers.getAllProducts().then((products)=>{
    res.render('user/user-view',{products});
  })
  
})

router.get('/kurtha-view', function(req, res, next) {
  productHelpers.WOMEN_kurthies().then((products)=>{
    res.render('user/user-view',{products});
  })
  
})
router.get('/w-tshirt-view', function(req, res, next) {
  productHelpers.WOMEN_tshirts().then((products)=>{
    res.render('user/user-view',{products});
  })
  
})
router.get('/shirt-view', function(req, res, next) {
  productHelpers.MEN_shirts().then((products)=>{
    res.render('user/user-view',{products});
  })
  
})
router.get('/m-tshirt-view', function(req, res, next) {
  productHelpers.MEN_tshirts().then((products)=>{
    res.render('user/user-view',{products});
  })
  
})

router.get('/productView/:id',(req,res)=>{
  let proId=req.params.id
  console.log('mm1',proId);
   productHelpers.getProductDetails(proId).then((response)=>{
    console.log(response);
    res.render('user/product-view',{response})
   })

})

router.get('/cart',verifyLogin,async function(req, res, next) {
  console.log("cart clicked");
  let totalvalue = await userHelpers.getTotalAmount(req.session.userId)
  console.log("totalvalue",totalvalue);
  userHelpers.getCartProducts(req.session.userId).then((cartItems)=>{
    console.log(cartItems);
    
    res.render('user/cart',{cartItems,totalvalue});
  })
  
});

router.get('/wishlist',verifyLogin, function(req, res, next) {
  console.log("wishlist clicked");
  userHelpers.getWishlistProducts(req.session.userId).then((Items)=>{
    console.log('items==',Items);
    res.render('user/wishlist',{Items});
  })
});
router.get('/add-to-wishlist/:id',verifyLogin,(req,res)=>{
  console.log('params = ',req.params);
  console.log('user id=',req.session.userId);
  userHelpers.addToWishlist(req.params.id,req.session.userId).then(()=>{
    res.json({status:true})
  })
})
router.get('/remove-from-whislist/:id',verifyLogin,(req,res)=>{
  console.log('params = ',req.params);
  console.log('user id=',req.session.userId);
  userHelpers.removeFromWishlist(req.params.id,req.session.userId).then(()=>{
    res.redirect('/wishlist')
  })
})
router.get('/add-to-cart/:id',verifyLogin,(req,res)=>{
  console.log('params = ',req.params);
  console.log('user id=',req.session.userId);
  userHelpers.addToCart(req.params.id,req.session.userId).then(()=>{
    res.json({status:true})
  })
})
router.get('/deleteproductcart/:id',verifyLogin,(req,res)=>{
  let proId=req.params.id
  let userId=req.session.userId
  console.log('delete cart=',proId,"==user==",userId);
  userHelpers.deleteCartProducts(proId,userId).then((response)=>{
    res.redirect('/cart')
  })

})

router.get('/checkout',verifyLogin,async(req,res)=>{ 
  let sub_amt=await userHelpers.getTotalAmount(req.session.userId)
  let amt=sub_amt-req.session.coupon
  let code=req.session.coupon
  let pro=await userHelpers.getCartProducts(req.session.userId)
  console.log('pro=',pro);
  let a= await userHelpers.getAUser(req.session.userId)
  res.render('user/checkout',{sub_amt,amt,pro,a,code})
})

router.get('/succesPage',verifyLogin,(req,res)=>{  
  res.render('user/paymentSuccessfillPage')
})

router.post('/verify-payment',async(req,res)=>{
  console.log('miuy=',req.body);
  let amt=await userHelpers.getTotalAmount(req.session.userId)
  amt=amt-req.session.coupon
  userHelpers.verifyPayment(req.body).then(async(status)=>{
    console.log('sts',status);
    await userHelpers.createOrderSummery(req.session.userId,amt,req.session.couponName)
    res.json({status:true})
  }).catch((err)=>{
    console.log('err',err);
    res.json({status:'payment failed'})
  })
})
router.post('/place-order',verifyLogin,async (req,res)=>{
  console.log('hi',req.body);
  // let order=await userHelpers.getOrder(req.session.userId)
  let amt=await userHelpers.getTotalAmount(req.session.userId)
  amt=amt-req.session.coupon
  console.log('amt=',amt);
 await userHelpers.addingAddress(req.body,req.session.userId)
  if(req.body.payment_method=='COD'){
    res.json({codSuccess:true})
    console.log('good');
    await userHelpers.createOrderSummery(req.session.userId,amt,req.session.couponName)
    console.log('order placed succefully')
    
  } else{
    userHelpers.generateRazorPay('hg',amt).then((response) => {
   console.log('order placed succefully')
   res.json(response)

    })
  }   
})
router.get('/Orders',verifyLogin,(req,res)=>{
  userHelpers.getOrder(req.session.userId).then((details)=>{
    console.log("12553",details);
    
    res.render('user/viewOrders',{details})
  })  
})

router.get('/addAddress',verifyLogin,(req,res)=>{
  res.render('user/addAddress')
})

router.post('/addAddress',verifyLogin,(req,res)=>{
  console.log(req.body);
  userHelpers.addingUserAddress(req.body,req.session.userId).then((raes)=>{
    res.redirect('/login')
  })
})

router.get('/Orderlist/:id',verifyLogin,(req,res)=>{
  console.log("l=",req.params.id);
  userHelpers.getOrderList(req.params.id).then((details)=>{
    console.log("123",details);
    
    res.render('user/viewSingleOrder',{details})
  })
})

router.get('/edit_profile',async(req,res)=>{
  let user=req.session.userId
  let a= await userHelpers.getAUser(req.session.userId)
  res.render('user/edit_profile',{a,user})
})

router.post('/edit_profile',async(req,res)=>{
  console.log(req.body);
  userHelpers.editProfile(req.session.userId,req.body).then(()=>{
    if(req.files==null){
      res.redirect('/login')
    }else{
    let image=req.files.Image
    image.mv('./public/product-images/'+req.session.userId+'.jpg')     //moving image to public
    res.redirect('/login')
  }
  })
})

router.get('/logout',(req,res)=>{
  req.session.loggedIn=false
  res.redirect('/')
})

router.post('/change-quantity',verifyLogin,(req,res,next)=>{
  console.log('hi22');
  userHelpers.cartQuantity(req.body).then(async(response) => {
    response.subtotal = await userHelpers.getTotalAmount(req.session.userId)
    response.total = response.subtotal -req.session.coupon
    res.json(response)
  })
})


router.post('/cheackCoupon',verifyLogin,(req,res,next)=>{
  console.log('sds=',req.body);
  userHelpers.cheackCoupon(req.body.couponcode).then((response)=>{
    console.log('response',response);
    if(response.copounStatus==true){
      req.session.coupon=response.c.couponPercentage
      req.session.couponName=response.c.couponName
      res.json(response)
    }
    else{
      res.json("no valid")
    }
  })
  
})

function creatingOrder(userId){
  userHelpers.createOrderSummery(userId).then((pro,orderCart)=>{
    return pro,orderCart
  })
}


module.exports = router;
