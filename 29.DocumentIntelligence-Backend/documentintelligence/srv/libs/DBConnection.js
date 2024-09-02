const { MongoClient } = require("mongodb");
const uri = "mongodb+srv://sanjucs1ga16me438:sanju1997@btpcluster.jj367.mongodb.net/";
module.exports = {
  connectToMongoDB: async function () {
        const mongoDBConnectionURI = uri;
        const client = new MongoClient(mongoDBConnectionURI);
        try {
            await client.connect();
            const database = client.db('BTP');
            return { client, database };
        } catch (err) {
            throw err;
        }
    }
};


