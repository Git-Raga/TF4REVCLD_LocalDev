// TaskValidation.jsx (With Cache Implementation)
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useTheme } from "./ColorChange";
import { 
  CheckCircle, 
  Star, 
  X, 
  RefreshCw,
  Trophy,
  Award,
  MessageSquareMore,
  MessageSquareOff
} from "lucide-react";

// Import utility functions and operations
import {
  getSortedValidationTasks,
  getUrgencyBadge,
  getStatusBadge,
  getInitialsBadge,
  getRowClass,
  calculateTaskAge,
  calculateTaskStats
} from "./TaskValidationUtils.jsx";

import {
  fetchValidationTasks,
  markTaskAsNotDone,
  markTaskAsCompleted,
  markTaskAsWellDone,
  updateTasksAfterNotDone,
  updateTasksAfterCompleted,
  updateTasksAfterWellDone
} from "./TaskValidationOperations.jsx";

import { CommentsModal, DetailsModal } from "./TaskValidationModals.jsx";

// Import cache
import taskValidationCache from "./TaskValidationCache.js";

const TaskValidation = ({ sidebarCollapsed = false }) => {
  const { currentTheme } = useTheme();
  
  // State management
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingTaskId, setProcessingTaskId] = useState(null);
  const [actionType, setActionType] = useState(''); // 'not_done', 'completed', 'well_done'
  const [sortState, setSortState] = useState("default"); // Add sort state for due date sorting
  const [isFromCache, setIsFromCache] = useState(false); // Track if data is from cache

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

  // Load validation tasks with cache support
  const loadValidationTasks = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    
    try {
      // Check cache first if not forcing refresh
      if (!forceRefresh) {
        const cachedData = taskValidationCache.getCache();
        if (cachedData) {
          setTasks(cachedData.tasks);
          setTaskStats(cachedData.stats);
          setIsFromCache(true);
          setLoading(false);
          return;
        }
      }

      // If no cache or force refresh, fetch from DB
      console.log('Fetching from database...');
      setIsFromCache(false);
      const { tasks: fetchedTasks, stats, error: fetchError } = await fetchValidationTasks();
      
      if (fetchError) {
        setError(fetchError);
        setLoading(false);
        return;
      }

      // Update state
      setTasks(fetchedTasks);
      setTaskStats(stats);
      
      // Update cache
      taskValidationCache.setCache(fetchedTasks, stats);
      
      setLoading(false);
    } catch (err) {
      console.error("Error loading validation tasks:", err);
      setError("Failed to load validation tasks. Please try again.");
      setLoading(false);
    }
  };

  // Fetch validation tasks on component mount
  useEffect(() => {
    loadValidationTasks();
  }, []);

  // Handle Mark Not Done with cache update
  const handleMarkNotDone = async (taskId) => {
    setProcessingTaskId(taskId);
    setActionType('not_done');

    const { success } = await markTaskAsNotDone(taskId);
    
    if (success) {
      // Update local state
      const updatedTasks = updateTasksAfterNotDone(tasks, taskId);
      const newStats = calculateTaskStats(updatedTasks);
      
      setTasks(updatedTasks);
      setTaskStats(newStats);
      
      // Update cache - remove task since userdone = false
      taskValidationCache.removeTaskFromCache(taskId);
      taskValidationCache.updateStats(newStats);
      
      console.log('Task marked as not done and removed from cache');
    }

    setTimeout(() => {
      setProcessingTaskId(null);
      setActionType('');
    }, 500);
  };

  // Handle Mark Completed with cache update
  const handleMarkCompleted = async (taskId) => {
    setProcessingTaskId(taskId);
    setActionType('completed');

    const { success } = await markTaskAsCompleted(taskId);
    
    if (success) {
      // Update local state
      const updatedTasks = updateTasksAfterCompleted(tasks, taskId);
      const newStats = calculateTaskStats(updatedTasks);
      
      setTasks(updatedTasks);
      setTaskStats(newStats);
      
      // Update cache
      taskValidationCache.updateTaskInCache(taskId, { 
        taskcompleted: true, 
        perfectstar: false 
      });
      taskValidationCache.updateStats(newStats);
      
      console.log('Task marked as completed and updated in cache');
    }

    setTimeout(() => {
      setProcessingTaskId(null);
      setActionType('');
    }, 500);
  };

  // Handle Mark Well Done with cache update
  const handleMarkWellDone = async (taskId) => {
    setProcessingTaskId(taskId);
    setActionType('well_done');

    const { success } = await markTaskAsWellDone(taskId);
    
    if (success) {
      // Update local state
      const updatedTasks = updateTasksAfterWellDone(tasks, taskId);
      const newStats = calculateTaskStats(updatedTasks);
      
      setTasks(updatedTasks);
      setTaskStats(newStats);
      
      // Update cache
      taskValidationCache.updateTaskInCache(taskId, { 
        taskcompleted: true, 
        perfectstar: true 
      });
      taskValidationCache.updateStats(newStats);
      
      console.log('Task marked as perfectly done and updated in cache');
    }

    setTimeout(() => {
      setProcessingTaskId(null);
      setActionType('');
    }, 500);
  };

  // Force refresh from database
  const handleForceRefresh = () => {
    taskValidationCache.invalidate();
    loadValidationTasks(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className={`flex justify-center items-center h-64 ${currentTheme.text}`}>
        <RefreshCw className="animate-spin mr-2" size={20} />
        Loading validation tasks...
        {isFromCache && <span className="ml-2 text-green-500">(from cache)</span>}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`text-center p-8 ${currentTheme.text}`}>
        <div className="text-red-500 mb-4">{error}</div>
        <div className="space-x-2">
          <button 
            onClick={() => loadValidationTasks(true)} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Hard Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col" style={{height: '86vh', overflow: 'hidden'}}>
      <div className="flex-shrink-0 space-y-2 p-4">
        {/* Header Section with Background Banner */}
        <div className="relative bg-gradient-to-r from-teal-600 via-purple-600 to-red-600 rounded-lg py-2 px-4 text-white overflow-hidden">
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gray-100 p-2 rounded-lg">
                <Award size={24} className="text-black" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Task Validation Panel</h2>
                {/* {isFromCache && (
                  <div className="text-xs text-blue-100 flex items-center space-x-1">
                    <span>⚡ Cached data</span>
                    <button 
                      onClick={handleForceRefresh}
                      className="underline hover:text-blue-200"
                      title="Refresh from database"
                    >
                      Refresh
                    </button>
                  </div>
                )} */}
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
            <div className="grid grid-cols-12 gap-2 p-2 font-bold ">
              <div className="col-span-1 text-center">Urgency 🔥</div>
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
              <div className="col-span-1 text-center">Task Age🗓️</div>
              <div className="col-span-2 text-center ">Submitted by 🙋</div>
              <div className="col-span-4 text-left ">Task Name 📃</div>
              <div className="col-span-2 text-center">Actions ⚙️</div>
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
                const taskAge = calculateTaskAge(task.$createdAt);
                
                return (
                  <div key={task.$id} className={`${getRowClass(index, task, currentTheme)} border-b border-gray-200 dark:border-gray-700`}>
                    <div className="grid grid-cols-12 gap-2 p-2 items-center text-sm min-h-[3rem]">
                      
                      {/* Urgency */}
                      <div className="col-span-1 flex justify-center">
                        {getUrgencyBadge(task)}
                      </div>

                      {/* Due Date */}
                      <div className="col-span-1 flex justify-center ">
                        {task.taskduedate ? (
                          <div className="bg-red-500 text-xs text-white px-2 py-1 rounded text-center w-16">
                            {format(new Date(task.taskduedate), "d MMM")}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-center w-16">-</div>
                        )}
                      </div>

                      {/* Task Age */}
                      <div className="col-span-1 flex justify-center">
                        <div className={`${currentTheme.name === "dark" ? "bg-gray-200 text-gray-900" : "bg-gray-800 text-white"} px-2 py-1 rounded text-xs text-center`}>
                          {taskAge} Days
                        </div>
                      </div>

                      {/* Submitted by (Assigned To) */}
                      <div className="col-span-2 flex items-center  justify-start ml-15 space-x-2">
                        {getInitialsBadge(task.taskownerinitial)}
                        <span className={`${currentTheme.text} text-sm truncate max-w-[100px]`}>
                          {task.taskownername}
                        </span>
                      </div>

                      {/* Task Name (Details) */}
                      <div className="col-span-4 pl-4">
                        <p className={`${currentTheme.text}  font-m`} title={task.taskname}>
                          {task.taskname}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="col-span-3 flex justify-center space-x-1">
                        
                        {/* Mark as Incomplete */}
                        <button
                          onClick={() => handleMarkNotDone(task.$id)}
                          disabled={processingTaskId === task.$id && actionType === 'not_done'}
                          className={`px-3 py-2 rounded cursor-pointer font-medium ${
                            processingTaskId === task.$id && actionType === 'not_done'
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-gray-200 hover:bg-red-500'
                          } text-red-500 rounded-xl border-1 border-red-900 font-bold transition-colors flex items-center space-x-1`}
                          title="Mark as Incomplete"
                        >
                          {processingTaskId === task.$id && actionType === 'not_done' ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : (
                            <>
                              <span>🔙</span>
                              <span>Incomplete</span>
                            </>
                          )}
                        </button>
                        
                        {/* Mark as Complete */}
                        <button
                          onClick={() => handleMarkCompleted(task.$id)}
                          disabled={processingTaskId === task.$id && actionType === 'completed'}
                          className={`px-3 py-2 rounded cursor-pointer text-xs font-medium ${
                            processingTaskId === task.$id && actionType === 'completed'
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700'
                          } text-white transition-colors flex items-center space-x-1`}
                          title="Mark as Complete"
                        >
                          {processingTaskId === task.$id && actionType === 'completed' ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : (
                            <>
                              <span>✅</span>
                              <span>Completed</span>
                            </>
                          )}
                        </button>

                        {/* Mark as Perfectly Done */}
                        <button
                          onClick={() => handleMarkWellDone(task.$id)}
                          disabled={processingTaskId === task.$id && actionType === 'well_done'}
                          className={`px-5 py-2 rounded cursor-pointer text-xs font-medium ${
                            processingTaskId === task.$id && actionType === 'well_done'
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-yellow-600 hover:bg-yellow-700'
                          } text-white transition-colors flex items-center space-x-1`}
                          title="Mark as Perfectly Done"
                        >
                          {processingTaskId === task.$id && actionType === 'well_done' ? (
                            <RefreshCw size={18} className="animate-spin" />
                          ) : (
                            <>
                              <span>⭐</span>
                              <span>Perfectly Done</span>
                            </>
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

      {/* Modals */}
      <CommentsModal 
        showCommentsModal={showCommentsModal}
        selectedTask={selectedTask}
        currentTheme={currentTheme}
        setShowCommentsModal={setShowCommentsModal}
      />

      <DetailsModal 
        showDetailsModal={showDetailsModal}
        selectedTask={selectedTask}
        currentTheme={currentTheme}
        setShowDetailsModal={setShowDetailsModal}
      />
    </div>
  );
};

export default TaskValidation;