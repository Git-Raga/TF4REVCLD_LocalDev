import { databases, DATABASE_ID, COLLECTIONS } from '../appwrite.config';
import React, { useState } from 'react';
import { Query } from 'appwrite';

// Example component using Appwrite
const YourComponent = () => {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);

    // Fetch tasks
    const fetchTasks = async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.TASK_DETAILS
            );
            setTasks(response.documents);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    // Fetch users
    const fetchUsers = async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.USER_DETAILS
            );
            setUsers(response.documents);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    // Example of creating a new task
    const createTask = async (taskData) => {
        try {
            const response = await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.TASK_DETAILS,
                'unique()', // Generates a unique ID
                taskData
            );
            return response;
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    };
 
};