// TaskValidation.jsx
import React, { useState, useEffect } from "react";
import { databases, DATABASE_ID, COLLECTIONS } from "../appwrite/config";
import { Query } from "appwrite";
import { format } from "date-fns";
import { useTheme } from "./ColorChange";
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
  
  // Modal states
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Statistics
  const [taskStats, setTaskStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    wellDone: 0
  });

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
        
        // Calculate statistics
        const stats = {
          total: response.documents.length,
          pending: response.documents.filter(task => !task.taskcompleted && !task.perfectstar).length,
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
      setTasks(prevTasks => prevTasks.filter(task => task.$id !== taskId));
      
      // Update statistics
      setTaskStats(prev => ({
        ...prev,
        total: prev.total - 1,
        pending: Math.max(0, prev.pending - 1)
      }));

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
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.$id === taskId 
            ? { ...task, taskcompleted: true, perfectstar: false }
            : task
        )
      );

      // Update statistics
      setTaskStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        completed: prev.completed + 1
      }));

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
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.$id === taskId 
            ? { ...task, taskcompleted: true, perfectstar: true }
            : task
        )
      );

      // Update statistics
      setTaskStats(prev => {
        const wasPending = !tasks.find(t => t.$id === taskId)?.taskcompleted;
        const wasCompleted = tasks.find(t => t.$id === taskId)?.taskcompleted && !tasks.find(t => t.$id === taskId)?.perfectstar;
        
        return {
          ...prev,
          pending: wasPending ? prev.pending - 1 : prev.pending,
          completed: wasCompleted ? prev.completed - 1 : prev.completed,
          wellDone: prev.wellDone + 1
        };
      });

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
  const getUrgencyBadge = (urgency) => {
    if (urgency === 'Critical') {
      return (
        <div className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold inline-block text-center w-20">
          CRITICAL
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
      <div className={`${bgColor} text-white rounded-xl w-9 h-9 flex items-center justify-center font-semibold ${textSize}`}>
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
      statusClass = "border-gray-100 ";
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
        <div className="relative bg-gradient-to-r from-red-600 via-purple-600 to-indigo-600 rounded-lg py-2 px-4 text-white overflow-hidden">
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
        <div className="h-full rounded-lg shadow-xl border-4 border-gray-500 flex flex-col">
          {/* Fixed Header */}
          <div className={`flex-shrink-0 ${currentTheme.name === "dark" ? "bg-zinc-900 text-white border-b border-gray-700" : "bg-gray-300 text-gray-800 border-b border-gray-400"}`}>
            <div className="grid grid-cols-12 gap-2 p-2 font-semibold text-sm">
              <div className="col-span-1 text-center">Urgency 🔥</div>
              <div className="col-span-2 text-center">Task Type</div>
              <div className="col-span-3 text-left pl-4">Task Details 📃</div>
              <div className="col-span-1 text-center">Notes</div>
              <div className="col-span-1 text-center">Due 📅</div>
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
              tasks.map((task, index) => {
                const taskAge = Math.floor((new Date() - new Date(task.$createdAt)) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={task.$id} className={`${getRowClass(index, task)} border-b border-gray-200 dark:border-gray-700`}>
                    <div className="grid grid-cols-12 gap-2 p-2 items-center text-sm min-h-[3rem]">
                      
                      {/* Urgency */}
                      <div className="col-span-1 flex justify-center">
                        {getUrgencyBadge(task.urgency)}
                      </div>

                      {/* Task Type */}
                      <div className="col-span-2 flex justify-center">
                        {getTaskTypeDisplay(task)}
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
                          onClick={() => task.comments ? (setSelectedTask(task), setShowDetailsModal(true)) : null}
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
                      <div className="col-span-1 flex justify-center">
                        {task.taskduedate ? (
                          <div className="bg-red-500 text-xs text-white px-2 py-1 rounded text-center">
                            {format(new Date(task.taskduedate), "d MMM")}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>

                      {/* Assigned To */}
                      <div className="col-span-2 flex items-center justify-center space-x-2">
                        {getInitialsBadge(task.taskownerinitial)}
                        <span className={`${currentTheme.text} text-sm truncate max-w-[100px]`}>
                          {task.taskownername}
                        </span>
                      </div>

                      {/* Task Age */}
                      <div className="col-span-1 flex justify-center">
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

                        {/* View Details */}
                        <button
                          onClick={() => {
                            setSelectedTask(task);
                            setShowDetailsModal(true);
                          }}
                          className="p-2 rounded cursor-pointer bg-gray-600 hover:bg-gray-700 text-white transition-colors"
                          title="View Details"
                        >
                          <Eye size={14} />
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

      {/* Details Modal */}
      {showDetailsModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${currentTheme.cardBg || (currentTheme.name === "dark" ? "bg-gray-800" : "bg-white")} rounded-lg p-6 max-w-md w-full mx-4`}>
            <h3 className={`text-lg font-bold ${currentTheme.text} mb-4`}>Task Details</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Task Name:</label>
                <p className={currentTheme.text}>{selectedTask.taskname}</p>
              </div>
              
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