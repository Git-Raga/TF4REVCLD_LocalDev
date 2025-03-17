import React, { useState, useEffect } from "react";
import { databases, DATABASE_ID, COLLECTIONS } from "../appwrite/config";
import { Query } from "appwrite";
import { Star, Edit, Check, Calendar, ArrowUp, Filter } from "lucide-react";
import { format, differenceInDays } from "date-fns";

const TaskHomeUser = ({ theme }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInitials, setUserInitials] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // "all", "pending", "completed"

  // Fetch tasks from database for the current user only
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        
        // Get current user info from localStorage
        const storedUser = localStorage.getItem('user');
        let userId = null;
        let userEmail = null;
        
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          userId = userData.id;
          userEmail = userData.useremail;
          setUserInitials(userData.initials || userData.username?.charAt(0) || "U");
        }
        
        if (!userEmail) {
          throw new Error("User information not found");
        }
        
        // Query tasks assigned to this user
        const queryArray = [
          Query.equal("taskowneremail", userEmail),
          Query.limit(100)
        ];
        
        if (filterStatus !== "all") {
          queryArray.push(Query.equal("taskcompleted", filterStatus === "completed"));
        }

        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.TASK_DETAILS,
          queryArray
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
  }, [filterStatus]);

  // Handle mark as complete
  const handleCompleteTask = async (taskId, isCompleted) => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.TASK_DETAILS,
        taskId,
        {
          taskcompleted: !isCompleted
        }
      );
      
      // Update local state
      setTasks(tasks.map(task => 
        task.$id === taskId ? {...task, taskcompleted: !isCompleted} : task
      ));
      
    } catch (err) {
      console.error("Error updating task:", err);
      alert("Failed to update task status. Please try again.");
    }
  };

  // Function to determine task status styling
  const getTaskStatusClass = (task) => {
    if (task.taskcompleted) {
      return "line-through opacity-60";
    }
    
    // Check if task is late
    if (task.taskduedate && new Date() > new Date(task.taskduedate)) {
      return "font-bold text-red-500";
    }
    
    return "";
  };

  // Render urgency badge
  const renderUrgencyBadge = (task) => {
    const isLate = task.taskduedate && new Date() > new Date(task.taskduedate);
    
    if (task.urgency === "Critical") {
      return (
        <div className="bg-red-600 text-white px-3 py-1 rounded-md text-xs font-bold">
          CRITICAL
        </div>
      );
    } else if (isLate) {
      return (
        <div className="bg-red-500 text-white px-3 py-1 rounded-md text-xs font-bold">
          NORMAL-LATE
        </div>
      );
    } else {
      return (
        <div className="bg-green-600 text-white px-3 py-1 rounded-md text-xs font-bold">
          NORMAL
        </div>
      );
    }
  };

  // Calculate days left or overdue
  const calculateDaysRemaining = (dueDate) => {
    if (!dueDate) return null;
    
    const today = new Date();
    const due = new Date(dueDate);
    const days = differenceInDays(due, today);
    
    if (days < 0) {
      return `${Math.abs(days)} days overdue`;
    } else if (days === 0) {
      return "Due today";
    } else {
      return `${days} days left`;
    }
  };

  // Sort tasks by urgency and due date
  const sortedTasks = [...tasks].sort((a, b) => {
    // First sort by completion status
    if (a.taskcompleted && !b.taskcompleted) return 1;
    if (!a.taskcompleted && b.taskcompleted) return -1;
    
    // Then by urgency (Critical first)
    if (a.urgency === "Critical" && b.urgency !== "Critical") return -1;
    if (a.urgency !== "Critical" && b.urgency === "Critical") return 1;
    
    // Then by due date
    if (a.taskduedate && b.taskduedate) {
      return new Date(a.taskduedate) - new Date(b.taskduedate);
    }
    
    // Tasks without due dates go last
    if (a.taskduedate && !b.taskduedate) return -1;
    if (!a.taskduedate && b.taskduedate) return 1;
    
    return 0;
  });

  if (loading) {
    return <div className="text-center py-10">Loading your tasks...</div>;
  }

  if (error) {
    return <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-bold ${theme.text}`}>My Tasks</h1>
        
        {/* Filter */}
        <div className="flex items-center">
          <Filter size={16} className={`mr-2 ${theme.text}`} />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`${theme.name === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border ${theme.borderColor} rounded p-1`}
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {sortedTasks.length === 0 ? (
        <div className={`text-center py-10 ${theme.text}`}>
          <p className="text-lg">You don't have any tasks assigned to you yet.</p>
          <p className="text-sm mt-2">Tasks assigned to you will appear here.</p>
        </div>
      ) : (
        <div className={`grid gap-4 ${theme.text}`}>
          {sortedTasks.map((task) => (
            <div 
              key={task.$id} 
              className={`p-4 rounded-lg border ${theme.borderColor} ${theme.name === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow hover:shadow-md transition-shadow`}
            >
              <div className="flex justify-between">
                <div className="flex-1">
                  {/* Urgency Badge */}
                  <div className="mb-2">
                    {renderUrgencyBadge(task)}
                  </div>
                  
                  {/* Task Name */}
                  <h2 className={`text-lg font-medium mb-2 ${getTaskStatusClass(task)}`}>
                    {task.taskname}
                  </h2>
                  
                  {/* Due Date */}
                  {task.taskduedate && (
                    <div className="flex items-center text-sm">
                      <Calendar size={14} className="mr-1" />
                      <span className="mr-2">
                        Due: {format(new Date(task.taskduedate), "MMM d, yyyy")}
                      </span>
                      <span className={new Date() > new Date(task.taskduedate) ? "text-red-500" : "text-green-500"}>
                        ({calculateDaysRemaining(task.taskduedate)})
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleCompleteTask(task.$id, task.taskcompleted)}
                    className={`p-2 rounded-full ${task.taskcompleted ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-600'} hover:opacity-80`}
                    title={task.taskcompleted ? "Mark as incomplete" : "Mark as complete"}
                  >
                    <Check size={18} />
                  </button>
                  
                  {/* Perfect Star */}
                  {task.perfectstar && (
                    <div className="flex items-center">
                      <Star className="text-yellow-500 fill-yellow-500" size={18} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskHomeUser;