import React, { useState, useEffect } from "react";
import { databases, DATABASE_ID, COLLECTIONS } from "../appwrite/config";
import { Query } from "appwrite";
import {
  Star,
  Edit,
  Trash2,
  Check,
  Calendar,
  X,
  AlertCircle,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useTheme } from "./ColorChange";
import { getSortedAndFilteredTasks, calculateTaskStats } from "./SortingLogic";
import TableDisplay from "./TableDisplay";
import TaskFiltersnStats from "./TaskFiltersnStats";

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

  // Toggle task completion status
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
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.$id === taskId
            ? { ...task, taskcompleted: !currentCompletionStatus }
            : task
        )
      );

      // Wait for animation to complete before clearing animating state
      setTimeout(() => {
        setAnimatingTaskId(null);
      }, 500);
    } catch (err) {
      console.error("Error toggling task completion:", err);
      setAnimatingTaskId(null);
    }
  };

  // Add this function to handle the actual deletion
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

  // Handle opening edit modal
  const openEditModal = (task) => {
    setEditTask({
      $id: task.$id,
      taskname: task.taskname,
      urgency: task.urgency || "Normal",
      taskduedate: task.taskduedate
        ? format(new Date(task.taskduedate), "yyyy-MM-dd")
        : "",
      comments: task.comments || "",
    });
    setIsEditModalOpen(true);
  };

  // Replace your saveEditedTask function with this version
  const saveEditedTask = async () => {
    try {
      // Set saving state to true
      setIsSaving(true);

      // Update the task in the database
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.TASK_DETAILS,
        editTask.$id,
        {
          taskname: editTask.taskname,
          urgency: editTask.urgency,
          taskduedate: editTask.taskduedate
            ? new Date(editTask.taskduedate).toISOString()
            : null,
          comments: editTask.comments,
        }
      );

      // Update local state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.$id === editTask.$id
            ? {
                ...task,
                taskname: editTask.taskname,
                urgency: editTask.urgency,
                taskduedate: editTask.taskduedate
                  ? new Date(editTask.taskduedate).toISOString()
                  : null,
                comments: editTask.comments,
              }
            : task
        )
      );

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
      flashingClass = "animate-pulse"; // Add flashing effect
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
          currentTheme.name === "dark" ? "bg-gray-950" : "bg-gray-800"
        } text-white px-3 py-1 rounded inline-block text-center w-24`}
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

  // Use the imported function for sorting and filtering tasks
  const sortedAndFilteredTasks = getSortedAndFilteredTasks(
    tasks,
    showActiveOnly,
    sortState
  );

  // Use the imported function to calculate task statistics
  const taskStats = calculateTaskStats(tasks);

  return (
    <div className="overflow-x-auto">
      <div className="relative max-w-full mx-auto">
        {/* Use TableDisplay component */}
        <TableDisplay
          currentTheme={currentTheme}
          sortedAndFilteredTasks={sortedAndFilteredTasks}
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
        />

        {/* Use TaskFiltersnStats component */}
        <TaskFiltersnStats
          currentTheme={currentTheme}
          showActiveOnly={showActiveOnly}
          setShowActiveOnly={setShowActiveOnly}
          taskStats={taskStats}
        />

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <>
            <div
              className="fixed inset-0 z-30 pointer-events-none"
              style={{ backdropFilter: "blur(2px)" }}
            ></div>
            <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
              <div
                className={`${
                  currentTheme.name === "dark" ? "bg-gray-800" : "bg-white"
                } rounded-lg p-6 max-w-md w-full shadow-2xl pointer-events-auto opacity-95`}
              >
                <div className="flex flex-col items-center text-center">
                  <AlertCircle size={48} className="text-red-500 mb-4" />
                  <h3
                    className={`${currentTheme.text} text-xl font-semibold mb-2`}
                  >
                    Confirm Deletion
                  </h3>
                  <p className={`${currentTheme.text} mb-6`}>
                    Are you sure you want to delete "
                    <span className="font-semibold">
                      {deleteTask.taskname}
                    </span>
                    "?
                    <br />
                    This action cannot be undone.
                  </p>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => setIsDeleteModalOpen(false)}
                      className={`px-4 py-2 rounded ${
                        currentTheme.name === "dark"
                          ? "bg-gray-700 hover:bg-gray-600"
                          : "bg-gray-200 hover:bg-gray-300"
                      } ${currentTheme.text}`}
                      disabled={isDeleting}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteTask}
                      disabled={isDeleting}
                      className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center ${
                        isDeleting ? "opacity-70" : ""
                      }`}
                    >
                      {isDeleting ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 size={18} className="mr-2" />
                          Yes, Delete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Comments Modal */}
        {isCommentsModalOpen && (
          <>
            <div
              className="fixed inset-0 z-30 pointer-events-none"
              style={{ backdropFilter: "blur(2px)" }}
            ></div>
            <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
              <div
                className={`${
                  currentTheme.name === "dark" ? "bg-gray-800" : "bg-white"
                } rounded-lg p-6 max-w-lg w-full max-h-screen overflow-y-auto shadow-2xl pointer-events-auto opacity-95`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`${currentTheme.text} text-xl font-semibold`}>
                    Notes for the Task: {commentModalTitle}
                  </h3>
                  <button
                    onClick={() => setIsCommentsModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div
                  className={`${currentTheme.text} p-4 rounded ${
                    currentTheme.name === "dark" ? "bg-gray-700" : "bg-gray-100"
                  } min-h-[100px]`}
                >
                  {selectedTaskComments || "No comments available"}
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setIsCommentsModalOpen(false)}
                    className={`px-4 py-2 rounded ${
                      currentTheme.name === "dark"
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-gray-200 hover:bg-gray-300"
                    } ${currentTheme.text}`}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Edit Task Modal */}
        {isEditModalOpen && (
          <>
            <div
              className="fixed inset-0 z-30 pointer-events-none"
              style={{ backdropFilter: "blur(2px)" }}
            ></div>
            <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
              <div
                className={`${
                  currentTheme.name === "dark" ? "bg-gray-800" : "bg-white"
                } rounded-lg p-6 max-w-xl w-full max-h-screen overflow-y-auto shadow-2xl pointer-events-auto opacity-95`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`${currentTheme.text} text-xl font-semibold`}>
                    Edit Task
                  </h3>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Task Name */}
                  <div>
                    <label
                      className={`block ${currentTheme.text} font-medium mb-2`}
                    >
                      Task Name
                    </label>
                    <input
                      type="text"
                      value={editTask.taskname}
                      onChange={(e) =>
                        setEditTask({ ...editTask, taskname: e.target.value })
                      }
                      className={`w-full p-2 rounded border ${
                        currentTheme.name === "dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-black"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter task name"
                      required
                    />
                  </div>

                  {/* Urgency */}
                  <div>
                    <label
                      className={`block ${currentTheme.text} font-medium mb-2`}
                    >
                      Urgency
                    </label>
                    <div className="flex space-x-4">
                      <label
                        className={`flex items-center cursor-pointer ${currentTheme.text}`}
                      >
                        <input
                          type="radio"
                          name="urgency"
                          value="Normal"
                          checked={editTask.urgency === "Normal"}
                          onChange={() =>
                            setEditTask({ ...editTask, urgency: "Normal" })
                          }
                          className="mr-2"
                        />
                        Normal
                      </label>
                      <label
                        className={`flex items-center cursor-pointer ${currentTheme.text}`}
                      >
                        <input
                          type="radio"
                          name="urgency"
                          value="Critical"
                          checked={editTask.urgency === "Critical"}
                          onChange={() =>
                            setEditTask({ ...editTask, urgency: "Critical" })
                          }
                          className="mr-2"
                        />
                        Critical
                      </label>
                    </div>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label
                      className={`block ${currentTheme.text} font-medium mb-2`}
                    >
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={editTask.taskduedate}
                      onChange={(e) =>
                        setEditTask({ ...editTask, taskduedate: e.target.value })
                      }
                      className={`w-full p-2 rounded border ${
                        currentTheme.name === "dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-black"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {editTask.taskduedate && (
                      <div className="mt-2 text-sm flex items-center">
                        <Calendar size={16} className="mr-2 text-blue-500" />
                        <span className={currentTheme.text}>
                          {format(new Date(editTask.taskduedate), "MMMM d, yyyy")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Comments */}
                  <div>
                    <label
                      className={`block ${currentTheme.text} font-medium mb-2`}
                    >
                      Comments
                    </label>
                    <textarea
                      value={editTask.comments}
                      onChange={(e) =>
                        setEditTask({ ...editTask, comments: e.target.value })
                      }
                      rows={4}
                      className={`w-full p-2 rounded border ${
                        currentTheme.name === "dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-black"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter any comments or notes about this task"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={saveEditedTask}
                    disabled={isSaving}
                    className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center ${
                      isSaving ? "opacity-70" : ""
                    }`}
                  >
                    {isSaving ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check size={18} className="mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskHomeAdmin;