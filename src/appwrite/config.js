import { Client, Databases } from 'appwrite';

// Create a new client instance
const client = new Client();

// Set the endpoint and project
client.setEndpoint('https://cloud.appwrite.io/v1');
client.setProject('67b0c2af00236694ad12');

// Create Database instance
const databases = new Databases(client);

// Database and Collection IDs from your Appwrite setup
const DATABASE_ID = '67b0c2e000159a42eb66';  // Your database ID
const COLLECTIONS = {
    TASK_DETAILS: '67b0c2f80011be935e90',    // taskdetails collection ID
    USER_DETAILS: '67b0c2ec00079deafbac'     // userdetails collection ID
};

export { client, databases, DATABASE_ID, COLLECTIONS };