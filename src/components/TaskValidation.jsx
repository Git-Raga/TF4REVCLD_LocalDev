// TaskValidation.jsx
import React, { useState, useEffect } from "react";
import { databases, DATABASE_ID, COLLECTIONS } from "../appwrite/config";
import { Query } from "appwrite";
import { format } from "date-fns";
import { useTheme } from "./ColorChange";
import { calculateTaskStats } from "./SortingLogic"; // Only import calculateTaskStats
import { 
CheckCircle, 
Star, 
X, 
Eye, 
RefreshCw,
Search,
MessageSquare,
Trophy,
Award,
MessageSquareMore,
MessageSquareOff
} from "lucide-react";

const TaskValidation = ({ sidebarCollapsed = false }) => {
const { currentTheme } = useTheme();
const [tasks, setTasks] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [processingTaskId, setProcessingTaskId] = useState(null);
const [actionType, setActionType] = useState(''); // 'not_done', 'completed', 'well_done'
const [sortState, setSortState] = useState("default"); // Add sort state for due date sorting

// Modal states
const [selectedTask, setSelectedTask] = useState(null);
const [showDetailsModal, setShowDetailsModal] = useState(false);
const [showCommentsModal, setShowCommentsModal] = useState(false);

// Statistics
const [taskStats, setTaskStats] = useState({
  total: 0,
  pending: 0,
  completed: 0,
  wellDone: 0
});

// Handle due date sorting
const handleDueDateClick = () => {
  // Cycle through: default -> ascending -> descending -> default
  if (sortState === "default") {
    setSortState("asc");
  } else if (sortState === "asc") {
    setSortState("desc");
  } else {
    setSortState("default");
  }
};

// Custom sorting function for validation tasks
const getSortedValidationTasks = (tasks, sortState) => {
  return [...tasks].sort((a, b) => {
    // Check if we're sorting by due date
    if (sortState === "asc" || sortState === "desc") {
      // Handle cases where one or both tasks don't have due dates
      if (!a.taskduedate && !b.taskduedate) {
        // If no due dates, sort by creation date (oldest first)
        return new Date(a.$createdAt) - new Date(b.$createdAt);
      }
      if (!a.taskduedate) return 1; // b comes first
      if (!b.taskduedate) return -1; // a comes first

      // Compare due dates (ascending or descending based on sortState)
      const dateComparison = new Date(a.taskduedate) - new Date(b.taskduedate);
      return sortState === "asc" ? dateComparison : -dateComparison;
    }

    // Default sorting logic (following SortingLogic.jsx prioritization)
    // Helper to determine if task is late
    const isTaskLate = (task) => {
      const dueDate = task.taskduedate ? new Date(task.taskduedate) : null;
      return (
        dueDate &&
        new Date() > dueDate &&
        dueDate.toDateString() !== new Date().toDateString()
      );
    };

    const aIsLate = isTaskLate(a);
    const bIsLate = isTaskLate(b);
    const aIsCritical = a.urgency === "Critical";
    const bIsCritical = b.urgency === "Critical";

    // 1. Critical and late (group them and display based on oldest Due date)
    if (aIsCritical && aIsLate && bIsCritical && bIsLate) {
      return new Date(a.taskduedate) - new Date(b.taskduedate);
    }
    if (aIsCritical && aIsLate) return -1;
    if (bIsCritical && bIsLate) return 1;

    // 2. Normal and Late (group them and display based on oldest Due date)
    if (aIsLate && bIsLate && !aIsCritical && !bIsCritical) {
      return new Date(a.taskduedate) - new Date(b.taskduedate);
    }
    if (aIsLate && !aIsCritical) return -1;
    if (bIsLate && !bIsCritical) return 1;

    // 3. Critical task with due dates (group them and display based on oldest Due date)
    if (aIsCritical && a.taskduedate && bIsCritical && b.taskduedate) {
      return new Date(a.taskduedate) - new Date(b.taskduedate);
    }
    if (aIsCritical && a.taskduedate) return -1;
    if (bIsCritical && b.taskduedate) return 1;

    // 4. Critical task without Due date (oldest first)
    if (aIsCritical && !a.taskduedate && bIsCritical && !b.taskduedate) {
      return new Date(a.$createdAt) - new Date(b.$createdAt);
    }
    if (aIsCritical && !a.taskduedate) return -1;
    if (bIsCritical && !b.taskduedate) return 1;

    // 5. Normal task with due dates (group them and display based on oldest Due date)
    if (!aIsCritical && a.taskduedate && !bIsCritical && b.taskduedate) {
      return new Date(a.taskduedate) - new Date(b.taskduedate);
    }
    if (!aIsCritical && a.taskduedate) return -1;
    if (!bIsCritical && b.taskduedate) return 1;

    // 6. Normal Tasks (without due dates) - oldest first
    if (!aIsCritical && !a.taskduedate && !bIsCritical && !b.taskduedate) {
      return new Date(a.$createdAt) - new Date(b.$createdAt);
    }

    // If we've made it here, sort by creation date (oldest first)
    return new Date(a.$createdAt) - new Date(b.$createdAt);
  });
};

// Fetch all tasks with userdone = true
useEffect(() => {
  const fetchValidationTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all tasks where userdone = true
      const response = await databases.listDocuments(
        DATABASE_ID, 
        COLLECTIONS.TASK_DETAILS, 
        [
          Query.equal("userdone", true),
          Query.orderDesc("$updatedAt"),
          Query.limit(100) // Limit to prevent too many results
        ]
      );

      setTasks(response.documents);
      
      // Calculate custom stats for validation tasks
      const stats = {
        total: response.documents.length,
        pending: response.documents.filter(task => !task.taskcompleted).length,
        completed: response.documents.filter(task => task.taskcompleted && !task.perfectstar).length,
        wellDone: response.documents.filter(task => task.perfectstar).length
      };
      setTaskStats(stats);
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching validation tasks:", err);
      setError("Failed to load validation tasks. Please try again.");
      setLoading(false);
    }
  };

  fetchValidationTasks();
}, []);

