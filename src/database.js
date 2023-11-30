
const { MongoClient } = require("mongodb");

const DB_URL = "mongodb://localhost:27017"; 
const DB_NAME = "users"; 
const COLLECTION_NAME = "logins"; 

async function connectToDatabase() {
  const client = await MongoClient.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
  return collection;
}

module.exports = { connectToDatabase };