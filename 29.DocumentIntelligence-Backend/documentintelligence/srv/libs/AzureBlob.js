const { BlobServiceClient } = require("@azure/storage-blob");

const connectionString = "DefaultEndpointsProtocol=https;AccountName=docpersistentstorage;AccountKey=tjAJzcHPp23fstNanpWjxf2k2IoZ4nOmr8IzxZrTfcbWZIVswYgwQZoO3Jt0xF99L2lZOu2Q+0Mf+AStMX7QeA==;EndpointSuffix=core.windows.net";
const containerName = "intelligence-docs";

module.exports = {
    uploadFileToAzure: async function (base64URL, IMAGE_FILE_NAME) {
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const uniqueFilePath = `${IMAGE_FILE_NAME}`;
        const blockBlobClient = containerClient.getBlockBlobClient(uniqueFilePath);

        const mimeType = base64URL.match(/^data:(.*?);base64,/)[1];
        const buffer = Buffer.from(base64URL.split(",")[1], "base64");
        const blobOptions = { blobHTTPHeaders: { blobContentType: mimeType } };
        await blockBlobClient.upload(buffer, buffer.length, blobOptions);
        console.log(`Image uploaded to Azure Blob Storage: ${blockBlobClient.url}`);
        return blockBlobClient.url;
    }
};