// Handle Mark Not Done
const handleMarkNotDone = async (taskId) => {
  try {
    setProcessingTaskId(taskId);
    setActionType('not_done');

    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.TASK_DETAILS,
      taskId,
      { 
        userdone: false,
        taskcompleted: false,
        perfectstar: false
      }
    );

    // Remove task from local state since userdone is now false
    const updatedTasks = tasks.filter(task => task.$id !== taskId);
    setTasks(updatedTasks);
    
    // Update statistics
    const stats = {
      total: updatedTasks.length,
      pending: updatedTasks.filter(task => !task.taskcompleted).length,
      completed: updatedTasks.filter(task => task.taskcompleted && !task.perfectstar).length,
      wellDone: updatedTasks.filter(task => task.perfectstar).length
    };
    setTaskStats(stats);

    setTimeout(() => {
      setProcessingTaskId(null);
      setActionType('');
    }, 500);
  } catch (err) {
    console.error("Error marking task as not done:", err);
    setProcessingTaskId(null);
    setActionType('');
  }
};

// Handle Mark Completed
const handleMarkCompleted = async (taskId) => {
  try {
    setProcessingTaskId(taskId);
    setActionType('completed');

    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.TASK_DETAILS,
      taskId,
      { 
        taskcompleted: true,
        perfectstar: false
      }
    );

    // Update local state
    const updatedTasks = tasks.map(task => 
      task.$id === taskId 
        ? { ...task, taskcompleted: true, perfectstar: false }
        : task
    );
    setTasks(updatedTasks);

    // Update statistics
    const stats = {
      total: updatedTasks.length,
      pending: updatedTasks.filter(task => !task.taskcompleted).length,
      completed: updatedTasks.filter(task => task.taskcompleted && !task.perfectstar).length,
      wellDone: updatedTasks.filter(task => task.perfectstar).length
    };
    setTaskStats(stats);

    setTimeout(() => {
      setProcessingTaskId(null);
      setActionType('');
    }, 500);
  } catch (err) {
    console.error("Error marking task as completed:", err);
    setProcessingTaskId(null);
    setActionType('');
  }
};

// Handle Mark Well Done (5 Star)
const handleMarkWellDone = async (taskId) => {
  try {
    setProcessingTaskId(taskId);
    setActionType('well_done');

    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.TASK_DETAILS,
      taskId,
      { 
        taskcompleted: true,
        perfectstar: true
      }
    );

    // Update local state
    const updatedTasks = tasks.map(task => 
      task.$id === taskId 
        ? { ...task, taskcompleted: true, perfectstar: true }
        : task
    );
    setTasks(updatedTasks);

    // Update statistics
    const stats = {
      total: updatedTasks.length,
      pending: updatedTasks.filter(task => !task.taskcompleted).length,
      completed: updatedTasks.filter(task => task.taskcompleted && !task.perfectstar).length,
      wellDone: updatedTasks.filter(task => task.perfectstar).length
    };
    setTaskStats(stats);

    setTimeout(() => {
      setProcessingTaskId(null);
      setActionType('');
    }, 500);
  } catch (err) {
    console.error("Error marking task as well done:", err);
    setProcessingTaskId(null);
    setActionType('');
  }
};

