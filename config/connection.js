const mongoClient=require('mongodb').MongoClient

const state = {
    db:null
}


module.exports.connect=function(done){         //done is callback
    const dbname='newCart'
    const url=`mongodb+srv://amilsanan:amil123456@cluster0.3hyjwzh.mongodb.net/${dbname}`
    //const url=`mongodb://localhost:27017`

    mongoClient.connect(url,(err,data)=>{
        if(err) return done(err)
        state.db=data.db(dbname)
        done()
    })

    
}

module.exports.get=function(){
    return state.db
}