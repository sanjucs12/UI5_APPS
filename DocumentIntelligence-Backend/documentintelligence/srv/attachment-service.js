const cds = require("@sap/cds");
const { connectToMongoDB } = require('./libs/DBConnection');

module.exports = cds.service.impl(function () {
    console.log('Service implementation initialized.');
     // READ operation
     this.on('READ', 'ATTACHMENTS', async (req) => {
        const { database } = await connectToMongoDB();
        const collection = database.collection('Attachments');
        const files = await collection.find().toArray();
        return files
    });
});


