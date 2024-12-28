const { BlobServiceClient } = require("@azure/storage-blob");
const { v1: uuidv1 } = require("uuid");
require("dotenv").config();

async function initAzureStorage() {
  try {
    console.log("Initializing Azure Blob storage client");

    const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;

    if (!AZURE_STORAGE_CONNECTION_STRING) {
      throw Error('Azure Storage Connection string not found');
    }

    // Create the BlobServiceClient object with connection string
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );

    return blobServiceClient;
  } catch (err) {
    console.error(`Error initializing Azure Storage: ${err.message}`);
    throw err;
  }
}

module.exports = {
  initAzureStorage,
  generateBlobName: () => uuidv1()
};
