var db=require('../config/connection')
var collection=require('../helpers/product-helpers')
var objectId=require('mongodb').ObjectId
var bcrypt=require('bcrypt')
const { response } = require('express')

module.exports={
    getAllusers:()=>{
        return new Promise(async(resolve,reject)=>{
            let userData=await db.get().collection(collection.ADMIN_COLLECTION).find().toArray()
            resolve(userData)
        })
    },
    deleteUsers:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).deleteOne({_id:objectId(proId)}).then((data)=>{
                resolve(data)
            })
        })
    },
    getUserbyId:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ADMIN_COLLECTION).findOne({_id:objectId(userId)}).then((result)=>{
                resolve(result)
            })
        })
    },
    updateUser:(userId,data)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ADMIN_COLLECTION).updateOne({_id:objectId(userId)},
        {$set:{
            name:data.name,
            email:data.email
        }}).then((response)=>{
            resolve(response)
        })
        })
        
    },
    addUser:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            userData.Password=await bcrypt.hash(userData.Password,10)
            db.get().collection(collection.ADMIN_COLLECTION).insertOne(userData).then((data)=>{
                userData._id=data.insertedId
                resolve(userData)
            })
        })
    },
    adminLogin:(data)=>{
       const response={}
        return new Promise(async(resolve,reject)=>{
           let admin=await db.get().collection(collection.ADMIN_COLLECTION).findOne({name:data.name})
           if(admin){
         
            if(admin.password==data.password){
              console.log('login sucess');
              response.admin=admin
              response.status=true
              resolve(response)
            }else{
              console.log('login failed');
              resolve({status:false})
            }
          
        }else{
          console.log('login failed');
          resolve({status:false})
        }
            })
        
    }
}