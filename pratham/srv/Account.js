const cds = require("@sap/cds");
const { MongoClient } = require("mongodb");

// MongoDB connection URI
const uri = "mongodb://Amiya:Amiya1999@74.225.222.62:27017/";

// MongoDB Client setup
let client;
let mongoCollection;

async function connectToMongoDB() {
    client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    try {
        await client.connect();
        const database = client.db("Pratham"); // Specify your database name
        mongoCollection = database.collection("Account"); // Specify your collection name
        console.log("Connected to MongoDB!");
    } catch (err) {
        console.error("Failed to connect to MongoDB", err);
    }
}

module.exports = cds.service.impl(async function () {
    // Connect to MongoDB when the service starts
    await connectToMongoDB();

    const { deptviews } = this.entities;

    this.before("CREATE", deptviews, async (req) => {
        console.log("Before creating a department:", req.data);
    });
    this.on("CREATE", deptviews, async (req) => {
        try {
            // Assign the value of the 'id' field to the '_id' field
            req.data._id = req.data.id;

            // Insert the document into MongoDB
            const result = await mongoCollection.insertOne(req.data);
            console.log(
                `Document inserted in MongoDB with _id: ${result.insertedId}`
            );

            // Return the inserted document with the MongoDB-generated ID
            return { ...req.data, _id: result.insertedId };
        } catch (err) {
            console.error("Error inserting document into MongoDB", err);
            req.error(500, "Unable to insert data");
        }
    });
    this.on("READ", deptviews, async (req) => {
        try {
            console.log("Fetching data from MongoDB");
            // Fetch documents from MongoDB
            const documents = await mongoCollection.find({}).toArray();
            console.log("Fetched documents:", documents);

            // Calculate the total count of records
            const totalCount = await mongoCollection.countDocuments({});
            console.log(totalCount, "---------------count");

            // Transform data if necessary, especially the _id field, which needs to be understood by CAP
            const transformedDocuments = documents.map((doc) => ({
                ...doc,
                ID: doc._id, // Assuming your UI expects 'ID' and MongoDB provides '_id'
            }));

            transformedDocuments["$count"] = totalCount; //we need to pass $count
            return transformedDocuments;
        } catch (err) {
            console.error("Error reading documents from MongoDB", err);
            req.error(500, "Unable to fetch data");
            return [];
        }
    });

    this.on("DELETE", deptviews, async (req) => {
        try {
            const idToDelete = req.params[0].id; // Extract the ID from the request URL parameters
            if (!idToDelete) {
                throw new Error("ID field is missing or undefined");
            }

            const result = await mongoCollection.deleteOne({ _id: idToDelete });
            if (result.deletedCount === 1) {
                console.log(
                    `Document with ID ${idToDelete} deleted successfully from MongoDB`
                );
            } else {
                console.log(`No document found with ID ${idToDelete}`);
            }
        } catch (error) {
            console.error("Error deleting document from MongoDB", error);
            req.error(500, "Unable to delete document");
        }
    });

    this.on("disconnect", async () => {
        if (client) {
            await client.close();
            console.log("Disconnected from MongoDB.");
        }
    });
});
