// RecurringTaskTable.jsx - Fixed Responsive Positioning
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
  onSaveTask,
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
  sidebarCollapsed = false, // ADD THIS LINE
}) => {
  // Add state for modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Custom function to handle the edit modal
  const handleEditTask = (task) => {
    const formattedTask = {
      ...task,
      recurringfreq: task.recurringfreq || "",
      recurringday: task.recurringday ? task.recurringday.toLowerCase() : "",
      comments: task.comments || "",
    };
    
    setSelectedTask(formattedTask);
    setIsEditModalOpen(true);
  };

  // Fixed saveEditedTask function
  const saveEditedTask = async (taskToSave = null) => {
    if (!taskToSave) {
      console.error("No task data provided to save");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const completeTaskData = {
        ...taskToSave,
        recurringtask: true,
        recurringfreq: taskToSave.recurringfreq || selectedTask.recurringfreq,
      };
      
      if (onSaveTask) {
        await onSaveTask(completeTaskData);
      } else {
        await openEditModal(completeTaskData);
      }
      
      setIsEditModalOpen(false);
      setSelectedTask(null);
      
    } catch (error) {
      console.error("Error in saveEditedTask:", error);
      alert("Failed to update task. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Separate tasks by frequency
  const separateTasksByFrequency = (tasks) => {
    const weekly = tasks.filter(task => task.recurringfreq === 'weekly');
    const monthly = tasks.filter(task => task.recurringfreq === 'monthly');
    
    // Sort within each group: pending first, then completed
    const sortTasks = (taskArray) => {
      return taskArray.sort((a, b) => {
        if (a.recurringdone !== b.recurringdone) {
          return a.recurringdone ? 1 : -1;
        }
        return a.taskname.localeCompare(b.taskname);
      });
    };

    return {
      weekly: sortTasks(weekly),
      monthly: sortTasks(monthly)
    };
  };

// Enhanced Section Header Component - FIXED VERSION
const SectionHeader = ({ frequency, tasks, sectionTitle }) => {
  const pendingCount = tasks.filter(task => !task.recurringdone).length;
  const completedCount = tasks.filter(task => task.recurringdone).length;
  
  const getFrequencyInfo = (freq) => {
    switch (freq) {
      case 'weekly':
        return { 
          symbol: 'W', 
          bgColor: 'bg-gradient-to-r from-gray-600 to-orange-600',
          textColor: 'text-white',
          borderColor: 'border-l-orange-500',
          symbolBg: 'bg-gray-800'
        };
      case 'monthly':
        return { 
          symbol: 'M', 
          bgColor: 'bg-gradient-to-r from-gray-600 to-green-700',
          textColor: 'text-white',
          borderColor: 'border-l-white',
          symbolBg: 'bg-gray-800'
        };
      default:
        return { 
          symbol: 'O', 
          bgColor: 'bg-gradient-to-r from-gray-600 to-orange-700', 
          textColor: 'text-white',
          borderColor: 'border-l-gray-500',
          symbolBg: 'bg-gray-800'
        };
    }
  };

  const info = getFrequencyInfo(frequency);

  return (
    <div className={`${info.bgColor} ${info.textColor} px-5 py-1 border-l-6 ${info.borderColor} shadow-lg`}>
      <div className="flex items-center justify-center">
        {/* Left side - Symbol and Title */}
        <div className="flex items-center space-x-2">
          {/* FIXED: Enhanced symbol container with better contrast */}
          <div className={`w-12 h-10 ${info.symbolBg} rounded-xl flex items-center justify-center shadow-md border-2 border-white border-opacity-30`}>
            <span className="font-black text-xl text-white drop-shadow-lg">{info.symbol}</span>
          </div>
          <div>
            <h2 className="text-xl font-bold drop-shadow-md">{sectionTitle}</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

  // Table Header Component
  const TableHeader = ({ title, frequency }) => {
    const headerClass = currentTheme.name === "dark"
      ? "bg-black text-white border-b border-gray-600"
      : "bg-gray-200 text-gray-800 border-b border-gray-300";

    return (
      <thead>
        <tr className={headerClass}>
          <th className="p-2 text-center whitespace-nowrap">
            <span>Frequency</span>
          </th>
          {frequency === "weekly" && (
            <th className="p-2 text-center whitespace-nowrap">
              <span>Due-Day</span>
            </th>
          )}
          {frequency === "monthly" && (
            <th className="p-2 text-center whitespace-nowrap">
              <div className="flex items-center justify-center space-x-2">
                <span>Due-Date 📆</span>
              </div>
            </th>
          )}
          <th className="p-2 pl-10 text-left">
            <span>{title} 📃</span>
          </th>
          <th className="p-2 text-center">
            <span>Notes</span>
          </th>
          <th className="p-2 whitespace-nowrap">
            <div className="flex items-center pl-5 justify-start space-x-3">
              <span>Assigned to 🙋</span>
            </div>
          </th>
          <th className="p-2 text-center whitespace-nowrap">
            <span>Status</span>
          </th>
          <th className="p-2 text-right whitespace-nowrap">
            <span>Actions ⚙️</span>
          </th>
        </tr>
      </thead>
    );
  };

  // Get frequency badge
  const getFrequencyBadge = (frequency) => {
    let bgColor = "bg-blue-500";
    let textColor = "text-white";
    let text = frequency || "Single";

    if (frequency === "weekly") {
      bgColor = "bg-teal-400";
      textColor = "text-black";
      text = "Weekly";
    } else if (frequency === "monthly") {
      bgColor = "bg-teal-800";
      textColor = "text-white";
      text = "Monthly";
    }

    return (
      <div className={`${bgColor} ${textColor} px-3 py-1 rounded text-xs inline-block text-center w-20`}>
        {text}
      </div>
    );
  };

  const getOrdinalSuffix = (number) => {
    const num = parseInt(number);
    const j = num % 10;
    const k = num % 100;

    if (j === 1 && k !== 11) return num + "st";
    if (j === 2 && k !== 12) return num + "nd";
    if (j === 3 && k !== 13) return num + "rd";
    return num + "th";
  };

  const getStatusBadge = (status, isCompleted, recurringDone, frequency, isAnimating) => {
    let badgeClass = "bg-red-500 text-white";
    let text = "Pending";
  
    if (frequency === "weekly" && recurringDone) {
      badgeClass = "bg-teal-400 text-black";
      text = "Weekly Done";
    } else if (frequency === "monthly" && recurringDone) {
      badgeClass = "bg-teal-800 text-white";
      text = "Monthly Done";
    }
  
    const animationClass = isAnimating ? "status-flip" : "";
  
    return (
      <div className={`${badgeClass} px-2 py-1 rounded text-xs inline-block text-center whitespace-nowrap min-w-[100px] max-w-[100px] ${animationClass}`}>
        {text}
      </div>
    );
  };

  // Render task row component
  const renderTaskRow = (task, index, frequency) => {
    const isAnimating = animatingTaskId === task.$id;

    return (
      <tr
        key={task.$id}
        className={`${getRowClass(index, task.taskcompleted)} ${
          task.recurringdone ? "opacity-70" : ""
        }`}
      >
        {/* Frequency */}
        <td className="p-2 text-center">
          <div className="flex justify-center">
            {getFrequencyBadge(task.recurringfreq)}
          </div>
        </td>
        
        {/* Weekday - Only for weekly */}
        {frequency === "weekly" && (
          <td className="p-2 text-center">
            <div className="flex justify-center">
              {task.recurringfreq === "weekly" && task.recurringday ? (
                <div className="bg-black text-white px-3 py-1 rounded text-xs inline-block text-center w-20">
                  {task.recurringday.charAt(0).toUpperCase() + task.recurringday.slice(1)}
                </div>
              ) : (
                <div className="text-teal-700 px-3 py-1 rounded text-xs inline-block text-center w-20">
                  ---
                </div>
              )}
            </div>
          </td>
        )}
        
        {/* Due on - Only for monthly */}
        {frequency === "monthly" && (
          <td className="p-2 text-center">
            <div className="flex justify-center">
              {task.recurringfreq === "monthly" && task.recurringday ? (
                <div className="bg-red-500 text-xs text-white px-3 py-1 rounded text-sm inline-block text-center w-20">
                  {getOrdinalSuffix(task.recurringday)}
                </div>
              ) : task.taskduedate ? (
                getDueDateBadge(task.taskduedate)
              ) : (
                <div className="w-20"></div>
              )}
            </div>
          </td>
        )}
        
        {/* Task details */}
        <td className="p-2 pl-10 ">
          <p
            className={`${currentTheme.text} transition-all duration-300 ${
              task.recurringdone ? "line-through opacity-60 text-gray-500" : ""
            } ${task.taskcompleted ? "line-through opacity-30" : ""}`}
          >
            {task.taskname}
          </p>
        </td>
        
        {/* Comments */}
        <td className="p-1 text-center">
          <button
            onClick={() => task.comments ? openCommentsModal(task) : null}
            className={`flex items-center justify-center mx-auto ${
              task.comments ? "cursor-pointer hover:text-blue-500" : "cursor-not-allowed opacity-70"
            }`}
            title={task.comments ? "View Notes" : "No Notes Available"}
            disabled={!task.comments}
          >
            {task.comments ? (
              <MessageSquareMore size={20} className="text-blue-500" />
            ) : (
              <MessageSquareOff size={20} className="text-gray-400" />
            )}
          </button>
        </td>
        
        {/* Assigned To */}
        <td className="p-2">
          <div className="flex items-center ml-8">
            {getInitialsBadge(task.taskownerinitial)}
            <span className={`${currentTheme.text} ml-1 text-sm truncate`}>
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
        
        {/* Actions */}
        <td className="p-2 text-right">
          <div className="flex items-center justify-end space-x-3">
            <button
              className={`p-2 rounded-full cursor-pointer ${
                task.recurringdone
                  ? "bg-gray-900 text-white hover:bg-black"
                  : "bg-gray-200 text-black hover:bg-gray-300"
              } ${animatingTaskId === task.$id ? "animate-spin" : ""}`}
              onClick={() => toggleRecurringDone(task.$id, task.recurringdone)}
              disabled={isAnimating}
              title={task.recurringdone ? "Mark Pending" : "Mark Complete"}
            >
              {task.recurringdone ? <X size={15} /> : <Check size={15} />}
            </button>
            
            <button
              className={`p-2 bg-gray-600 text-white rounded-full cursor-pointer hover:bg-gray-700 ${
                task.taskcompleted ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={task.taskcompleted ? undefined : () => handleEditTask(task)}
              disabled={task.taskcompleted}
              title="Edit"
            >
              <Edit size={15} />
            </button>

            <button
              className="p-2 bg-gray-800 text-white rounded-full cursor-pointer hover:bg-black"
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

  // Stats Component
  const StatsPanel = ({ weekly, monthly }) => {
    const weeklyTotal = weekly.length;
    const weeklyOpen = weekly.filter(task => !task.recurringdone).length;
    const weeklyClosed = weekly.filter(task => task.recurringdone).length;

    const monthlyTotal = monthly.length;
    const monthlyOpen = monthly.filter(task => !task.recurringdone).length;
    const monthlyClosed = monthly.filter(task => task.recurringdone).length;

    const panelBg = currentTheme.name === "dark" ? "bg-gray-900" : "bg-white";
    const textColor = currentTheme.name === "dark" ? "text-white" : "text-gray-800";
    const totalBg = currentTheme.name === "dark" ? "bg-gray-700" : "bg-gray-200";
    const dividerColor = currentTheme.name === "dark" ? "bg-gray-600" : "bg-gray-300";

    return (
      <div className={`${panelBg} border border-gray-700 rounded-lg shadow-xl`}>
        <div className="flex items-center justify-between py-3 px-6">
          {/* Weekly Stats - Left Side */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
              <span className="font-bold text-white">W</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`${totalBg} px-3 py-1 rounded-full`}>
                <span className={`font-bold text-lg ${textColor}`}>{weeklyTotal}</span>
                <span className={`text-sm ml-1 ${textColor}`}>Total</span>
              </div>
              <div className="bg-yellow-500 px-3 py-1 rounded-full text-black">
                <span className="font-bold text-lg">{weeklyOpen}</span>
                <span className="text-sm ml-1">Open</span>
              </div>
              <div className="bg-green-500 px-3 py-1 rounded-full text-black">
                <span className="font-bold text-lg">{weeklyClosed}</span>
                <span className="text-sm ml-1">Closed</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className={`h-8 w-px ${dividerColor}`}></div>

          {/* Monthly Stats - Right Side */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className={`${totalBg} px-3 py-1 rounded-full`}>
                <span className={`font-bold text-lg ${textColor}`}>{monthlyTotal}</span>
                <span className={`text-sm ml-1 ${textColor}`}>Total</span>
              </div>
              <div className="bg-yellow-500 px-3 py-1 rounded-full text-black">
                <span className="font-bold text-lg">{monthlyOpen}</span>
                <span className="text-sm ml-1">Open</span>
              </div>
              <div className="bg-green-500 px-3 py-1 rounded-full text-black">
                <span className="font-bold text-lg">{monthlyClosed}</span>
                <span className="text-sm ml-1">Closed</span>
              </div>
            </div>
            <div className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center">
              <span className="font-bold text-white">M</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Separate tasks by frequency
  const { weekly, monthly } = separateTasksByFrequency(sortedAndFilteredTasks);

  return (
    <div className="space-y-8">
      {/* Weekly Tasks Section - FIXED RESPONSIVE POSITIONING */}
      {weekly.length > 0 && (
        <div className={`fixed top-24 z-40 h-[44vh] overflow-hidden rounded-lg shadow-xl border border-gray-700   dark:bg-gray-900 transition-all duration-300 ease-in-out ${
          sidebarCollapsed 
            ? 'left-4 md:left-[100px] lg:left-[120px] right-4' 
            : 'left-4 md:left-[200px] lg:left-[240px] right-4'
        }`}>
          {/* Section Header at the very top */}
          <SectionHeader 
            frequency="weekly" 
            tasks={weekly}
            sectionTitle="Weekly Recurring Tasks"
          />
          
          {/* Table Header Below Section Header */}
          <table className={`w-full table-fixed ${currentTheme.name === "dark" ? "bg-gray-900" : "bg-white"}`}>
            <colgroup>
              <col className="w-14" />
              <col className="w-14" />
              <col className="w-[40%]" />
              <col className="w-8" />
              <col className="w-32" />
              <col className="w-20" />
              <col className="w-28" />
            </colgroup>
            <TableHeader title="Weekly Tasks" frequency="weekly" />
          </table>

          <div className="overflow-y-auto h-[calc(45vh-120px)]">
            <table className={`w-full table-fixed ${currentTheme.name === "dark" ? "bg-gray-900" : "bg-white"}`}>
              <colgroup>
                <col className="w-14" />
                <col className="w-14" />
                <col className="w-[40%]" />
                <col className="w-8" />
                <col className="w-32" />
                <col className="w-20" />
                <col className="w-28" />
              </colgroup>
              <tbody>
                {weekly.map((task, index) => renderTaskRow(task, index, "weekly"))}
              </tbody>
            </table>
          </div>
        </div>
      )}
 

      {/* Monthly Tasks Section - FIXED RESPONSIVE POSITIONING */}
      {monthly.length > 0 && (
        <div className={`fixed top-[calc(25px+45vh+4rem)] z-40 h-[35vh] overflow-hidden rounded-lg shadow-xl border border-gray-700   dark:bg-gray-900 transition-all duration-300 ease-in-out ${
          sidebarCollapsed 
            ? 'left-4 md:left-[100px] lg:left-[120px] right-4' 
            : 'left-4 md:left-[200px] lg:left-[240px] right-4'
        }`}>
          {/* Section Header at the very top */}
          <SectionHeader 
            frequency="monthly" 
            tasks={monthly}
            sectionTitle="Monthly Recurring Tasks"
          />
          
          {/* Table Header Below Section Header */}
          <table className={`w-full table-fixed ${currentTheme.name === "dark" ? "bg-gray-900" : "bg-white"}`}>
            <colgroup>
              <col className="w-14" />
              <col className="w-14" />
              <col className="w-[40%]" />
              <col className="w-8" />
              <col className="w-32" />
              <col className="w-20" />
              <col className="w-28" />
            </colgroup>
            <TableHeader title="Monthly Tasks" frequency="monthly" />
          </table>

          <div className="overflow-y-auto h-[calc(35vh-120px)]">
            <table className={`w-full table-fixed ${currentTheme.name === "dark" ? "bg-gray-900" : "bg-white"}`}>
              <colgroup>
                <col className="w-14" />
                <col className="w-14" />
                <col className="w-[40%]" />
                <col className="w-8" />
                <col className="w-32" />
                <col className="w-20" />
                <col className="w-28" />
              </colgroup>
              <tbody>
                {monthly.map((task, index) => renderTaskRow(task, index, "monthly"))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stats Panel - FIXED RESPONSIVE POSITIONING */}
      <div className={`fixed bottom-4 z-30 transition-all duration-300 ease-in-out ${
        sidebarCollapsed 
          ? 'left-4 md:left-[100px] lg:left-[120px] right-4' 
          : 'left-4 md:left-[200px] lg:left-[240px] right-4'
      }`}>
        <StatsPanel weekly={weekly} monthly={monthly} />
      </div>

      {/* No Tasks Message - Only show when both sections are empty */}
      {weekly.length === 0 && monthly.length === 0 && (
        <div className={`text-center py-20 ${currentTheme.text}`}>
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-2xl font-bold mb-2">No Recurring Tasks Found</h3>
          <p className="text-gray-500">Ask Raghav to get some tasks assigned to you</p>
        </div>
      )}

      {/* Edit Modal */}
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