var express = require('express');
var router = express.Router();
var adminHelpers=require('../helpers/admin-helpers')
const userHelpers=require('../helpers/user-helpers')
var productHelpers=require('../helpers/product-helpers')

/* GET users listing. */

const Name='admin@a'
const pass=12345
let adminOn=true


router.get('/', function(req, res) {
  
  if(req.session.adminLog ){
    productHelpers.getAllProducts().then((products)=>{
      console.log(products);
    res.render('admin/admin-view',{products,adminOn})
    })
  }else{
    res.render('admin/admin-login')
  }
});

router.post('/login', function(req, res) {
  var a=req.body.adminName
  var b=req.body.adminPassword
  if(a==Name&&b==pass){
      req.session.adminLog = true;
      req.session.admin = req.body
      res.redirect('/admin')
  }else{
  res.redirect('/admin')
  }
});

router.get('/add-product',function (req,res){
  res.render('admin/add-product',{adminOn})
})

  router.get('/graph',async(req,res,next)=>{
    try {
      
  
        
        let delivery = {}
        delivery.Placed = 'placed'
        delivery.Shipped = 'shipped'
        delivery.Deliverd = 'deliverd'
        const allData = await Promise.all
            ([
              adminHelpers.onlinePaymentCount(),
              adminHelpers.totalUsers(),
              adminHelpers.totalOrder(),
              adminHelpers.cancelOrder(),
              adminHelpers.totalCOD(),
              adminHelpers.totalDeliveryStatus(delivery.Placed),
              adminHelpers.totalDeliveryStatus(delivery.Shipped),
              adminHelpers.totalDeliveryStatus(delivery.Deliverd),
              adminHelpers.totalCost(),
        
            ]);
            
            console.log('dahsifffffffffffffff');
            console.log(allData[0]);
            console.log(allData[1]);
            console.log(allData[2]);
            console.log('3=',allData[3]);
            console.log(allData[4]);
            console.log('5=',allData[5]);
            console.log(allData[6]);
            console.log('7',allData[7]);
            console.log(allData[8]);
            
            res.render('admin/graph',{   
            OnlinePymentcount: allData[0],
            totalUser: allData[1],
            totalOrder: allData[2],
            cancelOrder: allData[3],
            totalCod: allData[4],
            Placed: allData[5],
            Shipped: allData[6],
            Deliverd: allData[7],
            totalCost: allData[8]
          })
      
    } catch (error) {
      next(error)
    }
  } )

 

router.post('/add-product',function (req,res){
  console.log(req.body);
  productHelpers.addProduct(req.body,(id)=>{
    let image=req.files.Image
    image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{       //moving image to public
      if(!err){
        res.redirect('/admin/add-product')             
      }
      else console.log("image is not moves to public");
    })
  })
 
})
router.get('/edit-product/:id',function (req,res){
  let proId=req.params.id
  productHelpers.getProductDetails(proId).then((response)=>{
    console.log('response=',response);
    res.render('admin/edit-product',{response})
  })
 
})

router.post('/edit-product/:id',function (req,res){
   let id=req.params.id
  console.log(req.body,'==params==',req.params.id);
  productHelpers.updateProduct(id,req.body).then(()=>{
    if(req.files==null){
      res.redirect('/admin')
    }else{
      let image=req.files.Image
      image.mv('./public/product-images/'+id+'.jpg')     //moving image to public
      res.redirect('/admin')
    }
  })
    
 
 
})

router.get('/delete/:id/:category',function (req,res){
  let proId=req.params.id
  console.log('delete pressed',proId);
  console.log('delete pressed',req.params.category);
  console.log('delete pressed',req.params);
  productHelpers.deleteProducts(proId,req.params.category).then((products)=>{
    console.log(products);

    res.redirect('/admin')
  })
  
})

router.get('/admin-user-view',function (req,res){
  userHelpers.getAllUsers().then((user)=>{
    console.log(user);
    res.render('admin/user-view',{user,adminOn})

  })
  
})
router.get('/coupon',function (req,res){
    productHelpers.getCoupons().then((coupons)=>{
      console.log(coupons);
      res.render('admin/coupon',{coupons,adminOn})  
    })
    
})

router.post('/coupon',function (req,res){
  console.log(req.body.couponName);
  productHelpers.addCoupon(req.body).then(()=>{
    res.redirect("/admin/coupon")
  }) 
})

router.post('/changestatus',function (req,res){
  let userId=req.session.userId
   userHelpers.changeOrderStatus(req.body.proId,req.body.status,userId).then((res)=>{
    console.log(res)
    res.json(res);
   })
  })

router.get('/orderSummery',function (req,res){
  userHelpers.getOrderforAdmin().then((items)=>{
    console.log('items=',items);
    res.render("admin/orderSummery",{items,adminOn})    
  })
})

router.get('/orderProView/:id',function (req,res){
  let userId=req.params.id
  userHelpers.getOrder(userId).then((items)=>{
    console.log('items=',items);
    res.render("admin/orderProductVIew",{items,adminOn,userId})    
  })
})






module.exports = router;
