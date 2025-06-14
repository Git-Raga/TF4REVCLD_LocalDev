import React, { useState, useEffect } from "react";
import { databases, DATABASE_ID, COLLECTIONS } from "../appwrite/config";
import { Query } from "appwrite";
import { format, differenceInDays } from "date-fns";
import { useTheme } from "./ColorChange";
import { getSortedAndFilteredTasks, calculateTaskStats } from "./SortingLogic";
import RecurringTaskFiltersnStats from "./RecurringTaskFiltersnStats";
import { DeleteConfirmationModal, CommentsModal } from "./ModelOps";
import { RecurringTaskEditModal } from "./RecurringTaskEdit";
import RecurringTaskTable from './RecurringTaskTable';
import taskCacheService from "./TaskCacheService"; // Import cache service

const RecurringTaskUser = ({ theme }) => {
  const { currentTheme } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animatingTaskId, setAnimatingTaskId] = useState(null);
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sortState, setSortState] = useState("default"); // 'default', 'asc', or 'desc'
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState(""); // Added userRole state
  
  // Modal states
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [selectedTaskComments, setSelectedTaskComments] = useState("");
  const [commentModalTitle, setCommentModalTitle] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTask, setEditTask] = useState({
    $id: "",
    taskname: "",
    recurringfreq: "",
    recurringday: "",
    comments: "",
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTask, setDeleteTask] = useState({ $id: "", taskname: "" });
  const [isDeleting, setIsDeleting] = useState(false);

  // Add this function to handle opening the delete confirmation modal
  const openDeleteModal = (task) => {
    setDeleteTask({
      $id: task.$id,
      taskname: task.taskname,
    });
    setIsDeleteModalOpen(true);
  };

  // UPDATED: Fetch recurring tasks using cache service - Admin and User see only their own tasks
  useEffect(() => {
    const fetchUserRecurringTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get current user info from localStorage
        const storedUser = localStorage.getItem('user');
        let currentUserEmail = null;
        let currentUserRole = null;
        
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          currentUserEmail = userData.useremail;
          currentUserRole = userData.role;
          setUserEmail(currentUserEmail);
          setUserRole(currentUserRole);
        }
        
        if (!currentUserEmail) {
          throw new Error("User information not found");
        }
        
        // UPDATED: Use cache service to get recurring tasks
        let fetchedTasks = await taskCacheService.getTasks('recurring');
        
        // For RecurringTaskUser component: Admin and User roles see only their own tasks
        // (SuperAdmin users won't reach this component as they use RecurringTaskAdmin)
        fetchedTasks = fetchedTasks.filter(task => 
          task.taskowneremail === currentUserEmail && task.recurringtask === true
        );
        
        setTasks(fetchedTasks);
        setLoading(false);
        
        // Log cache status for debugging
        console.log('RecurringTaskUser - Cache Status:', taskCacheService.getCacheStatus());
        console.log('RecurringTaskUser - User Role:', currentUserRole);
        console.log('RecurringTaskUser - User Email:', currentUserEmail);
        console.log('RecurringTaskUser - Filtered Recurring Tasks Count:', fetchedTasks.length);
        
      } catch (err) {
        console.error("Error fetching user recurring tasks:", err);
        setError("Failed to load your recurring tasks. Please try again.");
        setLoading(false);
      }
    };

    fetchUserRecurringTasks();
  }, []);

  // Fixed getSortedRecurringTasks function
  const getSortedRecurringTasks = (tasks, sortState) => {
    // Sort by frequency first (weekly before monthly)
    let sortedTasks = [...tasks].sort((a, b) => {
      // Define frequency order: weekly (1), monthly (2), daily (3), yearly (4)
      const frequencyOrder = { 'weekly': 1, 'monthly': 2, 'daily': 3, 'yearly': 4 };
      const orderA = frequencyOrder[a.recurringfreq] || 5;
      const orderB = frequencyOrder[b.recurringfreq] || 5;
      
      if (orderA !== orderB) return orderA - orderB;
      
      // If weekly tasks, sort by day of week
      if (a.recurringfreq === 'weekly' && a.recurringfreq === b.recurringfreq) {
        const weekDays = {
          'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
          'thursday': 4, 'friday': 5, 'saturday': 6
        };
        const dayOrderA = weekDays[a.recurringday?.toLowerCase()] !== undefined ? weekDays[a.recurringday.toLowerCase()] : 7;
        const dayOrderB = weekDays[b.recurringday?.toLowerCase()] !== undefined ? weekDays[b.recurringday.toLowerCase()] : 7;
        return dayOrderA - dayOrderB;
      }
      
      // If monthly tasks, sort by date number
      if (a.recurringfreq === 'monthly' && a.recurringfreq === b.recurringfreq) {
        const dayA = parseInt(a.recurringday) || 999;
        const dayB = parseInt(b.recurringday) || 999;
        return dayA - dayB;
      }
      
      return 0;
    });
    
    return sortedTasks;
  };

  // UPDATED: Toggle recurring done status with cache update
  const toggleRecurringDone = async (taskId, currentStatus) => {
    try {
      // Set animating state for task
      setAnimatingTaskId(taskId);

      // Update the task in the database
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.TASK_DETAILS,
        taskId,
        {
          recurringdone: !currentStatus,
        }
      );

      // Update the local state
      const updatedTasks = tasks.map((task) =>
        task.$id === taskId
          ? { ...task, recurringdone: !currentStatus }
          : task
      );
      setTasks(updatedTasks);

      // Update cache with the modified task
      const updatedTask = updatedTasks.find(task => task.$id === taskId);
      taskCacheService.updateTaskInCache('recurring', updatedTask);

      // Wait for animation to complete before clearing animating state
      setTimeout(() => {
        setAnimatingTaskId(null);
      }, 500);
    } catch (err) {
      console.error("Error toggling recurring done status:", err);
      setAnimatingTaskId(null);
    }
  };

  // UPDATED: Toggle task completion status with cache update
  const toggleTaskCompletion = async (taskId, currentCompletionStatus) => {
    try {
      // Set animating state for task
      setAnimatingTaskId(taskId);

      // Update the task in the database
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.TASK_DETAILS,
        taskId,
        {
          taskcompleted: !currentCompletionStatus,
        }
      );

      // Update the local state
      const updatedTasks = tasks.map((task) =>
        task.$id === taskId
          ? { ...task, taskcompleted: !currentCompletionStatus }
          : task
      );
      setTasks(updatedTasks);

      // Update cache with the modified task
      const updatedTask = updatedTasks.find(task => task.$id === taskId);
      taskCacheService.updateTaskInCache('recurring', updatedTask);

      // Wait for animation to complete before clearing animating state
      setTimeout(() => {
        setAnimatingTaskId(null);
      }, 500);
    } catch (err) {
      console.error("Error toggling task completion:", err);
      setAnimatingTaskId(null);
    }
  };

  // UPDATED: Handle task deletion with cache update
  const handleDeleteTask = async () => {
    try {
      setIsDeleting(true);

      // Delete the task from the database
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.TASK_DETAILS,
        deleteTask.$id
      );

      // Update the local state by filtering out the deleted task
      setTasks((prevTasks) =>
        prevTasks.filter((task) => task.$id !== deleteTask.$id)
      );

      // Remove from cache
      taskCacheService.removeTaskFromCache('recurring', deleteTask.$id);

      // Wait for animation
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Reset state and close modal
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error("Error deleting recurring task:", err);
      alert("Failed to delete recurring task. Please try again.");
      setIsDeleting(false);
    }
  };

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

  // Handle opening comments modal
  const openCommentsModal = (task) => {
    setSelectedTaskComments(task.comments || "No comments available");
    setCommentModalTitle(task.taskname);
    setIsCommentsModalOpen(true);
  };

  // Updated openEditModal function to include case owner data
  const openEditModal = (task) => {
    setEditTask({
      $id: task.$id,
      taskname: task.taskname,
      recurringfreq: task.recurringfreq || "",
      recurringday: task.recurringday || "",
      comments: task.comments || "",
      // Include case owner fields
      taskownerinitial: task.taskownerinitial || "",
      taskownername: task.taskownername || "",
    });
    setIsEditModalOpen(true);
  };

  // UPDATED: Save edited recurring task with cache update
  const saveEditedTask = async (customTask = null) => {
    try {
      // Use either the custom task passed or the editTask state
      const taskToSave = customTask || editTask;
      
      setIsSaving(true);
      console.log("Saving recurring task:", taskToSave); // For debugging

      // Prepare update data - IMPORTANT: Only include fields that should be updated
      const updateData = {
        taskname: taskToSave.taskname,
        comments: taskToSave.comments || "",
        // Preserve the recurringtask field to avoid the missing attribute error
        recurringtask: true, // This is crucial for recurring tasks
        // Include case owner fields
        taskownerinitial: taskToSave.taskownerinitial || "",
        taskownername: taskToSave.taskownername || "",
      };

      // Always include recurringday if it exists - this is crucial
      if (taskToSave.recurringday) {
        updateData.recurringday = taskToSave.recurringday;
      }

      // Include recurring frequency to maintain consistency
      if (taskToSave.recurringfreq) {
        updateData.recurringfreq = taskToSave.recurringfreq;
      }

      console.log("Update data:", updateData); // For debugging

      // Update the task in the database
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.TASK_DETAILS,
        taskToSave.$id,
        updateData
      );

      // Update local state
      const updatedTasks = tasks.map((task) =>
        task.$id === taskToSave.$id
          ? {
              ...task,
              taskname: taskToSave.taskname,
              recurringday: taskToSave.recurringday || task.recurringday,
              comments: taskToSave.comments || "",
              taskownerinitial: taskToSave.taskownerinitial || task.taskownerinitial,
              taskownername: taskToSave.taskownername || task.taskownername,
              // Preserve other important fields
              recurringtask: true,
              recurringfreq: taskToSave.recurringfreq || task.recurringfreq,
            }
          : task
      );
      setTasks(updatedTasks);

      // Update cache with the modified task
      const updatedTask = updatedTasks.find(task => task.$id === taskToSave.$id);
      taskCacheService.updateTaskInCache('recurring', updatedTask);

      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsSaving(false);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Error saving recurring task:", err);
      alert("Failed to save recurring task. Please try again.");
      setIsSaving(false);
    }
  };

  const getInitialsBadge = (initial) => {
    if (!initial) return null;

    // Generate a consistent color based on the initials
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

    // Default color if not found in map
    const bgColor = colorMap[initial] || "bg-gray-500";

    // Adjust text size and badge size based on initial length
    const textSize = initial.length > 2 ? "text-xs" : "text-sm";
    const badgeSize = "w-9 h-9"; // Slightly larger to accommodate longer texts

    return (
      <div
        className={`${bgColor} text-white rounded-full ${badgeSize} flex items-center justify-center font-semibold ${textSize}`}
      >
        {initial}
      </div>
    );
  };

  // Determine urgency badge color and text
  const getUrgencyBadge = (urgency, dueDate, isCompleted) => {
    let bgColor,
      text,
      flashingClass = "";

    // If task is completed, don't show flashing and use muted colors
    if (isCompleted) {
      bgColor = "bg-gray-500";
      text = urgency === "Critical" ? "CRITICAL" : "NORMAL";
      return (
        <div
          className={`${bgColor} text-white px-3 py-1 rounded text-xs font-bold inline-block text-center w-25 opacity-70`}
        >
          {text}
        </div>
      );
    }

    // Check if task is late
    const isLate =
      dueDate &&
      new Date() > new Date(dueDate) &&
      new Date(dueDate).toDateString() !== new Date().toDateString();

    if (urgency === "Critical" && isLate) {
      bgColor = "bg-red-700"; // Darker, more intense red
      text = "CRITICAL-LATE";
      
      return (
        <div
          className={`${bgColor} text-white px-3 py-1 rounded text-xs inline-block text-center w-25`}
          style={{ animation: 'pulse 0.5s cubic-bezier(0.5, 0, 0.5, 1) infinite' }}
        >
          {text}
        </div>
      );
    } else if (urgency === "Critical") {
      bgColor = "bg-red-600"; // Medium red
      text = "CRITICAL";
    } else if (isLate) {
      bgColor = "bg-red-500"; // Lighter red
      text = "NORMAL-LATE";
    } else {
      bgColor = "bg-green-600";
      text = "NORMAL";
    }

    return (
      <div
        className={`${bgColor} ${flashingClass} text-white px-3 py-1 rounded text-xs inline-block text-center w-25`}
      >
        {text}
      </div>
    );
  };

  // Get task age badge
  const getTaskAgeBadge = (days) => {
    return (
      <div
        className={`${
          currentTheme.name === "dark" 
            ? "bg-gray-200 text-gray-900" 
            : "bg-gray-800 text-white"
        } px-3 py-1 rounded inline-block text-center w-20 rounded-xl`}
      >
        {days} Days
      </div>
    );
  };
  
  // Get due date badge (modify this function)
  const getDueDateBadge = (dueDate, recurringDay) => {
    // For recurring tasks, use recurringday instead of taskduedate
    if (recurringDay) {
      return (
        <div className="bg-red-500 text-xs text-white px-3 py-1 rounded text-sm inline-block text-center w-20">
          {recurringDay}
        </div>
      );
    }
    
    if (!dueDate) return null;

    const date = new Date(dueDate);
    const formattedDate = format(date, "d MMM");

    return (
      <div className="bg-red-500 text-xs text-white px-3 py-1 rounded text-sm inline-block text-center w-20">
        {formattedDate}
      </div>
    );
  };

  // Determine task row color based on theme
  const getRowClass = (index, isCompleted) => {
    // For dark theme, use slightly different shades to distinguish rows
    const evenRow =
      currentTheme.name === "dark" ? "bg-gray-800" : "bg-gray-200";
    const oddRow = currentTheme.name === "dark" ? "bg-gray-700" : "bg-gray-100";

    const baseClass = index % 2 === 0 ? evenRow : oddRow;

    // Add disabled styling for completed tasks
    const completedClass = isCompleted ? "opacity-30" : "";

    return `${baseClass} ${completedClass} hover:bg-opacity-90 transition duration-150 ease-in-out`;
  };
  
  const sortedAndFilteredTasks = getSortedRecurringTasks(tasks, sortState);
  // Use the imported function to calculate task statistics
  const taskStats = calculateTaskStats(tasks);

  // UPDATED: Function to refresh data from database using cache service
  const refreshFromDatabase = async () => {
    try {
      setLoading(true);
      
      // Force refresh from database through cache service
      let freshTasks = await taskCacheService.getTasks('recurring', true);
      
      // Apply filtering for current user (Admin and User see only their own tasks)
      freshTasks = freshTasks.filter(task => 
        task.taskowneremail === userEmail && task.recurringtask === true
      );
      
      setTasks(freshTasks);
      setLoading(false);
    } catch (err) {
      console.error("Error refreshing recurring tasks:", err);
      setError("Failed to refresh your recurring tasks. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="overflow-x-auto">
      <div className="relative max-w-full mx-auto">
        {/* Development debug info - commented out for production */}
        {/* 
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-2 p-2 bg-blue-100 text-blue-800 text-xs rounded">
            📦 Cache Status: {JSON.stringify(taskCacheService.getCacheStatus())}
            | User Role: {userRole} | User Email: {userEmail} | Recurring Tasks Count: {tasks.length}
            <button 
              onClick={refreshFromDatabase}
              className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
            >
              Force Refresh
            </button>
          </div>
        )}
        */}

        {/* Use RecurringTaskTable component */}
        <RecurringTaskTable
          currentTheme={currentTheme}
          sortedAndFilteredTasks={sortedAndFilteredTasks}
          toggleRecurringDone={toggleRecurringDone}
          animatingTaskId={animatingTaskId}
          toggleTaskCompletion={toggleTaskCompletion}
          onSaveTask={saveEditedTask} // Pass the save function for table's internal edit modal
          openEditModal={openEditModal}
          openDeleteModal={openDeleteModal}
          openCommentsModal={openCommentsModal}
          getInitialsBadge={getInitialsBadge}
          getUrgencyBadge={getUrgencyBadge}
          getDueDateBadge={getDueDateBadge}
          getTaskAgeBadge={getTaskAgeBadge}
          getRowClass={getRowClass}
          showActiveOnly={showActiveOnly}
          pageTitle={`My Recurring 🔁 Tasks`} // User-specific title
        />

        
        {/* Modals - now using components from ModelOps.jsx */}
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteTask}
          taskName={deleteTask.taskname}
          isDeleting={isDeleting}
          currentTheme={currentTheme}
        />

        <CommentsModal
          isOpen={isCommentsModalOpen}
          onClose={() => setIsCommentsModalOpen(false)}
          title={commentModalTitle}
          comments={selectedTaskComments}
          currentTheme={currentTheme}
        />

        {/* RecurringTaskEditModal for user editing */}
        <RecurringTaskEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={saveEditedTask}
          editTask={editTask}
          setEditTask={setEditTask}
          isSaving={isSaving}
          currentTheme={currentTheme}
        />
      </div>
    </div>
  );
};

export default RecurringTaskUser;