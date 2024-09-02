const cds = require("@sap/cds");
const { connectToMongoDB } = require('./libs/DBConnection');
const { uploadFileToAzure } = require('./libs/AzureBlob');



module.exports = cds.service.impl(function () {
    this.on('READ', 'ATTACHMENTS', async (req) => {
        console.log(req.data)
        const { database } = await connectToMongoDB();
        const collection = database.collection('Attachments');
        const files = await collection.find().toArray();
        return files
    });
    this.on('CREATE', 'ATTACHMENTS', async (req) => {
        try {
            const { FILENAME, URL } = req.data;
            const azureBlobUrl = await uploadFileToAzure(URL, FILENAME)
            const { database } = await connectToMongoDB();
            const collection = database.collection('Attachments');
            const result = await collection.insertOne({ FILENAME, URL: azureBlobUrl });
            return { message: 'Document Uploaded successfully', id: result.insertedId, URL: azureBlobUrl };
        } catch (error) {
            req.error(error);
        }
    });
});
