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
} from "lucide-react";
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
      RGV: "bg-blue-700"
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
  const getUrgencyBadge = (urgency, dueDate) => {
    let bgColor, text, flashingClass = "";
 
    
    // Check if task is late
    const isLate = dueDate && new Date() > new Date(dueDate) && 
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
      className={`${bgColor} ${flashingClass} text-white px-3 py-1 rounded text-xs font-bold inline-block text-center w-25`}
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
  const getRowClass = (index) => {
    // For dark theme, use slightly different shades to distinguish rows
    const evenRow =
      currentTheme.name === "dark" ? 'bg-gray-800' : "bg-gray-200";
    const oddRow = currentTheme.name === "dark" ? "bg-gray-700" : "bg-gray-100";

    return `${
      index % 2 === 0 ? evenRow : oddRow
    } hover:bg-opacity-90 transition duration-150 ease-in-out`;
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

  // Sort tasks according to requirements
  const sortedTasks = [...tasks].sort((a, b) => {
    // Helper to determine if task is late
    const isTaskLate = (task) => {
      const dueDate = task.taskduedate ? new Date(task.taskduedate) : null;
      return dueDate && new Date() > dueDate && 
            dueDate.toDateString() !== new Date().toDateString();
    };
    
    // Helper to get task priority score (lower number = higher priority)
    const getPriorityScore = (task) => {
      if (task.completed) return 6; // Completed tasks last
      const isLate = isTaskLate(task);
      
      if (task.urgency === "Critical" && isLate) return 1; // Critical and late first
      if (task.urgency !== "Critical" && isLate) return 2; // Normal and late second
      if (task.urgency === "Critical") return 3; // Critical third
      return 4; // Normal last
    };
    
    return getPriorityScore(a) - getPriorityScore(b);
  });

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
          <table className={`w-full table-fixed ${currentTheme.name === "dark" ? "bg-gray-900" : "bg-white"}`}>
            <thead>
              <tr className={headerClass}>
                <th className="p-3 text-left w-20 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span>Urgency 🔥</span>
                    
                  </div>
                </th>
                <th className="p-3 text-left pl-15 w-96">
                  <span>Task Details 📃</span>
                </th>
                <th className="p-3 text-center w-28 whitespace-nowrap">
                  <div className="flex items-center justify-center space-x-2">
                    <span>Due</span>
                    <Calendar size={14} />
                  </div>
                </th>
                <th className="p-3 text-center w-28 whitespace-nowrap">
                  <div className="flex items-center justify-left space-x-2">
                    <span>Perfect⭐</span>
                   
                  </div>
                </th>
                <th className="p-3 text-center w-40 whitespace-nowrap">
                  <div className="flex items-center pl-5 justify-start space-x-3">
                    <span>Assigned to 🙋 </span>
                    
                  </div>
                </th>
                <th className="p-3 text-center w-28 whitespace-nowrap">
                  <span>Task Age🗓️</span>
                </th>
                <th className="p-3 text-center justify-left w-32 whitespace-nowrap">
                  <span>Actions 🛠️</span>
                </th>
              </tr>
            </thead>
          </table>
          
          {/* Scrollable Body */}
          <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
            <table className={`w-full table-fixed ${currentTheme.name === "dark" ? "bg-gray-900" : "bg-white"}`}>
              <colgroup>
                <col className="w-20" />
                <col className="w-96" />
                <col className="w-28" />
                <col className="w-24" />
                <col className="w-48" />
                <col className="w-25" />
                <col className="w-32" />
              </colgroup>
              <tbody>
                {sortedTasks.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className={`text-center py-10 ${currentTheme.text}`}
                    >
                      No tasks found.
                    </td>
                  </tr>
                ) : (
                  sortedTasks.map((task, index) => {
                    const dueDate = task.taskduedate
                      ? new Date(task.taskduedate)
                      : null;

                    // Calculate task age (from creation date to now)
                    const createdAt = new Date(task.$createdAt);
                    const taskAge = differenceInDays(new Date(), createdAt);

                    return (
                      <tr key={task.$id} className={`${getRowClass(index)} `}>
                        {/* Urgency */}
                        <td className="p-2 whitespace-nowrap w-20">
                          {getUrgencyBadge(task.urgency, task.taskduedate)}
                        </td>

                        {/* Task Details */}
                        <td className="p-3 pl-15 truncate">
                          <p className={`${currentTheme.text} font-medium`}>
                            {task.taskname}
                          </p>
                        </td>

                        {/* Due Date */}
                        <td className="p-3 text-center">
                          <div className="flex justify-center">
                            {task.taskduedate ? (
                              getDueDateBadge(task.taskduedate)
                            ) : (
                              <div className="w-20  "></div>
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
                          <div className="flex items-center" style={{ marginLeft: "55px" }}>  {/* Changed from ml-4 (16px) to 19px */}
                            {getInitialsBadge(task.taskownerinitial)}
                            <span className={`${currentTheme.text} ml-1 text-sm truncate`}>
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
                              className={`p-2 text-green-500 hover:bg-${
                                currentTheme.name === "dark"
                                  ? "gray-700"
                                  : "green-100"
                              } rounded-full`}
                              aria-label="Mark complete"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              className={`p-2 text-blue-500 hover:bg-${
                                currentTheme.name === "dark" ? "gray-700" : "blue-100"
                              } rounded-full`}
                              aria-label="Edit task"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              className={`p-2 text-red-500 hover:bg-${
                                currentTheme.name === "dark" ? "gray-700" : "red-100"
                              } rounded-full`}
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
        </div>
      </div>
    </div>
  );
};

export default TaskHomeAdmin;