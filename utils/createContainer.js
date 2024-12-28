const { initAzureStorage } = require('./azureStorage');
const { v1: uuidv1 } = require('uuid');

async function createContainer() {
    try {
        // Initialize the blob service client
        const blobServiceClient = await initAzureStorage();

        // Create a unique name for the container
        const containerName = 'quickstart' + uuidv1();

        console.log('\nCreating container...');
        console.log('\t', containerName);

        // Get a reference to a container
        const containerClient = blobServiceClient.getContainerClient(containerName);
        
        // Create the container
        const createContainerResponse = await containerClient.create();
        console.log(
            `Container was created successfully.\n\trequestId:${createContainerResponse.requestId}\n\tURL: ${containerClient.url}`
        );

        // Save the container name for future use
        console.log('\nSave this container name for future use:', containerName);
    } catch (error) {
        console.error('Error creating container:', error.message);
    }
}

// Run the container creation
createContainer();
