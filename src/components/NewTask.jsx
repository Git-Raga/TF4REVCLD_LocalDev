import React, { useState, useEffect } from 'react';
import { Client, Databases, Query } from 'appwrite';
import { format } from 'date-fns';

const NewTask = () => {
  // Initialize state for form fields
  const [taskName, setTaskName] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [dueDate, setDueDate] = useState('');
  const [taskOwner, setTaskOwner] = useState('');
  const [userOptions, setUserOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Appwrite client
  const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1') // Replace with your API endpoint
    .setProject('Your Project ID'); // Replace with your project ID

  const databases = new Databases(client);

  // Fetch user details from the database
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await databases.listDocuments(
          'Revcldb', // Database ID from your image
          'userdetails', // Collection ID from your image
          [Query.limit(100)]
        );
        
        const users = response.documents.map(user => ({
          id: user.$id,
          name: user.username,
          email: user.useremail
        }));
        
        setUserOptions(users);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again.');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!taskName || !taskOwner) {
      setError('Task name and owner are required fields');
      return;
    }

    try {
      // Get selected user details
      const selectedUser = userOptions.find(user => user.id === taskOwner);
      
      // Create new task document
      const response = await databases.createDocument(
        'Revcldb', // Database ID
        'taskdetails', // Collection ID for tasks - replace with your actual collection ID
        'unique()', // Generate unique ID
        {
          taskname: taskName,
          taskownername: selectedUser.name,
          taskownerininitial: selectedUser.name.charAt(0),
          taskemail: selectedUser.email,
          taskduedate: dueDate || null,
          userdone: false,
          taskcompleted: false,
          perfectstar: false,
          urgency: urgency === 'critical' ? true : false
        }
      );
      
      // Reset form after successful submission
      setTaskName('');
      setUrgency('normal');
      setDueDate('');
      setTaskOwner('');
      setError(null);
      
      // Show success message or redirect
      alert('Task created successfully!');
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create task. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Create New Task</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Task Name */}
        <div className="mb-6">
          <label htmlFor="taskName" className="block text-gray-700 text-lg font-semibold mb-2">
            Task Name*
          </label>
          <input
            type="text"
            id="taskName"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter task name"
            required
          />
        </div>
        
        {/* Urgency Toggle */}
        <div className="mb-6">
          <label className="block text-gray-700 text-lg font-semibold mb-2">
            Urgency
          </label>
          <div className="flex items-center space-x-4">
            <div 
              className={`px-4 py-2 rounded-lg cursor-pointer ${
                urgency === 'normal' 
                  ? 'bg-green-100 border-2 border-green-500 text-green-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}
              onClick={() => setUrgency('normal')}
            >
              <span className="font-medium">Normal</span>
            </div>
            <div 
              className={`px-4 py-2 rounded-lg cursor-pointer ${
                urgency === 'critical' 
                  ? 'bg-red-100 border-2 border-red-500 text-red-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}
              onClick={() => setUrgency('critical')}
            >
              <span className="font-medium">Critical</span>
            </div>
          </div>
        </div>
        
        {/* Due Date */}
        <div className="mb-6">
          <label htmlFor="dueDate" className="block text-gray-700 text-lg font-semibold mb-2">
            Due Date
          </label>
          <input
            type="datetime-local"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* Task Owner */}
        <div className="mb-8">
          <label htmlFor="taskOwner" className="block text-gray-700 text-lg font-semibold mb-2">
            Task Owner*
          </label>
          {loading ? (
            <div className="w-full px-4 py-3 bg-gray-100 rounded-lg">Loading users...</div>
          ) : (
            <select
              id="taskOwner"
              value={taskOwner}
              onChange={(e) => setTaskOwner(e.target.value)}
              className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Task Owner</option>
              {userOptions.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          )}
        </div>
        
        {/* Save Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
        >
          Save Task
        </button>
      </form>
    </div>
  );
};

export default NewTask;