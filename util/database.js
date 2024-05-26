// const Sequelize  = require('sequelize');

// const sequelize = new Sequelize('node' , 'root' , 'Nirmeet@sql' , {
//     dialect: 'mysql',
//     host : 'localhost'
// });

// module.exports = sequelize;


let _db;

const mongodb = require('mongodb');

const mongoConnect = (callback) =>{
    const MongoClient = mongodb.MongoClient;
    MongoClient.connect('mongodb+srv://nirmeet:Nirmeet1@cluster0.inb5jmp.mongodb.net/shop?retryWrites=true&w=majority')
    .then((client)=>{
        console.log("Connected");
        _db = client.db();
        callback();
    })
    .catch((err)=>{
        console.log(err);
        throw err;
    })
}
const getDb = (()=>{
    if(_db){
        return _db; 
    }
    throw 'No DB found';
})


exports.mongoConnect = mongoConnect;
exports.getDb = getDb;

