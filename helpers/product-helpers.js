var db=require('../config/connection')
var collection=require('../config/collections');
const { ObjectId } = require('mongodb');

module.exports={
    addProduct:(product,callback)=>{
        console.log(product);
        console.log(product.category);
        if(product.category=='men-tshirt'){
            db.get().collection(collection.MEN_TSHIRT).insertOne(product).then((data)=>{
                console.log(data);
            })
        }else if (product.category=='men-shirt'){
            db.get().collection(collection.MEN_SHIRT).insertOne(product).then((data)=>{
                console.log(data);
            })
        }else if(product.category=='women-tshirt'){
            db.get().collection(collection.WOMEN_TSHIRTS).insertOne(product).then((data)=>{
                console.log(data);
            })
        }else {
            db.get().collection(collection.WOMEN_KURTHIES).insertOne(product).then((data)=>{
                console.log(data);
            })
        }
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data)=>{        //get is to get the port 
            callback(data.insertedId)
        }) 
         

    },                                      //each products
    MEN_tshirts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.MEN_TSHIRT).find().toArray()
            resolve(products)
        }) 
    },
    MEN_shirts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.MEN_SHIRT).find().toArray()
            resolve(products)
        }) 
    },
    WOMEN_tshirts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.WOMEN_TSHIRTS).find().toArray()
            resolve(products)
        }) 
    },
    WOMEN_kurthies:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.WOMEN_KURTHIES).find().toArray()
            resolve(products)
        }) 
    },                                          //allProducts
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()        //calling a product collections saves in connection js in config 
            console.log(products);
            resolve(products)

        })
    },

    deleteProducts:(proId,category)=>{
        return new Promise((resolve,reject)=>{
            console.log('delete comed');
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:ObjectId(proId)}).then((response)=>{
                console.log('res=',response);
                resolve(response)
            })
            if(category=='men-tshirt'){
                db.get().collection(collection.MEN_TSHIRT).deleteOne({_id:ObjectId(proId)})
            }
            else if(category=='men-shirt'){
                db.get().collection(collection.MEN_SHIRT).deleteOne({_id:ObjectId(proId)})
            }
            else if(category=='women-tshirt'){
                db.get().collection(collection.WOMEN_TSHIRTS).deleteOne({_id:ObjectId(proId)})
            }
            else {
                db.get().collection(collection.WOMEN_KURTHIES).deleteOne({_id:ObjectId(proId)})
            }
        })
    },
    getProductDetails:(proId)=>{
        
        return new Promise(async(resolve,reject)=>{
            let productDetail=await db.get().collection(collection.PRODUCT_COLLECTION).find({_id:ObjectId(proId)}).toArray()        //calling a product collections saves in connection js in config 
            resolve(productDetail)
        })

    },
    updateProduct:(proId,details)=>{
        console.log('hiii');
        return new Promise((resolve,reject)=>{
           db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(proId)},{
            $set:{
                Name:details.Name,
                price: details.price,
                description: details.description,
                category: details.category
            }
           }).then((response)=>{
            resolve()
           })
        })

    },
    addCoupon:(details)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.COUPON_COLLECTION).insertOne(details).then((data)=>{
                console.log(data);
            })
        })
    },
    getCoupons:()=>{
        return new Promise(async(resolve,reject)=>{
           let cou= await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
                resolve(cou)
            
        })

    }

}