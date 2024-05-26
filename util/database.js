// const Sequelize  = require('sequelize');

const dotenv = require("dotenv");
dotenv.config();

// module.exports = sequelize;

let _db;

const mongodb = require("mongodb");

const mongoConnect = (callback) => {
  const MongoClient = mongodb.MongoClient;
  MongoClient.connect(process.env.MONGODB_URI)
    .then((client) => {
      console.log("Connected");
      _db = client.db();
      callback();
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};
const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "No DB found";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