// Get urgency badge
const getUrgencyBadge = (task) => {
  const urgency = task.urgency;
  const dueDate = task.taskduedate ? new Date(task.taskduedate) : null;
  const today = new Date();
  const isLate = dueDate && today > dueDate && dueDate.toDateString() !== today.toDateString();
  
  if (urgency === 'Critical' && isLate) {
    return (
      <div className="bg-red-800 text-white px-2 py-1 rounded text-xs font-bold inline-block text-center w-24 animate-bounce">
        CRITICAL LATE
      </div>
    );
  } else if (urgency === 'Critical') {
    return (
      <div className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold inline-block text-center w-20">
        CRITICAL
      </div>
    );
  } else if (isLate) {
    return (
      <div className="bg-orange-600 text-white px-2 py-1 rounded text-xs font-bold inline-block text-center w-24 animate-bounce">
        NORMAL LATE
      </div>
    );
  } else {
    return (
      <div className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold inline-block text-center w-20">
        NORMAL
      </div>
    );
  }
};

// Get task type display (updated to show proper categories)
const getTaskTypeDisplay = (task) => {
  if (task.recurringtask) {
    if (task.recurringfreq === 'weekly') {
      return (
        <div className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold inline-block text-center">
          🔁 Weekly
        </div>
      );
    } else if (task.recurringfreq === 'monthly') {
      return (
        <div className="bg-indigo-600 text-white px-2 py-1 rounded text-xs font-bold inline-block text-center">
          🔁 Monthly
        </div>
      );
    } else {
      return (
        <div className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold inline-block text-center">
          🔁 Recurring
        </div>
      );
    }
  } else {
    return (
      <div className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold inline-block text-center">
        ☝ One Time
      </div>
    );
  }
};

// Get status badge
const getStatusBadge = (task) => {
  if (task.perfectstar) {
    return (
      <div className="bg-yellow-500 text-white px-3 py-1 rounded text-xs font-bold inline-block text-center">
        ⭐ WELL DONE
      </div>
    );
  } else if (task.taskcompleted) {
    return (
      <div className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold inline-block text-center">
        ✓ COMPLETED
      </div>
    );
  } else {
    return (
      <div className="bg-orange-600 text-white px-3 py-1 rounded text-xs font-bold inline-block text-center">
        ⏳ PENDING
      </div>
    );
  }
};

// Get initials badge
const getInitialsBadge = (initial) => {
  if (!initial) return null;

  const colorMap = {
    VLM: "bg-pink-600",
    SR: "bg-amber-700", 
    RS: "bg-blue-500",
    PD: "bg-orange-600",
    PK: "bg-green-500",
    NS: "bg-teal-600",
    ES: "bg-yellow-600",
    AK: "bg-violet-600",
    RGV: "bg-blue-700",
    SS: "bg-indigo-600",
    WAS: "bg-emerald-600",
    SPK: "bg-cyan-600",
    PMR: "bg-rose-600",
    MMR: "bg-purple-600",
    HD: "bg-amber-500",
    GG: "bg-lime-600",
    FH: "bg-sky-600",
    MR: "bg-fuchsia-600",
    CR: "bg-orange-500",
    AC: "bg-violet-500"
  };

  const bgColor = colorMap[initial] || "bg-gray-500";
  const textSize = initial.length > 2 ? "text-xs" : "text-sm";

  return (
    <div className={`${bgColor} text-white rounded-sm w-9 h-9 flex items-center justify-center font-semibold ${textSize}`}>
      {initial}
    </div>
  );
};

// Get row class for styling
const getRowClass = (index, task) => {
  const evenRow = currentTheme.name === "dark" ? "bg-gray-800" : "bg-gray-200";
  const oddRow = currentTheme.name === "dark" ? "bg-gray-700" : "bg-gray-100";
  const baseClass = index % 2 === 0 ? evenRow : oddRow;
  
  let statusClass = "";
  if (task.perfectstar) {
    statusClass = "border-l-4 border-yellow-500";
  } else if (task.taskcompleted) {
    statusClass = "border-l-4 border-blue-500";
  } else {
    statusClass = "border-gray-500 ";
  }

  return `${baseClass} ${statusClass} hover:bg-opacity-90 transition duration-150 ease-in-out`;
};

if (loading) {
  return (
    <div className={`flex justify-center items-center h-64 ${currentTheme.text}`}>
      <RefreshCw className="animate-spin mr-2" size={20} />
      Loading validation tasks...
    </div>
  );
}

