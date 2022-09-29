var db=require('../config/connection')
var collection=require('../config/collections');
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
        
    },
    onlinePaymentCount: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let count = await db.get().collection(collection.ORDER_COLLECTION).find({ address:{payment_method: "ONLINE" }}).count()
                resolve(count)
            } catch (err) {
                reject(err)
            }

        })
    },
    totalUsers: () => {
        return new Promise(async (resolve, reject) => {
          try {
            let count = await db.get().collection(collection.USER_COLLECTION).find().count()
            resolve(count)
          } catch (err) {
            reject(err)
          }
        })
      },
  totalOrder: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let count = await db.get().collection(collection.ORDER_COLLECTION).find().count()
        resolve(count)
      } catch (err) {
        reject(err)
      }
    })
  },
  cancelOrder: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let count = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
          {
            $match: {
              'status': 'canceled'
            }
          }, {
            $count: 'number'
          }

        ]).toArray()
        resolve(count)
        console.log(count);
      } catch (err) {
        reject(err)
      }

    })
  },
    totalCOD: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let count = await db.get().collection(collection.ORDER_COLLECTION).find({address:{ payment_method : "COD" }}).toArray()
                resolve(count)
            } catch (err) {
                reject(err)
            }
        })

    },
  totalDeliveryStatus: (data) => {
    return new Promise(async (resolve, reject) => {
      try {
        let statusCount = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
            $match: {
              'status': data

            }
          }, {
            $count: 'number'
          }

        ]).toArray()
        resolve(statusCount)
      } catch (err) {
        reject(err)
      }
    })
  },
  totalCost: () => {
    return new Promise(async (resolve, reject) => {
      try {
        total = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
          {
            $project: {
              'totalAmount': 1
            }
          },
          {
            $group: {
              _id: null,
              sum: { $sum: '$totalAmount' }
            }
          }
        ]).toArray()
        resolve(total)
      } catch (err) {
        reject(err)
      }
    })
  }
}