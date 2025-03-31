import React, { useState, useEffect } from "react";
import { databases, DATABASE_ID, COLLECTIONS } from "../appwrite/config";
import { Query } from "appwrite";
import {
  Star,
  Edit,
  Trash2,
  Check,
  ArrowUp,
  Calendar,
  UserCheck,
  CheckCircle,
  LayoutList,
  Clock,
  ListTodo,
  MessageSquare,
  X,
  AlertCircle,
  MessageSquareMore,
  MessageSquareOff,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useTheme } from "./ColorChange";

const TaskHomeAdmin = () => {
  const { currentTheme } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animatingTaskId, setAnimatingTaskId] = useState(null);
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sortByDueDate, setSortByDueDate] = useState(false);
const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'

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

  const handleDueDateClick = () => {
    if (sortByDueDate) {
      // If already sorting by due date, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Start sorting by due date
      setSortByDueDate(true);
      setSortDirection('asc');
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
        className={`${bgColor} ${flashingClass} text-white px-3 py-1 rounded text-xs  inline-block text-center w-25`}
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

  // Theme-dependent styles
  const headerClass =
    currentTheme.name === "dark"
      ? "bg-zinc-900 text-white border-b border-gray-700"
      : "bg-gray-300 text-gray-800 border-b border-gray-400";

  const containerClass =
    currentTheme.name === "dark"
      ? "bg-gray-900 rounded-lg shadow-xl overflow-hidden border border-gray-700 max-w-7xl mx-auto table-fixed"
      : "bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 max-w-7xl mx-auto table-fixed";

  // Replace your existing sorting logic with this updated version
const sortedAndFilteredTasks = [...tasks]
// Apply active/all filter
.filter(task => !showActiveOnly || !task.taskcompleted)
// Sort tasks
.sort((a, b) => {
  // Check if we're sorting by due date (when user clicks on Due Date header)
  if (sortByDueDate) {
    // Handle cases where one or both tasks don't have due dates
    if (!a.taskduedate && !b.taskduedate) return 0;
    if (!a.taskduedate) return 1; // b comes first
    if (!b.taskduedate) return -1; // a comes first
    
    // Compare due dates (ascending or descending based on sortDirection)
    const dateComparison = new Date(a.taskduedate) - new Date(b.taskduedate);
    return sortDirection === 'asc' ? dateComparison : -dateComparison;
  }
  
  // First, separate completed tasks (always push them to the bottom)
  if (a.taskcompleted && !b.taskcompleted) return 1;  // a goes after b
  if (!a.taskcompleted && b.taskcompleted) return -1; // a goes before b
  
  // If both are completed, sort by creation date (newest first)
  if (a.taskcompleted && b.taskcompleted) {
    return new Date(b.$createdAt) - new Date(a.$createdAt);
  }
  
  // Helper to determine if task is late
  const isTaskLate = (task) => {
    const dueDate = task.taskduedate ? new Date(task.taskduedate) : null;
    return dueDate && new Date() > dueDate && 
          dueDate.toDateString() !== new Date().toDateString();
  };
  
  const aIsLate = isTaskLate(a);
  const bIsLate = isTaskLate(b);
  const aIsCritical = a.urgency === "Critical";
  const bIsCritical = b.urgency === "Critical";
  
  // 1. Critical and late (group them and display based on oldest Due date)
  if (aIsCritical && aIsLate && bIsCritical && bIsLate) {
    // If both are critical and late, sort by due date (oldest first)
    return new Date(a.taskduedate) - new Date(b.taskduedate);
  }
  if (aIsCritical && aIsLate) return -1; // a goes before b
  if (bIsCritical && bIsLate) return 1;  // b goes before a
  
  // 2. Normal and Late (group them and display based on oldest Due date)
  if (aIsLate && bIsLate && !aIsCritical && !bIsCritical) {
    // If both are normal and late, sort by due date (oldest first)
    return new Date(a.taskduedate) - new Date(b.taskduedate);
  }
  if (aIsLate && !aIsCritical) return -1; // a goes before b
  if (bIsLate && !bIsCritical) return 1;  // b goes before a
  
  // 3. Critical task with due dates (group them and display based on oldest Due date)
  if (aIsCritical && a.taskduedate && bIsCritical && b.taskduedate) {
    // If both are critical with due dates, sort by due date (oldest first)
    return new Date(a.taskduedate) - new Date(b.taskduedate);
  }
  if (aIsCritical && a.taskduedate) return -1; // a goes before b
  if (bIsCritical && b.taskduedate) return 1;  // b goes before a
  
  // 4. Critical task without Due date
  if (aIsCritical && !a.taskduedate && bIsCritical && !b.taskduedate) {
    // If both are critical without due dates, sort by creation date (newest first)
    return new Date(b.$createdAt) - new Date(a.$createdAt);
  }
  if (aIsCritical && !a.taskduedate) return -1; // a goes before b
  if (bIsCritical && !b.taskduedate) return 1;  // b goes before a
  
  // 5. Normal task with due dates (group them and display based on oldest Due date)
  if (!aIsCritical && a.taskduedate && !bIsCritical && b.taskduedate) {
    // If both are normal with due dates, sort by due date (oldest first)
    return new Date(a.taskduedate) - new Date(b.taskduedate);
  }
  if (!aIsCritical && a.taskduedate) return -1; // a goes before b
  if (!bIsCritical && b.taskduedate) return 1;  // b goes before a
  
  // 6. Normal Tasks (without due dates)
  if (!aIsCritical && !a.taskduedate && !bIsCritical && !b.taskduedate) {
    // If both are normal without due dates, sort by creation date (newest first)
    return new Date(b.$createdAt) - new Date(a.$createdAt);
  }
  
  // If we've made it here, sort by creation date (newest first)
  return new Date(b.$createdAt) - new Date(a.$createdAt);
});

  // Calculate task statistics
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter((task) => task.taskcompleted).length,
    open: tasks.filter((task) => !task.taskcompleted).length,
    overdue: tasks.filter((task) => {
      const dueDate = task.taskduedate ? new Date(task.taskduedate) : null;
      return (
        !task.taskcompleted &&
        dueDate &&
        new Date() > dueDate &&
        dueDate.toDateString() !== new Date().toDateString()
      );
    }).length,
  };

  if (loading) {
    return (
      <div className={`text-center py-10 ${currentTheme.text}`}>
        Loading tasks...
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <div className="relative max-w-7xl mx-auto">
        {/* Fixed Header Table */}
        <div className="overflow-hidden rounded-lg shadow-xl border border-gray-700">
          {/* Header */}
          <table
            className={`w-full table-fixed ${
              currentTheme.name === "dark" ? "bg-gray-900" : "bg-white"
            }`}
          >
            <thead>
              <tr className={headerClass}>
                <th className="p-3 text-right w-20 whitespace-nowrap">
                  <div className="flex items-center ml-3 space-x-2">
                    <span>Urgency 🔥</span>
                  </div>
                </th>
                <th className="p-3 text-left pl-15 w-113">
                  <span>Task Details 📃</span>
                </th>
                <th className="p-3 text-right  w-20">
                  <span>Notes</span>
                </th>
                <th 
  className="p-3 text-center w-20 whitespace-nowrap cursor-pointer hover:bg-opacity-80"
  onClick={handleDueDateClick}
>
  <div className="flex items-center justify-center">
    <span>Due</span>
    <Calendar size={14} />
    {sortByDueDate && (
      <span className="ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    )}
  </div>
</th>
                <th className="p-3 text-center w-23 whitespace-nowrap">
                  <div className="flex items-center justify-center space-x-2">
                    <span>Perfect ⭐</span>
                  </div>
                </th>
                <th className="p-3 text-center w-40 whitespace-nowrap">
                  <div className="flex items-center pl-5 justify-start space-x-3">
                    <span>Assigned to 🙋 </span>
                  </div>
                </th>
                <th className="p-3 text-center w-24 whitespace-nowrap">
                  <span>Task Age🗓️</span>
                </th>
                <th className="p-3 text-center justify-left w-32 whitespace-nowrap">
                  <span>Actions ⚙️</span>
                </th>
              </tr>
            </thead>
          </table>

          {/* Scrollable Body */}
          <div
            className="overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 250px)" }}
          >
            <table
              className={`w-full table-fixed ${
                currentTheme.name === "dark" ? "bg-gray-900" : "bg-white"
              }`}
            >
              <colgroup>
                <col className="w-20" /> {/* Urgency */}
                <col className="w-109" /> {/* Task Details */}
                <col className="w-15" />{" "}
                {/* Comments - reduced from w-32 to w-16 */}
                <col className="w-20" /> {/* Due Date */}
                <col className="w-20" /> {/* Star */}
                <col className="w-40" /> {/* Assigned to */}
                <col className="w-20" /> {/* Task Age */}
                <col className="w-32" /> {/* Actions */}
              </colgroup>
              <tbody>
                {sortedAndFilteredTasks.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className={`text-center py-10 ${currentTheme.text}`}
                    >
                      No tasks found.
                    </td>
                  </tr>
                ) : (
                  sortedAndFilteredTasks.map((task, index) => {
                    const dueDate = task.taskduedate
                      ? new Date(task.taskduedate)
                      : null;

                    // Calculate task age (from creation date to now)
                    const createdAt = new Date(task.$createdAt);
                    const taskAge = differenceInDays(new Date(), createdAt);

                    // Animation classes for task completion
                    const isAnimating = animatingTaskId === task.$id;
                    const animationClass = isAnimating
                      ? "transition-all ease-in-out duration-1500 transform scale-10 opacity-85"
                      : "transition-all duration-2000";

                    return (
                      <tr
                        key={task.$id}
                        className={`${getRowClass(
                          index,
                          task.taskcompleted
                        )} ${animationClass}`}
                      >
                        {/* Urgency */}
                        <td className="p-2 whitespace-nowrap w-20">
                          {getUrgencyBadge(
                            task.urgency,
                            task.taskduedate,
                            task.taskcompleted
                          )}
                        </td>

                        {/* Task Details */}
                        <td className="p-3 pl-15 truncate">
                          <p
                            className={`${currentTheme.text}  ${
                              task.taskcompleted ? "line-through" : ""
                            }`}
                          >
                            {task.taskname}
                          </p>
                        </td>

                        {/* Comments/Notes Column */}
                        <td className="p-1 text-center">
                          <button
                            onClick={() =>
                              task.comments ? openCommentsModal(task) : null
                            }
                            className={`flex items-center justify-center mx-auto ${
                              task.comments
                                ? "cursor-pointer hover:text-blue-500"
                                : "cursor-not-allowed opacity-70"
                            }`}
                            title={
                              task.comments
                                ? "View Notes"
                                : "No Notes Available"
                            }
                            disabled={!task.comments}
                          >
                            {task.comments ? (
                              <MessageSquareMore
                                size={20}
                                className="text-blue-500"
                              />
                            ) : (
                              <MessageSquareOff
                                size={20}
                                className="text-gray-400"
                              />
                            )}
                          </button>
                        </td>

                        {/* Due Date */}
                        <td className="p-3 text-center">
                          <div className="flex justify-center">
                            {task.taskduedate ? (
                              getDueDateBadge(task.taskduedate)
                            ) : (
                              <div className="w-20"></div>
                            )}
                          </div>
                        </td>

                        {/* Perfect Star */}
                        <td className="p-3 text-center">
                          <div className="flex justify-center w-full">
                            <Star
                              size={23}
                              className={
                                task.perfectstar
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-gray-400"
                              }
                            />
                          </div>
                        </td>

                        {/* Assigned To */}
                        <td className="p-3">
                          <div
                            className="flex items-center"
                            style={{ marginLeft: "25px" }}
                          >
                            {getInitialsBadge(task.taskownerinitial)}
                            <span
                              className={`${currentTheme.text} ml-1 text-sm truncate`}
                            >
                              {task.taskownername}
                            </span>
                          </div>
                        </td>

                        {/* Task Age */}
                        <td className="p-3 text-xs text-center">
                          <div className="flex justify-center">
                            {getTaskAgeBadge(taskAge)}
                          </div>
                        </td>

                        {/* Action Buttons */}
                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              className={`p-2 rounded cursor-pointer ${
                                task.taskcompleted
                                  ? currentTheme.name === "dark"
                                    ? "text-gray-400"
                                    : "text-gray-500"
                                  : currentTheme.name === "dark"
                                  ? "text-green-400"
                                  : "text-green-900"
                              } ${
                                currentTheme.name === "dark"
                                  ? "hover:bg-gray-950 hover:text-white"
                                  : "hover:bg-green-900 hover:text-white"
                              } opacity-100`}
                              aria-label={
                                task.taskcompleted
                                  ? "Mark incomplete"
                                  : "Mark complete"
                              }
                              onClick={() =>
                                toggleTaskCompletion(
                                  task.$id,
                                  task.taskcompleted
                                )
                              }
                              disabled={isAnimating}
                            >
                              <Check size={18} />
                            </button>
                            <button
                              className={`p-2 text-blue-500 rounded-full cursor-pointer ${
                                currentTheme.name === "dark"
                                  ? "hover:bg-gray-950 hover:text-white"
                                  : "hover:bg-blue-900 hover:text-white"
                              } opacity-100 ${
                                task.taskcompleted
                                  ? "opacity-30 cursor-not-allowed"
                                  : ""
                              }`}
                              aria-label="Edit task"
                              onClick={
                                task.taskcompleted
                                  ? undefined
                                  : () => openEditModal(task)
                              }
                              disabled={task.taskcompleted}
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              className={`p-2 text-red-500 rounded-full cursor-pointer ${
                                currentTheme.name === "dark"
                                  ? "hover:bg-gray-950 hover:text-white"
                                  : "hover:bg-red-600 hover:text-white"
                              } opacity-100`}
                              aria-label="Delete task"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Task Filters and Statistics Row */}
          <div
            className={`p-4 ${
              currentTheme.name === "dark"
                ? "bg-gray-800 border-t border-gray-700"
                : "bg-gray-100 border-t border-gray-300"
            }`}
          >
            <div className="flex justify-between items-center">
              {/* Task Filters - Left Side */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="active-tasks"
                    name="task-filter"
                    checked={showActiveOnly}
                    onChange={() => setShowActiveOnly(true)}
                    className="h-4 w-4 text-blue-600 cursor-pointer"
                  />
                  <label
                    htmlFor="active-tasks"
                    className={`${currentTheme.text} text-sm font-medium cursor-pointer`}
                  >
                    Active Tasks
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="all-tasks"
                    name="task-filter"
                    checked={!showActiveOnly}
                    onChange={() => setShowActiveOnly(false)}
                    className="h-4 w-4 text-blue-600 cursor-pointer"
                  />
                  <label
                    htmlFor="all-tasks"
                    className={`${currentTheme.text} text-sm font-medium cursor-pointer`}
                  >
                    All Tasks
                  </label>
                </div>
              </div>

              {/* Task Statistics - Right Side */}
              <div className="flex flex-wrap items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm">
                  <ListTodo
                    size={18}
                    className={
                      currentTheme.name === "dark"
                        ? "text-blue-400"
                        : "text-blue-600"
                    }
                  />
                  <span className={`${currentTheme.text} font-bold`}>
                    Total : <strong>{taskStats.total}</strong>
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle
                    size={18}
                    className={
                      currentTheme.name === "dark"
                        ? "text-green-400"
                        : "text-green-600"
                    }
                  />
                  <span className={`${currentTheme.text} font-bold`}>
                    Completed : <strong>{taskStats.completed}</strong>
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <LayoutList
                    size={18}
                    className={
                      currentTheme.name === "dark"
                        ? "text-amber-400"
                        : "text-amber-600"
                    }
                  />
                  <span className={`${currentTheme.text} font-bold`}>
                    Open : <strong>{taskStats.open}</strong>
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <Clock size={18} className="text-red-500" />
                  <span className={`${currentTheme.text} font-bold`}>
                    Overdue : <strong>{taskStats.overdue}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                // Then update the Save button in your Edit Modal
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
  );
};

export default TaskHomeAdmin;