if (error) {
  return (
    <div className={`text-center p-8 ${currentTheme.text}`}>
      <div className="text-red-500 mb-4">{error}</div>
      <button 
        onClick={() => window.location.reload()} 
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Retry
      </button>
    </div>
  );
}

return (
  <div className="h-screen flex flex-col" style={{height: '86vh', overflow: 'hidden'}}>
    <div className="flex-shrink-0 space-y-2 p-4">
      {/* Header Section with Background Banner */}
      <div className="relative bg-gradient-to-r from-teal-600 via-purple-600 to-indigo-600 rounded-lg py-2 px-4 text-white overflow-hidden">
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gray-100 p-2 rounded-lg">
              <Award size={24} className="text-black" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Task Validation Panel</h2>
            </div>
          </div>
          
          {/* Counter on the right */}
          <div className="text-right">
            <div className="rounded-lg">
              <div className="text-xl font-bold">{taskStats.pending}</div>
              <div className="text-xs text-blue-100">Tasks Pending Verification</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Tasks Table - Fixed height with single scroll */}
    <div className="flex-1 overflow-hidden mx-4 mb-2">
      <div className="h-full rounded-sm shadow-xl border-1 border-gray-500 flex flex-col">
        {/* Fixed Header */}
        <div className={`flex-shrink-0 ${currentTheme.name === "dark" ? "bg-zinc-900 text-white border-b border-gray-700" : "bg-gray-300 text-gray-800 border-b border-gray-400"}`}>
          <div className="grid grid-cols-10 gap-2 p-2 font-bold ">
            <div className="col-span-1 text-center">Urgency 🔥</div>
            <div className="col-span-3 text-left pl-4">Task Details 📃</div>
            <div className="col-span-1 text-center">Notes</div>
            <div 
              className="col-span-1 text-center cursor-pointer hover:bg-opacity-80"
              onClick={handleDueDateClick}
            >
              <div className="flex items-center justify-center space-x-1">
                <span>Due 📅</span>
                {sortState === "asc" && <span>↑</span>}
                {sortState === "desc" && <span>↓</span>}
                {sortState !== "default" && (
                  <span 
                    className="ml-1 text-gray-400 hover:text-red-500 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSortState("default");
                    }}
                  >
                    ✕
                  </span>
                )}
              </div>
            </div>
            <div className="col-span-2 text-center">Assigned to 🙋</div>
            <div className="col-span-1 text-center">Task Age🗓️</div>
            <div className="col-span-1 text-center">Actions ⚙️</div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className={`flex-1 overflow-y-auto ${currentTheme.name === "dark" ? "bg-gray-900" : "bg-white"}`}>
          {tasks.length === 0 ? (
            <div className={`flex flex-col items-center justify-center h-full ${currentTheme.text}`}>
              <Trophy size={48} className="mb-4 text-gray-400" />
              <p className="text-lg">No tasks found for validation</p>
              <p className="text-sm text-gray-500 mt-2">
                Tasks marked as "User Done" will appear here for SuperAdmin validation
              </p>
            </div>
          ) : (
            // Use the custom sorting function for validation tasks
            getSortedValidationTasks(tasks, sortState).map((task, index) => {
              const taskAge = Math.floor((new Date() - new Date(task.$createdAt)) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={task.$id} className={`${getRowClass(index, task)} border-b border-gray-200 dark:border-gray-700`}>
                  <div className="grid grid-cols-10 gap-2 p-2 items-center text-sm min-h-[3rem]">
                    
                    {/* Urgency */}
                    <div className="col-span-1 flex justify-center">
                      {getUrgencyBadge(task)}
                    </div>

                    {/* Task Details */}
                    <div className="col-span-3 pl-4">
                      <p className={`${currentTheme.text} truncate font-medium`} title={task.taskname}>
                        {task.taskname}
                      </p>
                    </div>

                    {/* Comments/Notes Column */}
                    <div className="col-span-1 flex justify-center">
                      <button
                        onClick={() => task.comments ? (setSelectedTask(task), setShowCommentsModal(true)) : null}
                        className={`${
                          task.comments
                            ? "cursor-pointer hover:text-blue-500"
                            : "cursor-not-allowed opacity-70"
                        }`}
                        title={task.comments ? "View Notes" : "No Notes Available"}
                        disabled={!task.comments}
                      >
                        {task.comments ? (
                          <MessageSquareMore size={18} className="text-blue-500" />
                        ) : (
                          <MessageSquareOff size={18} className="text-gray-400" />
                        )}
                      </button>
                    </div>

                    {/* Due Date */}
                    <div className="col-span-1 flex justify-start pl-10">
                      {task.taskduedate ? (
                        <div className="bg-red-500 text-xs text-white px-2 py-1 rounded text-center w-16">
                          {format(new Date(task.taskduedate), "d MMM")}
                        </div>
                      ) : (
                        <div className="text-gray-400 text-center w-16">-</div>
                      )}
                    </div>

                    {/* Assigned To */}
                    <div className="col-span-2 flex items-center justify-start pl-25 space-x-2">
                      {getInitialsBadge(task.taskownerinitial)}
                      <span className={`${currentTheme.text} text-sm truncate max-w-[100px]`}>
                        {task.taskownername}
                      </span>
                    </div>

                    {/* Task Age */}
                    <div className="col-span-1 flex pl-5 justify-center">
                      <div className={`${currentTheme.name === "dark" ? "bg-gray-200 text-gray-900" : "bg-gray-800 text-white"} px-2 py-1 rounded text-xs text-center`}>
                        {taskAge} Days
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="col-span-1 flex justify-center space-x-1">
                      
                      {/* Mark Not Done */}
                      <button
                        onClick={() => handleMarkNotDone(task.$id)}
                        disabled={processingTaskId === task.$id && actionType === 'not_done'}
                        className={`p-2 rounded cursor-pointer ${
                          processingTaskId === task.$id && actionType === 'not_done'
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700'
                        } text-white transition-colors`}
                        title="Mark Not Done"
                      >
                        {processingTaskId === task.$id && actionType === 'not_done' ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <X size={14} />
                        )}
                      </button>
                      
                      {/* Mark Completed */}
                      <button
                        onClick={() => handleMarkCompleted(task.$id)}
                        disabled={processingTaskId === task.$id && actionType === 'completed'}
                        className={`p-2 rounded cursor-pointer ${
                          processingTaskId === task.$id && actionType === 'completed'
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                        } text-white transition-colors`}
                        title="Mark Completed"
                      >
                        {processingTaskId === task.$id && actionType === 'completed' ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <CheckCircle size={14} />
                        )}
                      </button>

                      {/* Mark Well Done (5 Star) */}
                      <button
                        onClick={() => handleMarkWellDone(task.$id)}
                        disabled={processingTaskId === task.$id && actionType === 'well_done'}
                        className={`p-2 rounded cursor-pointer ${
                          processingTaskId === task.$id && actionType === 'well_done'
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-yellow-600 hover:bg-yellow-700'
                        } text-white transition-colors`}
                        title="Mark Well Done (5 Star)"
                      >
                        {processingTaskId === task.$id && actionType === 'well_done' ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <Star size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>

    {/* Comments Modal */}
    {showCommentsModal && selectedTask && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`${currentTheme.cardBg || (currentTheme.name === "dark" ? "bg-gray-800" : "bg-white")} rounded-lg p-6 max-w-lg w-full mx-4`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-bold ${currentTheme.text}`}>Task Notes</h3>
            <button
              onClick={() => setShowCommentsModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="mb-4">
            <p className={`text-sm font-medium ${currentTheme.text} mb-2`}>
              Task: {selectedTask.taskname}
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className={`${currentTheme.text} text-sm leading-relaxed whitespace-pre-wrap`}>
              {selectedTask.comments}
            </p>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={() => setShowCommentsModal(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Details Modal */}
    {showDetailsModal && selectedTask && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`${currentTheme.cardBg || (currentTheme.name === "dark" ? "bg-gray-800" : "bg-white")} rounded-lg p-6 max-w-md w-full mx-4`}>
          <h3 className={`text-lg font-bold ${currentTheme.text} mb-4`}>Task Details</h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Type:</label>
              <p className={currentTheme.text}>
                {selectedTask.recurringtask ? 
                  (selectedTask.recurringfreq === 'weekly' ? 'Weekly Recurring' :
                   selectedTask.recurringfreq === 'monthly' ? 'Monthly Recurring' :
                   'Recurring Task') : 'One Time Task'}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Urgency:</label>
              <p className={currentTheme.text}>{selectedTask.urgency || 'Normal'}</p>
            </div>
            
            {selectedTask.taskownername && (
              <div>
                <label className="text-sm font-medium text-gray-500">Owner:</label>
                <p className={currentTheme.text}>{selectedTask.taskownername}</p>
              </div>
            )}
            
            {selectedTask.comments && (
              <div>
                <label className="text-sm font-medium text-gray-500">Comments:</label>
                <p className={`${currentTheme.text} bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm`}>
                  {selectedTask.comments}
                </p>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-gray-500">Current Status:</label>
              <div className="mt-1">
                {getStatusBadge(selectedTask)}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowDetailsModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default TaskValidation;  