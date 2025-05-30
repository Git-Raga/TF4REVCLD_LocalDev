// RecurringTaskTable.jsx - Updated with Improved Section Dividers (Footer Removed)
import React, { useState, useEffect, useRef } from "react";
import {
  Star,
  Edit,
  Trash2,
  Check,
  ArrowUp,
  Calendar,
  X,
  MessageSquareMore,
  MessageSquareOff,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { DeleteConfirmationModal, CommentsModal } from "./ModelOps";
import { RecurringTaskEditModal } from "./RecurringTaskEdit";

const RecurringTaskTable = ({
  currentTheme,
  sortedAndFilteredTasks,
  toggleRecurringDone,
  animatingTaskId,
  toggleTaskCompletion,
  onSaveTask, // NEW: Add this prop for the actual save function
  openEditModal,
  openDeleteModal,
  openCommentsModal,
  getInitialsBadge,
  getUrgencyBadge,
  getDueDateBadge,
  getTaskAgeBadge,
  getRowClass,
  showActiveOnly,
  pageTitle = "Task Details",
}) => {
  // Add state for modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Custom function to handle the edit modal
  const handleEditTask = (task) => {
    // Make sure to convert task data to the correct format
    const formattedTask = {
      ...task,
      recurringfreq: task.recurringfreq || "",
      // Ensure recurringday is lowercase to match select options
      recurringday: task.recurringday ? task.recurringday.toLowerCase() : "",
      comments: task.comments || "",
    };
    
    setSelectedTask(formattedTask);
    setIsEditModalOpen(true);
  };

  // Fixed saveEditedTask function for RecurringTaskTable.jsx
  const saveEditedTask = async (taskToSave = null) => {
    if (!taskToSave) {
      console.error("No task data provided to save");
      return;
    }
    
    console.log("saveEditedTask called with:", taskToSave);
    
    setIsSaving(true);
    
    try {
      // Prepare the complete task object with all required fields
      const completeTaskData = {
        ...taskToSave,
        recurringtask: true,
        recurringfreq: taskToSave.recurringfreq || selectedTask.recurringfreq,
      };
      
      console.log("Calling parent onSaveTask with:", completeTaskData);
      
      // FIXED: Call the actual save function passed from parent
      if (onSaveTask) {
        await onSaveTask(completeTaskData);
      } else {
        // Fallback to the old method if onSaveTask is not provided
        await openEditModal(completeTaskData);
      }
      
      console.log("Parent save completed successfully");
      
      // Close modal after successful save
      setIsEditModalOpen(false);
      setSelectedTask(null);
      
    } catch (error) {
      console.error("Error in saveEditedTask:", error);
      alert("Failed to update task. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // NEW: Group tasks by frequency
  // NEW: Group tasks by frequency and sort by completion status
const groupTasksByFrequency = (tasks) => {
  const grouped = tasks.reduce((acc, task) => {
    const freq = task.recurringfreq || 'other';
    if (!acc[freq]) {
      acc[freq] = [];
    }
    acc[freq].push(task);
    return acc;
  }, {});
  
  // Sort tasks within each frequency group: pending first, then completed
  Object.keys(grouped).forEach(freq => {
    grouped[freq].sort((a, b) => {
      // Primary sort: pending tasks first (recurringdone = false first)
      if (a.recurringdone !== b.recurringdone) {
        return a.recurringdone ? 1 : -1; // false (pending) comes before true (done)
      }
      
      // Secondary sort: within same status, maintain original order or sort by task name
      return a.taskname.localeCompare(b.taskname);
    });
  });
  
  // Return in desired order: weekly, monthly, then others
  const orderedGroups = [];
  if (grouped.weekly) orderedGroups.push({ frequency: 'weekly', tasks: grouped.weekly });
  if (grouped.monthly) orderedGroups.push({ frequency: 'monthly', tasks: grouped.monthly });
  if (grouped.daily) orderedGroups.push({ frequency: 'daily', tasks: grouped.daily });
  if (grouped.yearly) orderedGroups.push({ frequency: 'yearly', tasks: grouped.yearly });
  if (grouped.other) orderedGroups.push({ frequency: 'other', tasks: grouped.other });
  
  return orderedGroups;
};

  // NEW: Section Header Component
  const SectionHeader = ({ frequency, tasks }) => {
    const pendingCount = tasks.filter(task => !task.recurringdone).length;
    
    const getFrequencyInfo = (freq) => {
      switch (freq) {
        case 'weekly':
          return { 
            symbol: 'W', 
            title: 'Weekly Tasks', 
            bgColor: 'bg-teal-400', 
            textColor: 'text-black'
          };
        case 'monthly':
          return { 
            symbol: 'M', 
            title: 'Monthly Tasks', 
            bgColor: 'bg-teal-800', 
            textColor: 'text-white'
          };
        case 'daily':
          return { 
            symbol: 'D', 
            title: 'Daily Tasks', 
            bgColor: 'bg-green-600', 
            textColor: 'text-white'
          };
        case 'yearly':
          return { 
            symbol: 'Y', 
            title: 'Yearly Tasks', 
            bgColor: 'bg-orange-600', 
            textColor: 'text-white'
          };
        default:
          return { 
            symbol: 'O', 
            title: 'Other Tasks', 
            bgColor: 'bg-gray-600', 
            textColor: 'text-white'
          };
      }
    };

    const info = getFrequencyInfo(frequency);

    return (
      <tr className={`${currentTheme.name === "dark" ? "bg-gray-900" : "bg-gray-50"}`}>
        <td colSpan="8" className="p-0">
          <div className={`${info.bgColor} ${info.textColor} px-6 py-2 border-l-4 border-l-blue-500`}>
          <div className="flex items-center justify-between">
  <div className="flex-1"></div>
  <div className="flex items-center space-x-3 flex-1 justify-center">
    {/* Round symbol instead of icon */}
    <div className="w-8 h-8 bg-white bg-opacity-20 text-black rounded-full flex items-center justify-center">
      <span className="font-bold text-lg">{info.symbol}</span>
    </div>
    <div>
      <h3 className="font-bold text-lg">{info.title}</h3>
    </div>
  </div>
  <div className="flex items-center space-x-2 flex-1 justify-end">
    <span className="bg-white bg-opacity-20 px-3 py-1 text-black rounded-full text-sm font-semibold">
      {pendingCount} Pending
    </span>
  </div>
</div>
          </div>
        </td>
      </tr>
    );
  };

  // Theme-dependent styles
  const headerClass =
    currentTheme.name === "dark"
      ? "bg-zinc-900 text-white border-b border-gray-700"
      : "bg-gray-300 text-gray-800 border-b border-gray-400";

  // Get frequency badge
  const getFrequencyBadge = (frequency) => {
    let bgColor = "bg-blue-500";
    let textColor = "text-white"; // Default text color
    let text = frequency || "Single";

    if (frequency === "daily") {
      bgColor = "bg-green-600";
      textColor = "text-white";
    } else if (frequency === "weekly") {
      bgColor = "bg-teal-400";
      textColor = "text-black"; // Custom text color for weekly
      text = "Weekly";
    } else if (frequency === "monthly") {
      bgColor = "bg-teal-800";
      textColor = "text-white";
      text = "Monthly";
    } else if (frequency === "yearly") {
      bgColor = "bg-orange-600";
      textColor = "text-white";
      text = "Yearly";
    }

    return (
      <div
        className={`${bgColor} ${textColor} px-3 py-1 rounded text-xs inline-block text-center w-20`}
      >
        {text}
      </div>
    );
  };

  // Add this function before the return statement
  const getOrdinalSuffix = (number) => {
    const num = parseInt(number);
    const j = num % 10;
    const k = num % 100;

    if (j === 1 && k !== 11) {
      return num + "st";
    }
    if (j === 2 && k !== 12) {
      return num + "nd";
    }
    if (j === 3 && k !== 13) {
      return num + "rd";
    }
    return num + "th";
  };

  // Get weekday badge
  const getWeekdayBadge = (weekday) => {
    if (!weekday) return null;

    return (
      <div className="bg-indigo-600 text-white px-3 py-1 rounded text-xs inline-block text-center w-20">
        {weekday}
      </div>
    );
  };

  // Get status badge with teal colors matching frequency badges
  const getStatusBadge = (status, isCompleted, recurringDone, frequency, isAnimating) => {
    // Set default values
    let badgeClass = "bg-red-500 text-white"; // Default for Pending
    let text = "Pending";
  
    // For weekly tasks
    if (frequency === "weekly") {
      if (recurringDone) {
        badgeClass = "bg-teal-400 text-black"; // Exact match to Weekly frequency badge
        text = "Weekly Done";
      }
    } 
    // For monthly tasks
    else if (frequency === "monthly") {
      if (recurringDone) {
        badgeClass = "bg-teal-800 text-white"; // Exact match to Monthly frequency badge
        text = "Monthly Done";
      }
    }
  
    // Apply flip animation only when animating
    const animationClass = isAnimating ? "status-flip" : "";
  
    return (
      <div
        className={`${badgeClass} px-2 py-1 rounded text-xs inline-block text-center whitespace-nowrap min-w-[100px] max-w-[100px] ${animationClass}`}
      >
        {text}
      </div>
    );
  };

  // NEW: Render task row component
  const renderTaskRow = (task, index) => {
    const dueDate = task.taskduedate ? new Date(task.taskduedate) : null;
    const isAnimating = animatingTaskId === task.$id;

    return (
      <tr
        key={task.$id}
        className={`${getRowClass(
          index,
          task.taskcompleted
        )} ${
          task.recurringdone ? "opacity-70" : ""
        }`}
      >
        {/* Frequency */}
        <td className="p-2 text-center">
          <div className="flex justify-center">
            {getFrequencyBadge(task.recurringfreq)}
          </div>
        </td>
        {/* Weekday */}
        <td className="p-2 text-center">
          <div className="flex justify-center">
            {task.recurringfreq === "weekly" &&
            task.recurringday ? (
              <div className="bg-black text-white px-3 py-1 rounded text-xs inline-block text-center w-20">
                {task.recurringday.charAt(0).toUpperCase() +
                  task.recurringday.slice(1)}
              </div>
            ) : (
              <div className=" text-teal-700 px-3 py-1 rounded text-xs inline-block text-center w-20">
                ---
              </div>
            )}
          </div>
        </td>
        {/* Due on */}
        <td className="p-2 text-center">
          <div className="flex justify-center">
            {task.recurringfreq === "monthly" &&
            task.recurringday ? (
              <div className="bg-red-500 text-xs text-white px-3 py-1 rounded text-sm inline-block text-center w-20">
                {getOrdinalSuffix(task.recurringday)}
              </div>
            ) : task.recurringfreq === "weekly" ? (
              <div className="w-20"></div>
            ) : task.taskduedate ? (
              getDueDateBadge(task.taskduedate)
            ) : (
              <div className="w-20"></div>
            )}
          </div>
        </td>
        {/* Recurring task details with strikethrough for done tasks */}
        <td className="p-2 pl-10 truncate">
          <p
            className={`${currentTheme.text} font-bold transition-all duration-300 ${
              task.recurringdone 
                ? "line-through opacity-60 text-gray-500" 
                : ""
            } ${
              task.taskcompleted 
                ? "line-through opacity-30" 
                : ""
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
              task.comments ? "View Notes" : "No Notes Available"
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
        {/* Assigned To */}
        <td className="p-2">
          <div className="flex items-center ml-8">
            {getInitialsBadge(task.taskownerinitial)}
            <span
              className={`${currentTheme.text} ml-1 text-sm truncate`}
            >
              {task.taskownername}
            </span>
          </div>
        </td>
        {/* Status */}
        <td className="p-2 text-center">
          <div className="flex justify-center">
            {getStatusBadge(
              task.status, 
              task.taskcompleted, 
              task.recurringdone, 
              task.recurringfreq,
              animatingTaskId === task.$id
            )}
          </div>
        </td>
        {/* Action Buttons */}
        <td className="p-2 text-right">
          <div className="flex items-center justify-end space-x-3">
            {/* Toggle Complete/Pending Button */}
            <button
              className={`p-2 rounded-full cursor-pointer ${
                task.recurringdone
                  ? "bg-gray-900 text-white hover:bg-black"
                  : "bg-gray-200 text-black hover:bg-gray-300"
              } ${animatingTaskId === task.$id ? "animate-spin" : ""}`}
              aria-label={task.recurringdone ? "Mark Pending" : "Mark Complete"}
              onClick={() => toggleRecurringDone(task.$id, task.recurringdone)}
              disabled={isAnimating}
              title={task.recurringdone ? "Mark Pending" : "Mark Complete"}
            >
              {task.recurringdone ? (
                <X size={15} />
              ) : (
                <Check size={15} />
              )}
            </button>
            
            {/* Edit Button */}
            <button
              className={`p-2 bg-gray-600 text-white rounded-full cursor-pointer hover:bg-gray-700 ${
                task.taskcompleted ? "opacity-50 cursor-not-allowed" : ""
              }`}
              aria-label="Edit task"
              onClick={task.taskcompleted ? undefined : () => handleEditTask(task)}
              disabled={task.taskcompleted}
              title="Edit"
            >
              <Edit size={15} />
            </button>

            {/* Delete Button */}
            <button
              className="p-2 bg-gray-800 text-white rounded-full cursor-pointer hover:bg-black"
              aria-label="Delete task"
              onClick={() => openDeleteModal(task)}
              title="Delete"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  // Group tasks by frequency
  const groupedTasks = groupTasksByFrequency(sortedAndFilteredTasks);

  return (
    <div className="overflow-hidden rounded-lg shadow-xl border border-gray-700">
      {/* Header */}
      <table
        className={`w-full table-fixed ${
          currentTheme.name === "dark" ? "bg-gray-900" : "bg-white"
        }`}
      >
        <colgroup>
          <col className="w-12" />
          <col className="w-14" />
          <col className="w-14" />
          <col className="w-[40%]" />
          <col className="w-8" />
          <col className="w-32" />
          <col className="w-20" />
          <col className="w-28" />
        </colgroup>
        <thead>
          <tr className={headerClass}>
            <th className="p-3 text-center whitespace-nowrap">
              <span>Frequency</span>
            </th>
            <th className="p-3 text-center whitespace-nowrap">
              <span>Due-Day</span>
            </th>
            <th className="p-3 text-center whitespace-nowrap">
              <div className="flex items-center justify-center space-x-2">
                <span>Due-Date 📆</span>
              </div>
            </th>
            <th className="p-3 pl-10 text-left">
              <span> {pageTitle} 📃</span>
            </th>
            <th className="p-2 text-center">
              <span>Notes</span>
            </th>
            <th className="p-3 whitespace-nowrap">
              <div className="flex items-center pl-5 justify-start space-x-3">
                <span>Assigned to 🙋</span>
              </div>
            </th>
            <th className="p-3 text-center whitespace-nowrap">
              <span>Status</span>
            </th>
            <th className="p-3 text-right whitespace-nowrap">
              <span>Actions ⚙️</span>
            </th>
          </tr>
        </thead>
      </table>

      {/* Scrollable Body with Grouped Sections */}
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
            <col className="w-12" />
            <col className="w-14" />
            <col className="w-14" />
            <col className="w-[40%]" />
            <col className="w-8" />
            <col className="w-32" />
            <col className="w-20" />
            <col className="w-28" />
          </colgroup>
          <tbody>
            {groupedTasks.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className={`text-center py-10 ${currentTheme.text}`}
                >
                  No recurring tasks found.
                </td>
              </tr>
            ) : (
              groupedTasks.map((group, groupIndex) => (
                <React.Fragment key={group.frequency}>
                  {/* Section Header */}
                  <SectionHeader 
                    frequency={group.frequency} 
                    tasks={group.tasks}
                  />
                  
                  {/* Tasks in this section */}
                  {group.tasks.map((task, taskIndex) => 
                    renderTaskRow(task, taskIndex)
                  )}
                  
                  {/* Add spacing between sections (except for the last one) */}
                  {groupIndex < groupedTasks.length - 1 && (
                    <tr>
                      <td colSpan="8" className="h-4"></td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Recurring Task Edit Modal */}
      {selectedTask && (
        <RecurringTaskEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={saveEditedTask}
          editTask={selectedTask}
          setEditTask={setSelectedTask}
          isSaving={isSaving}
          currentTheme={currentTheme}
        />
      )}
    </div>
  );
};

export default RecurringTaskTable;