
require('dotenv').config()
// Download the helper library from https://www.twilio.com/docs/node/install
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
// const accountSid = 'AC7eaffff0d5532f3c06c955233867cb4d'



//   const client = require('twilio')('AC7eaffff0d5532f3c06c955233867cb4d', '20d2f1888afb4463d9ba329d4d268353'); 
 
// function sms(){
// client.messages .create({ 
//          body: 'marnama varum oru naal',  
//          messagingServiceSid: 'MG97563b21d4c3dcf71e4499f3425fb064',      
//          to: '+917356168687' 
//        }) 
//       .then(message => console.log(message)) 
//       .catch(err=>console.log(err));
// }
// sms()

const client = require('twilio')(process.env.TWILIO_ACCOUNTSID, process.env.TWILIO_AUTH); 
const servicesId=process.env.TWILIO_SERVICESID

module.exports={
    doSms:(number)=>{
        console.log("hhhhh",number);
        no=number.phoneNo
        let res={}
        return new Promise((resolve,reject)=>{
            console.log('phonw number ---');
            console.log(no);           
            client.verify.services(servicesId).verifications.create({
                to:`+91${no}`,
                channel:'sms'
            }).then((res)=>{
                console.log(res);
                res.valid=true
                resolve(res)
            })
        })
    },
    otpVerify:(otpData,number)=>{
        let res={}
        return new Promise((resolve, reject) => {
            client.verify.services(servicesId).verificationChecks.create({
                to:`+91${number}`,
                code:otpData.otp
            }).then((res)=>{
                console.log(res);
                if(res.status === 'approved'){
                    resolve(response=true)
                }else{
                    resolve(response=false)

                }
            })
        })
    }
}