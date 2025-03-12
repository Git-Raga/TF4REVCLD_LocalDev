import React, { useState, useEffect } from 'react';
import { Query, ID } from 'appwrite';
import { format } from 'date-fns';
import { PlusSquare, UserCheck } from 'lucide-react';
import { useTheme } from './ColorChange'; // Import useTheme hook
import { databases, DATABASE_ID, COLLECTIONS } from "../appwrite/config";

const NewTask = () => {
  // Get theme from context
  const { currentTheme } = useTheme();
  
  // Initialize state for form fields
  const [taskName, setTaskName] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [hasDueDate, setHasDueDate] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [taskOwner, setTaskOwner] = useState('');
  const [userOptions, setUserOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Fetch user details from the database
  //TEST after new laptop
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.USER_DETAILS,
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
      setAuthLoading(true);
      // Get selected user details
      const selectedUser = userOptions.find(user => user.id === taskOwner);
      
      // Check if we have the user data before proceeding
      if (!selectedUser) {
        setError('Selected user not found. Please refresh and try again.');
        setAuthLoading(false);
        return;
      }
      
      // Create new task document with explicit permissions
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.TASK_DETAILS,
        ID.unique(), // Generate unique ID using Appwrite's ID utility
        {
          taskname: taskName,
          taskownername: selectedUser.name,
          taskownerinitial: selectedUser.name.charAt(0),
          taskowneremail: selectedUser.email,
          taskduedate: hasDueDate ? dueDate : null,
          userdone: false,
          taskcompleted: false,
          perfectstar: false,
          urgency: urgency === 'critical' ? "Critical" : "Normal" ,
         
        }
      );
      
      // Reset form after successful submission
      setTaskName('');
      setUrgency('normal');
      setHasDueDate(false);
      setDueDate('');
      setTaskOwner('');
      setError(null);
      
      // Show success message or redirect
      alert('Task assigned successfully!');
    } catch (err) {
      console.error('Error creating task:', err);
      // Provide more specific error message based on error type
      if (err.code === 401) {
        setError('Authentication error: Please log in again to create tasks.');
      } else if (err.code === 403) {
        setError('Permission denied: You do not have permission to create tasks.');
      } else {
        setError(`Failed to assign task: ${err.message}`);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Setup theme-dependent styles
  const containerClass = currentTheme.name === 'dark' 
    ? `max-w-3xl mx-auto mt-10 p-6 ${currentTheme.cardBackground} rounded-lg shadow-lg`
    : 'max-w-3xl mx-auto p-6 mt-10 bg-gray-100 rounded-lg shadow-lg';
  
  const labelClass = currentTheme.name === 'dark' 
    ? `block ${currentTheme.text} text-lg font-semibold mb-2`
    : 'block text-gray-700 text-lg font-semibold mb-2';
  
  const inputClass = currentTheme.name === 'dark'
    ? `w-full px-4 py-3 ${currentTheme.text} bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`
    : 'w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';
  
  const selectClass = currentTheme.name === 'dark'
    ? `px-4 py-3 ${currentTheme.text} bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`
    : 'px-4 py-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';
  
  const errorClass = currentTheme.name === 'dark'
    ? 'mb-4 p-3 bg-red-900 border border-red-800 text-red-200 rounded'
    : 'mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded';
  
  const radioClass = currentTheme.name === 'dark'
    ? `px-3 py-2 rounded-lg cursor-pointer text-sm`
    : 'px-3 py-2 rounded-lg cursor-pointer text-sm';
  
  const radioActiveClassNormal = currentTheme.name === 'dark'
    ? 'bg-green-800 border-2 border-green-600 text-green-100'
    : 'bg-green-100 border-2 border-green-500 text-green-700';
  
  const radioInactiveClass = currentTheme.name === 'dark'
    ? 'bg-gray-700 text-gray-300'
    : 'bg-gray-100 text-gray-600';
  
  const radioActiveClassCritical = currentTheme.name === 'dark'
    ? 'bg-red-900 border-2 border-red-600 text-red-100'
    : 'bg-red-100 border-2 border-red-500 text-red-700';
  
  const buttonClass = currentTheme.name === 'dark'
    ? 'w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-3 px-6 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 flex items-center justify-center'
    : 'w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 flex items-center justify-center';

  const iconColor = currentTheme.name === 'dark' ? 'white' : 'currentColor';

  return (
    <div className={containerClass}>
      <div className="flex items-center justify-center flex-col mb-6 ">
        <h1 className={`text-3xl font-bold ${currentTheme.text} mb-4 text-center`}>Create New Task</h1>
        <PlusSquare size={68} className={currentTheme.text} />
      </div>
      
      {error && (
        <div className={errorClass}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Task Name */}
        <div className="mb-6 text-2xl">
          <label htmlFor="taskName" className={labelClass}>
            Task Name
          </label>
          <input
            type="text"
            id="taskName"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className={inputClass}
            placeholder="Enter task name"
            required
          />
        </div>
      {/* Inline Section for Task Owner, Urgency, and Due Date */}
<div className="mb-6 grid grid-cols-1 items-center md:grid-cols-3 gap-4">
 
{/* Task Owner */}
<div className="text-center p-2 border rounded-lg shadow-sm" style={{ borderColor: currentTheme.name === 'dark' ? '#4B5563' : '#E5E7EB' }}>
  <label htmlFor="taskOwner" className={`${labelClass} text-center`}>
    Task Owner
  </label>
  <div>
    {loading ? (
      <div className={`px-4 py-3 ${currentTheme.name === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg ${currentTheme.text}`}>Loading...</div>
    ) : (
      <select
        id="taskOwner"
        value={taskOwner}
        onChange={(e) => setTaskOwner(e.target.value)}
        className={`${selectClass} ${currentTheme.text}`}
        style={{
          backgroundColor: currentTheme.name === 'dark' ? '#374151' : '#fff',
          color: currentTheme.name === 'dark' ? 'white' : 'black'
        }}
        required
      >
        <option value="" style={{ backgroundColor: currentTheme.name === 'dark' ? '#374151' : '#fff' }}>Select Owner</option>
        {userOptions.map((user) => (
          <option 
            key={user.id} 
            value={user.id}
            style={{ backgroundColor: currentTheme.name === 'dark' ? '#374151' : '#fff', color: currentTheme.name === 'dark' ? 'white' : 'black' }}
          >
            {user.name}
          </option>
        ))}
      </select>
    )}
  </div>
</div>
  
  {/* Urgency Toggle */}
  <div className="text-center p-3 border rounded-lg shadow-sm" style={{ borderColor: currentTheme.name === 'dark' ? '#4B5563' : '#E5E7EB' }}>
    <label className={`${labelClass} text-center`}>
      Urgency
    </label>
    <div className="flex items-center justify-center space-x-2">
      <div 
        className={`${radioClass} ${
          urgency === 'normal' 
            ? radioActiveClassNormal
            : radioInactiveClass
        }`}
        onClick={() => setUrgency('normal')}
      >
        <span className="font-medium">Normal</span>
      </div>
      <div 
        className={`${radioClass} ${
          urgency === 'critical' 
            ? radioActiveClassCritical
            : radioInactiveClass
        }`}
        onClick={() => setUrgency('critical')}
      >
        <span className="font-medium">Critical</span>
      </div>
    </div>
  </div>
  
  {/* Due Date with Radio Button */}
  <div className="text-center p-3 border rounded-lg shadow-sm" style={{ borderColor: currentTheme.name === 'dark' ? '#4B5563' : '#E5E7EB' }}>
    <label className={`${labelClass} text-center`}>
      Has a due date?
    </label>
    <div className="flex items-center justify-center space-x-2">
      <div 
        className={`${radioClass} ${
          !hasDueDate
            ? radioActiveClassNormal
            : radioInactiveClass
        }`}
        onClick={() => setHasDueDate(false)}
      >
        <span className="font-medium">No</span>
      </div>
      <div 
        className={`${radioClass} ${
          hasDueDate 
            ? radioActiveClassNormal
            : radioInactiveClass
        }`}
        onClick={() => setHasDueDate(true)}
      >
        <span className="font-medium">Yes</span>
      </div>
    </div>
  </div>
</div>  
        {/* Assign Task Button with UserCheck icon */}
        <button
          type="submit"
          disabled={authLoading}
          className={buttonClass}
        >
          <UserCheck size={20} className="mr-2" color={iconColor} />
          {authLoading ? 'Assigning...' : 'Assign Task'}
        </button>
      </form>
    </div>
  );
};

export default NewTask;