// using the mongodb from this

const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
let _db;
const mongoConnect = (callback) => {
  MongoClient.connect(
    "mongodb+srv://Vijay4944:Vijay4944@cluster0.9u1hgcw.mongodb.net/shop?appName=Cluster0"
  )
    .then((client) => {
      console.log("connected");
      _db = client.db();
      callback(client);
    })
    .catch((err) => {
      console.log("their is error in databse ", err);

      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "No database is found";
};
exports.mongoConnect = mongoConnect;
exports.getDb = getDb;

// mongodb+srv://Vijay4944:Vijay@4944@cluster0.9u1hgcw.mongodb.net/shop?retryWrites=true/appName=Cluster0
