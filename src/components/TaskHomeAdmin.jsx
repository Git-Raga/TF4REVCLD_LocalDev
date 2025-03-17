import React, { useState, useEffect } from "react";
import { databases, DATABASE_ID, COLLECTIONS } from "../appwrite/config";
import { Query } from "appwrite";
import { Star, Edit, Trash2, Check, ArrowUp, Calendar, Award, UserCheck } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useTheme } from "./ColorChange";

const TaskHomeAdmin = () => {
  const { currentTheme } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tasks from database
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.TASK_DETAILS,
          [Query.limit(100)]
        );

        setTasks(response.documents);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Failed to load tasks. Please try again.");
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Function to determine days remaining or days passed
  const getDaysInfo = (dueDate) => {
    if (!dueDate) return { days: null, text: "" };
    
    const today = new Date();
    const due = new Date(dueDate);
    const days = differenceInDays(due, today);
    
    if (days === 0) return { days: 0, text: "Today" };
    if (days < 0) return { days: Math.abs(days), text: "Days" };
    return { days: days, text: "Days" };
  };

  // Generate the task initials badge with background color
  const getInitialsBadge = (initial) => {
    if (!initial) return null;
    
    // Generate a consistent color based on the initials
    const colorMap = {
      'AM': 'bg-red-500',
      'SK': 'bg-amber-700',
      'MP': 'bg-blue-500',
      // Add more mappings as needed
    };
    
    // Default color if not found in map
    const bgColor = colorMap[initial] || 'bg-gray-500';
    
    return (
      <div className={`${bgColor} text-white rounded-full w-10 h-10 flex items-center justify-center font-semibold`}>
        {initial}
      </div>
    );
  };

  // Determine urgency badge color and text
  const getUrgencyBadge = (urgency, isLate) => {
    let bgColor, textColor, icon, text;
    
    if (urgency === "Critical") {
      bgColor = "bg-red-600";
      textColor = "text-white";
      text = "CRITICAL";
    } else if (isLate) {
      bgColor = "bg-red-500";
      textColor = "text-white";
      text = "NORMAL-LATE";
    } else {
      bgColor = "bg-green-600";
      textColor = "text-white";
      text = "NORMAL";
    }
    
    return (
      <div className={`${bgColor} ${textColor} px-3 py-1 rounded text-xs font-bold inline-flex items-center`}>
        <span className="ml-1">{text}</span>
      </div>
    );
  };

  // Get task age badge
  const getTaskAgeBadge = (days) => {
    return (
      <div className="bg-gray-800 text-white px-3 py-1 rounded flex items-center justify-center">
        <span className="mr-1">{days}</span>
        <span>Days</span>
      </div>
    );
  };

  // Get due date badge
  const getDueDateBadge = (dueDate) => {
    if (!dueDate) return null;
    
    const date = new Date(dueDate);
    const formattedDate = format(date, "d MMM");
    
    return (
      <div className="bg-red-500 text-white px-3 py-1 rounded text-sm">
        {formattedDate}
      </div>
    );
  };

  // Determine task row color based on theme
  const getRowClass = (index) => {
    const baseClass = "p-3 transition duration-150 ease-in-out hover:bg-opacity-90 flex items-center";
    const evenRow = currentTheme.name === "dark" ? "bg-gray-800" : "bg-gray-200";
    const oddRow = currentTheme.name === "dark" ? "bg-gray-700" : "bg-gray-100";
    
    return `${baseClass} ${index % 2 === 0 ? evenRow : oddRow}`;
  };

  // Theme-dependent styles
  const headerClass = currentTheme.name === "dark" 
    ? "bg-gray-900 text-white p-3 grid grid-cols-6 gap-4 border-b border-gray-700" 
    : "bg-gray-300 text-gray-800 p-3 grid grid-cols-6 gap-4 border-b border-gray-400";

  const containerClass = currentTheme.name === "dark"
    ? "bg-gray-900 rounded-lg shadow-xl overflow-hidden border border-gray-700 max-w-7xl mx-auto mt-8"
    : "bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 max-w-7xl mx-auto mt-8";

  if (loading) {
    return <div className="text-center py-10">Loading tasks...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className={containerClass}>
      {/* Table Header */}
      <div className={headerClass}>
        <div className="flex items-center space-x-2">
          <span>Urgency</span>
          <ArrowUp size={14} />
        </div>
        <div className="flex items-center space-x-2 col-span-2">
          <span>Task Details</span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <span>Due</span>
          <Calendar size={14} />
        </div>
        <div className="flex items-center justify-center space-x-2">
          <span>Perfect</span>
          <Star size={14} />
        </div>
        <div className="flex items-center justify-between col-span-1">
          <div className="flex items-center space-x-2">
            <span>Assigned to</span>
            <UserCheck size={14} />
          </div>
          <div className="flex items-center space-x-2">
            <span>Task Age</span>
          </div>
        </div>
      </div>

      {/* Task Rows */}
      <div>
        {tasks.length === 0 ? (
          <div className="text-center py-10">No tasks found.</div>
        ) : (
          tasks.map((task, index) => {
            const dueDate = task.taskduedate ? new Date(task.taskduedate) : null;
            const isLate = dueDate && new Date() > dueDate;
            
            // Calculate task age (from creation date to now)
            const createdAt = new Date(task.$createdAt);
            const taskAge = differenceInDays(new Date(), createdAt);
            
            return (
              <div key={task.$id} className={getRowClass(index)}>
                {/* Urgency */}
                <div className="flex-none w-40">
                  {getUrgencyBadge(task.urgency, isLate)}
                </div>
                
                {/* Task Details */}
                <div className="flex-grow col-span-2 mr-4">
                  <p className={`${currentTheme.text} font-medium`}>{task.taskname}</p>
                </div>
                
                {/* Due Date */}
                <div className="flex-none w-24 flex justify-center">
                  {task.taskduedate && getDueDateBadge(task.taskduedate)}
                </div>
                
                {/* Perfect Star */}
                <div className="flex-none w-24 flex justify-center">
                  <Star 
                    size={20} 
                    className={task.perfectstar ? "text-yellow-500 fill-yellow-500" : "text-gray-400"}
                  />
                </div>
                
                {/* Assigned To & Task Age */}
                <div className="flex-none w-60 grid grid-cols-2 gap-4 justify-items-center items-center">
                  {/* Owner Initials */}
                  <div className="flex items-center space-x-2">
                    {getInitialsBadge(task.taskownerinitial)}
                    <span className={`${currentTheme.text} ml-2`}>{task.taskownername}</span>
                  </div>
                  
                  {/* Task Age */}
                  <div>
                    {getTaskAgeBadge(taskAge)}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex-none ml-auto flex items-center space-x-2">
                  <button 
                    className="p-2 text-green-500 hover:bg-green-100 hover:bg-opacity-20 rounded-full"
                    aria-label="Mark complete"
                  >
                    <Check size={18} />
                  </button>
                  <button 
                    className="p-2 text-blue-500 hover:bg-blue-100 hover:bg-opacity-20 rounded-full"
                    aria-label="Edit task"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    className="p-2 text-red-500 hover:bg-red-100 hover:bg-opacity-20 rounded-full"
                    aria-label="Delete task"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TaskHomeAdmin;