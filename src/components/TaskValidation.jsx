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
  Award
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

  // Get task category
  const getTaskCategory = (task) => {
    if (task.recurringtask) {
      if (task.recurringfreq === 'weekly') {
        return { text: 'Weekly Recurring', color: 'bg-blue-600' };
      } else if (task.recurringfreq === 'monthly') {
        return { text: 'Monthly Recurring', color: 'bg-purple-600' };
      } else {
        return { text: 'Recurring', color: 'bg-indigo-600' };
      }
    } else {
      return { text: 'One Time', color: 'bg-green-600' };
    }
  };

  // Get urgency badge
  const getUrgencyBadge = (urgency) => {
    if (urgency === 'Critical') {
      return (
        <div className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold inline-block text-center">
          CRITICAL
        </div>
      );
    } else {
      return (
        <div className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold inline-block text-center">
          NORMAL
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
      statusClass = "border-l-4 border-orange-500";
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
    <div className="overflow-x-auto">
      <div className="relative max-w-full mx-auto">
        
        {/* Header Section */}
        <div className={`mb-6 p-4 rounded-lg ${currentTheme.cardBg}`}>
          <div className="flex items-center space-x-3">
            <Search size={24} className={currentTheme.text} />
            <h2 className={`text-2xl font-bold ${currentTheme.text}`}>
              Task Validation Center
            </h2>
          </div>
        </div>

        {/* Tasks Table */}
        <div className={`rounded-lg overflow-hidden ${currentTheme.cardBg}`}>
          {/* Table Header */}
          <div className={`${currentTheme.name === 'dark' ? 'bg-gray-900' : 'bg-gray-800'} text-white`}>
            <div className="grid grid-cols-12 gap-2 p-4 font-semibold text-sm">
              <div className="col-span-1">SL</div>
              <div className="col-span-1">Task Type</div>
              <div className="col-span-1">Urgency</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Task Name</div>
              <div className="col-span-1">Notes</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-3">Action Section</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="max-h-96 overflow-y-auto">
            {tasks.length === 0 ? (
              <div className={`p-8 text-center ${currentTheme.text}`}>
                <Trophy size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-lg">No tasks found for validation</p>
                <p className="text-sm text-gray-500 mt-2">
                  Tasks marked as "User Done" will appear here for SuperAdmin validation
                </p>
              </div>
            ) : (
              tasks.map((task, index) => {
                const category = getTaskCategory(task);
                return (
                  <div key={task.$id} className={getRowClass(index, task)}>
                    <div className="grid grid-cols-12 gap-2 p-4 items-center text-sm">
                      
                      {/* SL (Serial Number) */}
                      <div className="col-span-1">
                        <div className={`font-medium ${currentTheme.text}`}>
                          {index + 1}
                        </div>
                      </div>

                      {/* Task Type */}
                      <div className="col-span-1">
                        <div className={`text-xs px-2 py-1 rounded ${category.color} text-white text-center`}>
                          {task.recurringtask ? '🔁' : '☝'}
                        </div>
                      </div>

                      {/* Urgency */}
                      <div className="col-span-1">
                        {getUrgencyBadge(task.urgency)}
                      </div>

                      {/* Category */}
                      <div className="col-span-2">
                        <div className={`text-xs px-2 py-1 rounded ${category.color} text-white text-center`}>
                          {category.text}
                        </div>
                      </div>

                      {/* Task Name */}
                      <div className="col-span-2">
                        <div className={`font-medium ${currentTheme.text} truncate`} title={task.taskname}>
                          {task.taskname}
                        </div>
                        {task.recurringtask && task.recurringday && (
                          <div className="text-xs text-gray-500 mt-1">
                            {task.recurringday}
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      <div className="col-span-1 text-center">
                        {task.comments ? (
                          <MessageSquare 
                            size={16} 
                            className="text-blue-500 cursor-pointer mx-auto"
                            onClick={() => {
                              setSelectedTask(task);
                              setShowDetailsModal(true);
                            }}
                          />
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>

                      {/* Status */}
                      <div className="col-span-1">
                        {getStatusBadge(task)}
                      </div>

                      {/* Action Section */}
                      <div className="col-span-3 flex space-x-1">
                        
                        {/* Mark Not Done */}
                        <button
                          onClick={() => handleMarkNotDone(task.$id)}
                          disabled={processingTaskId === task.$id && actionType === 'not_done'}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                            processingTaskId === task.$id && actionType === 'not_done'
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-red-600 hover:bg-red-700'
                          } text-white`}
                          title="Mark Not Done"
                        >
                          {processingTaskId === task.$id && actionType === 'not_done' ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : (
                            <X size={12} />
                          )}
                        </button>
                        
                        {/* Mark Completed */}
                        <button
                          onClick={() => handleMarkCompleted(task.$id)}
                          disabled={processingTaskId === task.$id && actionType === 'completed'}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                            processingTaskId === task.$id && actionType === 'completed'
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700'
                          } text-white`}
                          title="Mark Completed"
                        >
                          {processingTaskId === task.$id && actionType === 'completed' ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : (
                            <CheckCircle size={12} />
                          )}
                        </button>

                        {/* Mark Well Done (5 Star) */}
                        <button
                          onClick={() => handleMarkWellDone(task.$id)}
                          disabled={processingTaskId === task.$id && actionType === 'well_done'}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                            processingTaskId === task.$id && actionType === 'well_done'
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-yellow-600 hover:bg-yellow-700'
                          } text-white`}
                          title="Mark Well Done (5 Star)"
                        >
                          {processingTaskId === task.$id && actionType === 'well_done' ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : (
                            <Star size={12} />
                          )}
                        </button>

                        {/* View Details */}
                        <button
                          onClick={() => {
                            setSelectedTask(task);
                            setShowDetailsModal(true);
                          }}
                          className="px-2 py-1 rounded text-xs font-medium bg-gray-600 hover:bg-gray-700 text-white"
                          title="View Details"
                        >
                          <Eye size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${currentTheme.cardBg} rounded-lg p-6 max-w-md w-full mx-4`}>
              <h3 className={`text-lg font-bold ${currentTheme.text} mb-4`}>Task Details</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Task Name:</label>
                  <p className={currentTheme.text}>{selectedTask.taskname}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Category:</label>
                  <p className={currentTheme.text}>
                    {getTaskCategory(selectedTask).text}
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
    </div>
  );
};

export default TaskValidation;