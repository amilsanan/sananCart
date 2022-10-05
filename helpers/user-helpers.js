var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt');
const { CART } = require('../config/collections');
// const { ObjectId } = require('mongodb');
var ObjectId=require('mongodb').ObjectId
const Razorpay = require('razorpay');
const { isNull } = require('util');
const { resolve } = require('path');

let cartQuan=1

var instance = new Razorpay({
    key_id: 'rzp_test_qVdU2EjHwjN4ay',
    key_secret: 'VYxrMxLTHTyki1OSdiUrUjms',
  });
  


module.exports={
    doSignup:(userData)=>{
        console.log('user data in userHelpers=');
        console.log(userData);
        return new Promise(async(resolve,reject)=>{
            console.log('promise started');
            userData.password=await bcrypt.hash(userData.password,10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                console.log(data);
                console.log(userData);                
                resolve(userData)
            })
        })
        
         
    },
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            console.log('promise started',userData.Email );
            let loginStatus=false
            let response={}
            let user= await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email})
            console.log('use-',user);
            if(user){
                bcrypt.compare(userData.password,user.password).then((status)=>{
                    console.log(status);
                    if(status){
                        console.log(" login success");
                        response.user=user                      //creating a property to response object
                        response.status=true
                        resolve(response)
                    }
                    else{
                        console.log("login failed");
                        resolve({status:false})
                    }
                })
            }else{
                console.log("login failed");
                resolve({status:false})
            }
        })
    },
    getAllUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            let user= await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(user)
        })
    },
    getAUser:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let user= await db.get().collection(collection.USER_COLLECTION).find({_id:ObjectId(userId)}).toArray()
            resolve(user)
        })
    },
    addToCart:(proId,userId)=>{
        console.log(proId);
        console.log('first');
        let proObj={
            item:ObjectId(proId),
            quantity:cartQuan
        }
        return new Promise(async(resolve,reject)=>{
           let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
           if(userCart){
                let proExist=userCart.products.findIndex(product=> product.item==proId)
                console.log('proExit=',proExist);
                if(proExist==-1){
                //     db.get().collection(collection.CART_COLLECTION).updateOne({user:ObjectIdw(userId),'product.item':ObjectId(proId)},
                //     {
                //         $inc:{'products.$.quanitity':1}
                //     }
                //     ).then(()=>{
                //         resolve()
                //     })
                // }else{
                    db.get().collection(collection.CART_COLLECTION).updateOne({user:ObjectId(userId)},
                    {
                        $push:{products:proObj}
                    }).then((response)=>{
                        resolve()
                    })
                }
           }else{
            let cartObj={
                user:ObjectId(userId),
                products:[proObj]
            }
            db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                console.log('rresponse',response);
                resolve()
            })
           }
           
        })

    },
    getCartProducts: (userId) => {
        console.log("reached");
        return new Promise(async (resolve, reject) => {
            console.log('.cart promise');

            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: ObjectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from:collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray()
            console.log(cartItems);

            resolve(cartItems)
          
        })
    },
    cartQuantity:(details) => {
        console.log('az=',details);
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)
        console.log(details, 'fdsfsdfsd');

        return new Promise((resolve, reject) => {
            // if (details.count == -1 && details.quantity == 1) {
            //     db.get().collection(collection.CART_COLLECTION)
            //         .updateOne({ _id: ObjectId(details.cart) },
            //             {
            //                 $pull: { products: { item: ObjectId(details.product) } }
            //             }
            //         ).then((response) => {
            //             resolve({ removeProduct: true })
            //         })
            // } else {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: ObjectId(details.cart), 'products.item': ObjectId(details.product) },
                        {
                            $inc: { 'products.$.quantity': details.count }
                        }).then((response) => {
                            console.log('rewq=');
                            resolve({ status: true })

                        })
            // }

        })
    },
    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            

            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: ObjectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {

                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', {$toInt: '$product.price'}] } }
                    }
                }

            ]).toArray()
            resolve(total[0]?.total)
            console.log(total[0]?.total);
        })
    },
    
    addToWishlist:(proId,userId)=>{
        console.log(proId);
        console.log('first');
        console.log(ObjectId(proId));
        console.log(ObjectId(userId));
        let proObj={
            item:ObjectId(proId),
            quantity:1
        }
        console.log(proObj);
        return new Promise(async(resolve,reject)=>{
           let userWishlist=await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user:ObjectId(userId)})
           if(userWishlist){
                let proExist=userWishlist.products.findIndex(product=> product.item==proId)
                console.log('proExit=',proExist);
                if(proExist!=-1){
                    db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user:ObjectId(userId),'product.item':ObjectId(proId)},
                    {
                        $inc:{'products.$.quanitity':1}
                    }
                    ).then(()=>{
                        resolve()
                    })
                }else{
                    db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user:ObjectId(userId)},
                    {
                        $push:{products:proObj}
                    }).then((response)=>{
                        resolve()
                    })
                }
           }else{
            let cartObj={
                user:ObjectId(userId),
                products:[proObj]
            }
            db.get().collection(collection.WISHLIST_COLLECTION).insertOne(cartObj).then((response)=>{
                resolve()
            })
           }
           
        })

    },
    getWishlistProducts:async (userId) => {
        let a = await db.get().collection(collection.WISHLIST_COLLECTION).find().toArray()
        return new Promise(async (resolve, reject) => {
            console.log('wishlist promise');

            let wishListItems = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                {
                    $match: { user: ObjectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from:collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { 
                        $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray()

            resolve(wishListItems)
            console.log("haaaai",wishListItems);
        })
    },
    deleteCartProducts:(proId,userId)=>{
        return new Promise(async(resolve,reject)=>{
            console.log('delete commit'); 
            userId=""+userId

            db.get().collection(collection.CART_COLLECTION)
                .update({}, 
                    {$pull: {products: {item: ObjectId(proId)}}}, 
                    {multi: true}).then((response)=>{
                    console.log(response);
                resolve(response)
            })
        })
    },
    generateRazorPay:(orderId,total)=>{
        return new Promise(async(resolve,reject)=>{
            const Razorpay = require('razorpay');
            var instance = new Razorpay({ key_id: 'rzp_test_qVdU2EjHwjN4ay', key_secret: 'VYxrMxLTHTyki1OSdiUrUjms' })

            var options = {
            amount: total*100,  // amount in the smallest currency unit
            currency: "INR",
            receipt: ""+orderId
            };
            instance.orders.create(options, function(err, order) {
                if(err){
                    console.log(err);
                }
                else{
                    console.log(order);
                    resolve(order)
                }
            });

        })
    },
    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', 'VYxrMxLTHTyki1OSdiUrUjms');

            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
            //console.log("asdfgdscd",details['payment[razorpay_order_id]']);
            var payStatus=null
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                payStatus=true
                resolve(payStatus)
            } else {
                reject()
            }
        })
    },
    changePaymentStatus: (orderId,userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION)
                .updateOne({ _id: ObjectId(orderId) },
                    {
                        $set: {
                            status: 'placed'
                        }
                    }).then((response) => {
                        resolve()
                        if (response.acknowledged == true) {
                            console.log("very",userId);
                            db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(userId) })
                        }
                    })
        })
    },
    removeFromWishlist:(proId,userId)=>{
        return new Promise(async(resolve,reject)=>{
            console.log('delete commit'); 
            userId=""+userId

            db.get().collection(collection.WISHLIST_COLLECTION)
                .update({"user":ObjectId(userId)}, 
                    {$pull: {products: {item: ObjectId(proId)}}}, 
                    {multi: true}).then((response)=>{
                    console.log(response);
                resolve(response)
            })
        })
    },
    addingAddress:async(userAddress,userId)=>{
        console.log('user',userAddress);
        await db.get().collection(collection.CART_COLLECTION).update({"user":ObjectId(userId)}, 
        {'$set':{"address":userAddress}})
    },
    createOrderSummery:(userId,amt,coupon)=>{
        console.log(userId);
        return new Promise(async(resolve, reject) => {
            
            let dateObj = new Date();
            let month = dateObj.getUTCMonth() + 1;
            let year = dateObj.getUTCFullYear();
            let day = dateObj.getUTCDate();
            let currentDate = day + "/" + month + "/" + year;

            let order_Coll= await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
            let pro_detail=await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: ObjectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from:collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, address:1,
                        // product: { $arrayToObject: "$product" }
                        product: { $arrayElemAt: ['$product', 0]}
                    }
                }

            ]).toArray()
            // order atatus to eackh object in array
            pro_detail.forEach((element) => {
                element.order_status = 'placed'
              });
            let orderlist={
                date:currentDate,
                user:order_Coll.user,
                quantity:pro_detail[0].quantity,
                products:pro_detail,
                address:order_Coll.address,
                totalAmount:amt,
                couponCode:coupon
            }
            console.log('a=',orderlist);
           await db.get().collection(collection.ORDER_COLLECTION).insertOne(orderlist)
           await db.get().collection(collection.CART_COLLECTION).deleteOne({"user":ObjectId(userId)})
           
           resolve(order_Coll)
        })
    },getOrder:(userId)=>{
        return new Promise(async(resolve, reject) => {
          let ordertems=await db.get().collection(collection.ORDER_COLLECTION).find({"user":ObjectId(userId)}).toArray()
            resolve(ordertems)
        })
    },
    getOrderList:(proId)=>{
        return new Promise(async(resolve, reject) => {
          let ordertems=await db.get().collection(collection.ORDER_COLLECTION).find({"_id":ObjectId(proId)}).toArray()
            resolve(ordertems)
        })
    },
    changeOrderStatus:(proId,status,orderId)=>{
        return new Promise(async(resolve, reject) => {
            await db.get().collection(collection.ORDER_COLLECTION).findOneAndUpdate(
                    { _id:ObjectId(orderId),
                       "products.item":ObjectId(proId)
                    },
                    { $set:{
                       'products.$.order_status': status
                  }
                 }
                );
        })
    },
    getOrderforAdmin:()=>{
        return new Promise(async(resolve, reject) => {
          let ordertems=await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
            resolve(ordertems)
        })
    },editProfile:(userId,data)=>{
        return new Promise(async(resolve, reject) => {
        db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},{
            $set:{
                user:data.userName,
                Email: data.userEmail,
                phoneNo: data.userMobile,
                address1:data.address,
                address:data.address1,
                pin:data.pin
            }
           }).then((response)=>{
            console.log(response);
            resolve(userId)
           })
        })
    },
    cheackCoupon:(coupon)=>{
        console.log(coupon);
        return new Promise(async(resolve, reject) => {
        let c=await db.get().collection(collection.COUPON_COLLECTION).findOne({couponName:coupon})
        console.log('pk=',c);
        if(c!=null){
        console.log('l',c);
        let copounStatus=true
        resolve({copounStatus,c})
    }
    else{
            let copounStatus=false
            console.log('no coupon');
           // c.couponPercentage=0
            resolve(copounStatus)
        }
        })
    },
    addingUserAddress:(body,userId)=>{
        addd=[]
        
        let address={
            user:ObjectId(userId),
            address:[]
            
        }
       return new Promise(async(resolve,reject)=>{
        let add=await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
        if(add!=null){
            console.log('y');
            addd.push(body)
            db.get().collection(collection.CART_COLLECTION).updateOne({user:ObjectId(userId)},
                    {
                        $push:{addressbody}
                    })
        }else {
            console.log('n');
        await db.get().collection(collection.ADDRESS_COLLECTION).insertOne(address)
        }
        resolve()
       })
    },
    getAddress:()=>{
        return new Promise(async (resolve, reject) => {
        let address = await db.get().collection(collection.ADDRESS_COLLECTION).find({ UserId: ObjectId(UserId)}).toArray()            
        resolve(address)
        })
    },
    //kkkkk
    placeOrder: (order, products, total) => {
        return new Promise((resolve, reject) => {
          console.log(order, products, total);
          let status = order["payment-method"] === "COD" ? "placed" : "pending";
          let orderObj = {
            deliveryDetails: {
              mobile: order.mobile,
              address: order.address,
              pincode: order.pincode,
            },
            userId: ObjectId(order.userId),
            paymentMethod: order["payment-method"],
            products: products,
            totalAmount: total,
            status: status,
            date: new Date(),
          };
          db.get()
            .collection(collection.ORDER_COLLECTION)
            .insertOne(orderObj)
            .then((response) => {
              db.get()
                .collection(collection.CART_COLLECTION)
                .deleteOne({ user: objectId(order.userId) });
              resolve(response.insertedId);
            });
        });
      },
      getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
          console.log(userId);
          let cart = await db
            .get()
            .collection(collection.CART_COLLECTION)
            .findOne({ user: objectId(userId) });
          console.log(cart);
          resolve(cart.products);
        });
      },
      getUserOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
          console.log(userId);
          let orders = await db
            .get()
            .collection(collection.ORDER_COLLECTION)
            .find({ userId: objectId(userId) })
            .toArray();
          console.log(orders);
          resolve(orders);
        });
      },
      getOrderProducts: (orderId) => {
        return new Promise(async (resolve, reject) => {
          let orderItems = await db
            .get()
            .collection(collection.ORDER_COLLECTION)
            .aggregate([
              {
                $match: { _id: objectId(orderId) },
              },
              {
                $unwind: "$products",
              },
              {
                $project: {
                  item: "$products.item",
                  quantity: "$products.quantity",
                },
              },
              {
                $lookup: {
                  from: collection.PRODUCT_COLLECTION,
                  localField: "item",
                  foreignField: "_id",
                  as: "product",
                },
              },
              {
                $project: {
                  item: 1,
                  quantity: 1,
                  product: { $arrayElemAt: ["$product", 0] },
                },
              },
            ])
            .toArray();
    
          resolve(orderItems);
        });
      }

        
}