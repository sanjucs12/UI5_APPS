const getOAuthToken = require('../srv/libs/auth');
const { connectToMongoDB } = require('./libs/DBConnection');
const axios = require('axios');
const { Readable } = require('stream');
const FormData = require('form-data');

module.exports = async (srv) => {
    const { database } = await connectToMongoDB();

    srv.on('uploadDocument', async (req) => {
        const { file } = req.data;
        const fileBuffer = Buffer.from(file, 'base64');
        const fileStream = Readable.from(fileBuffer);

        const formData = new FormData();
        formData.append('file', fileStream, 'document.pdf'); // Adjust the filename as needed
        formData.append('options', JSON.stringify({
            schemaName: 'SAP_invoice_schema',
            clientId: 'default',
            documentType: 'invoice',
            receivedDate: new Date().toISOString().split('T')[0],
        }));

        try {
            const token = await getOAuthToken();
            const URL = 'https://aiservices-trial-dox.cfapps.us10.hana.ondemand.com/document-information-extraction/v1/document/jobs'
            const response = await axios.post(URL, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    ...formData.getHeaders(), // Important to include the form-data headers
                },
            });

            const jobId = response.data.id
            if (jobId) {
                let jobData;
                let jobStatus;
                do {
                    const checkStatus = await axios.get(`${URL}/${jobId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });

                    jobData = checkStatus.data;
                    jobStatus = checkStatus.data.status;

                    if (jobStatus !== "DONE") {
                        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds before polling again
                    }
                } while (jobStatus !== "DONE");

                if (jobStatus === "DONE") {
                    // Store the result in MongoDB
                    const collection = database.collection('extractedDocuments');
                    await collection.insertOne({ documentId: jobId, extractedData: jobData });
                    return { message: 'Document processed and stored successfully', documentId: jobId };
                }
            }

        } catch (error) {
            console.error('Error processing document:', error.response ? error.response.data : error.message);
            req.error('Error processing document:', error);
        }
    });
};
