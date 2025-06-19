import React, { useState, useEffect } from "react";
import { databases, DATABASE_ID, COLLECTIONS } from "../appwrite/config";
import { Query } from "appwrite";
import { format, differenceInDays } from "date-fns";
import { useTheme } from "./ColorChange";
import { getSortedAndFilteredTasks, calculateTaskStats } from "./SortingLogic";
import TableDisplay from "./TableDisplay";
import TaskFiltersnStats from "./TaskFiltersnStats";
import AllTasks from "./AllTasks"; // Import the new AllTasks component
import { DeleteConfirmationModal, CommentsModal } from "./ModelOps";
import { OneTimeTaskEditModal } from "./OneTimeTaskEdit";
import taskCacheService from "./TaskCacheService"; // Import cache service

const TaskHomeAdmin = () => {
  const { currentTheme } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animatingTaskId, setAnimatingTaskId] = useState(null);
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sortState, setSortState] = useState("default"); // 'default', 'asc', or 'desc'
  
  // Modal states
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [selectedTaskComments, setSelectedTaskComments] = useState("");
  const [commentModalTitle, setCommentModalTitle] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTask, setEditTask] = useState({
    $id: "",
    taskname: "",
    urgency: "Normal",
    taskduedate: "",
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

  // UPDATED: Fetch tasks using cache service
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use cache service to get tasks
        const fetchedTasks = await taskCacheService.getTasks('onetime');
        
        setTasks(fetchedTasks);
        setLoading(false);
        
        // Log cache status for debugging
        console.log('Cache Status:', taskCacheService.getCacheStatus());
        
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Failed to load tasks. Please try again.");
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // UPDATED: Toggle task completion with cache update - now updates userdone and taskcompleted
  const toggleTaskCompletion = async (taskId, currentTask) => {
    try {
      // Set animating state for task
      setAnimatingTaskId(taskId);

      // Update the task in the database - set userdone=true and taskcompleted=false
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.TASK_DETAILS,
        taskId,
        {
          userdone: true,
          taskcompleted: false,
        }
      );

      // Update the local state
      const updatedTasks = tasks.map((task) =>
        task.$id === taskId
          ? { ...task, userdone: true, taskcompleted: false }
          : task
      );
      setTasks(updatedTasks);

      // Update cache with the modified task
      const updatedTask = updatedTasks.find(task => task.$id === taskId);
      taskCacheService.updateTaskInCache('onetime', updatedTask);

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
      taskCacheService.removeTaskFromCache('onetime', deleteTask.$id);

      // Wait for animation
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Reset state and close modal
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error("Error deleting task:", err);
      alert("Failed to delete task. Please try again.");
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
      urgency: task.urgency || "Normal",
      taskduedate: task.taskduedate
        ? format(new Date(task.taskduedate), "yyyy-MM-dd")
        : "",
      comments: task.comments || "",
      // Include case owner fields
      taskownerinitial: task.taskownerinitial || "",
      taskownername: task.taskownername || "",
    });
    setIsEditModalOpen(true);
  };

  // UPDATED: Save edited task with cache update
  const saveEditedTask = async () => {
    try {
      // Set saving state to true
      setIsSaving(true);

      // Prepare update data with all required fields including case owner
      const updateData = {
        taskname: editTask.taskname,
        urgency: editTask.urgency,
        taskduedate: editTask.taskduedate
          ? new Date(editTask.taskduedate).toISOString()
          : null,
        comments: editTask.comments || "",
        // Include case owner fields
        taskownerinitial: editTask.taskownerinitial || "",
        taskownername: editTask.taskownername || "",
        // CRITICAL: Include the recurringtask field to prevent the error
        recurringtask: false, // This is a one-time task
      };

      // Update the task in the database
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.TASK_DETAILS,
        editTask.$id,
        updateData
      );

      // Update local state
      const updatedTasks = tasks.map((task) =>
        task.$id === editTask.$id
          ? {
              ...task,
              taskname: editTask.taskname,
              urgency: editTask.urgency,
              taskduedate: editTask.taskduedate
                ? new Date(editTask.taskduedate).toISOString()
                : null,
              comments: editTask.comments,
              taskownerinitial: editTask.taskownerinitial || "",
              taskownername: editTask.taskownername || "",
              recurringtask: false, // Preserve this field in local state
            }
          : task
      );
      setTasks(updatedTasks);

      // Update cache with the modified task
      const updatedTask = updatedTasks.find(task => task.$id === editTask.$id);
      taskCacheService.updateTaskInCache('onetime', updatedTask);

      // Wait for 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reset saving state and close modal
      setIsSaving(false);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Error updating task:", err);
      alert("Failed to update task. Please try again.");
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
  const getUrgencyBadge = (urgency, dueDate, task) => {
    let bgColor,
      text,
      flashingClass = "";

    // Handle different task states
    if (task.taskcompleted) {
      // Completed tasks - muted appearance
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

    if (task.userdone) {
      // User done tasks - slightly muted but still visible
      bgColor = urgency === "Critical" ? "bg-blue-500" : "bg-blue-400";
      text = urgency === "Critical" ? "CRITICAL-DONE" : "NORMAL-DONE";
      return (
        <div
          className={`${bgColor} text-white px-3 py-1 rounded text-xs font-bold inline-block text-center w-25 opacity-80`}
        >
          {text}
        </div>
      );
    }

    // Active tasks - full intensity
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
  
  // Get due date badge
  const getDueDateBadge = (dueDate) => {
    if (!dueDate) return null;

    const date = new Date(dueDate);
    const formattedDate = format(date, "d MMM");

    return (
      <div className="bg-red-500 text-xs text-white px-3 py-1 rounded text-sm inline-block text-center w-20">
        {formattedDate}
      </div>
    );
  };

  // Determine task row color based on theme and task state
  const getRowClass = (index, task) => {
    // For dark theme, use slightly different shades to distinguish rows
    const evenRow =
      currentTheme.name === "dark" ? "bg-gray-800" : "bg-gray-200";
    const oddRow = currentTheme.name === "dark" ? "bg-gray-700" : "bg-gray-100";

    const baseClass = index % 2 === 0 ? evenRow : oddRow;

    // Add different styling based on task state
    let stateClass = "";
    if (task.taskcompleted) {
      // Completed tasks - most disabled appearance
      stateClass = "opacity-30 bg-grey-500 dark:bg-green-700";
    } else if (task.userdone) {
      // User done tasks - partially disabled appearance
      stateClass = "opacity-60 bg-blue-50 dark:bg-blue-900";
    }
    // Active tasks use default styling (no additional class)

    return `${baseClass} ${stateClass} hover:bg-opacity-90 transition duration-150 ease-in-out`;
  };

  // Use the imported function for sorting and filtering tasks
  const sortedAndFilteredTasks = getSortedAndFilteredTasks(
    tasks,
    showActiveOnly,
    sortState
  );

  // Determine if we're showing sectioned view (all tasks) or flat view (active only)
  const isSectionedView = !showActiveOnly && sortedAndFilteredTasks.sections;
  const flatTaskList = isSectionedView ? [] : sortedAndFilteredTasks;

  // Use the imported function to calculate task statistics
  const taskStats = calculateTaskStats(tasks);

  // ADD: Function to refresh data from database (useful for debugging or manual refresh)
  const refreshFromDatabase = async () => {
    try {
      setLoading(true);
      const freshTasks = await taskCacheService.getTasks('onetime', true); // Force refresh
      setTasks(freshTasks);
      setLoading(false);
    } catch (err) {
      console.error("Error refreshing tasks:", err);
      setError("Failed to refresh tasks. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="overflow-x-auto">
      <div className="relative max-w-full mx-auto space-y-6">
{/*          
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-2 p-2 bg-blue-100 text-blue-800 text-xs rounded">
            📦 Cache Status: {JSON.stringify(taskCacheService.getCacheStatus())}
            <button 
              onClick={refreshFromDatabase}
              className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
            >
              Force Refresh
            </button>
          </div> */}
         

        {/* Use TableDisplay component for Active Tasks or AllTasks component for All Tasks */}
        {isSectionedView ? (
          // All Tasks view with sections
          <AllTasks
            currentTheme={currentTheme}
            sortedAndFilteredTasks={sortedAndFilteredTasks}
            sortState={sortState}
            handleDueDateClick={handleDueDateClick}
            animatingTaskId={animatingTaskId}
            toggleTaskCompletion={toggleTaskCompletion}
            openEditModal={openEditModal}
            openDeleteModal={openDeleteModal}
            openCommentsModal={openCommentsModal}
            getInitialsBadge={getInitialsBadge}
            getUrgencyBadge={getUrgencyBadge}
            getDueDateBadge={getDueDateBadge}
            getTaskAgeBadge={getTaskAgeBadge}
            getRowClass={getRowClass}
            showActiveOnly={showActiveOnly}
            setShowActiveOnly={setShowActiveOnly}
            taskStats={taskStats}
          />
        ) : (
          // Active Tasks view with original TableDisplay
          <>
            <TableDisplay
              currentTheme={currentTheme}
              sortedAndFilteredTasks={flatTaskList}
              sortState={sortState}
              handleDueDateClick={handleDueDateClick}
              setSortState={setSortState}
              animatingTaskId={animatingTaskId}
              toggleTaskCompletion={toggleTaskCompletion}
              openEditModal={openEditModal}
              openDeleteModal={openDeleteModal}
              openCommentsModal={openCommentsModal}
              getInitialsBadge={getInitialsBadge}
              getUrgencyBadge={getUrgencyBadge}
              getDueDateBadge={getDueDateBadge}
              getTaskAgeBadge={getTaskAgeBadge}
              getRowClass={getRowClass}
              showActiveOnly={showActiveOnly}
              pageTitle="One Time ☝ Task Details"
            />
            
            {/* TaskFiltersnStats component for Active Tasks view */}
            <TaskFiltersnStats
              currentTheme={currentTheme}
              showActiveOnly={showActiveOnly}
              setShowActiveOnly={setShowActiveOnly}
              taskStats={taskStats}
            />
          </>
        )}

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

        {/* FIXED: Changed EditTaskModal to OneTimeTaskEditModal */}
        <OneTimeTaskEditModal
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

export default TaskHomeAdmin;