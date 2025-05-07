// RecurringTaskTable.jsx
import React from "react";
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

const RecurringTaskTable = ({
  currentTheme,
  sortedAndFilteredTasks,
  toggleRecurringDone,

  animatingTaskId,
  toggleTaskCompletion,
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


return (
    <div className="overflow-hidden rounded-lg shadow-xl border border-gray-700">
      {/* Header */}
      <table
        className={`w-full table-fixed ${
          currentTheme.name === "dark" ? "bg-gray-900" : "bg-white"
        }`}
      >
        {/* Update the colgroup to allocate more width to task details */}
        <colgroup>
          <col className="w-12" /> {/* Frequency - slightly smaller */}
          <col className="w-14" /> {/* Due-Day */}
          <col className="w-14" /> {/* Due-Date */}
          <col className="w-[40%]" />{" "}
          {/* Recurring Tasks Details - increased width */}
          <col className="w-8" /> {/* Notes - smaller */}
          <col className="w-32" /> {/* Assigned to */}
          <col className="w-20" /> {/* Status */}
          <col className="w-28" /> {/* Actions */}
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
          {/* Update the colgroup to allocate more width to task details */}
          <colgroup>
            <col className="w-12" /> {/* Frequency - slightly smaller */}
            <col className="w-14" /> {/* Due-Day */}
            <col className="w-14" /> {/* Due-Date */}
            <col className="w-[40%]" />{" "}
            {/* Recurring Tasks Details - increased width */}
            <col className="w-8" /> {/* Notes - smaller */}
            <col className="w-32" /> {/* Assigned to */}
            <col className="w-20" /> {/* Status */}
            <col className="w-28" /> {/* Actions */}
          </colgroup>
          <tbody>
            {sortedAndFilteredTasks.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className={`text-center py-10 ${currentTheme.text}`}
                >
                  No recurring tasks found.
                </td>
              </tr>
            ) : (
              sortedAndFilteredTasks.map((task, index) => {
                const dueDate = task.taskduedate
                  ? new Date(task.taskduedate)
                  : null;

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
                    )}`}
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
                          <div className="w-20"></div> /* Display blank for weekly tasks */
                        ) : task.taskduedate ? (
                          getDueDateBadge(task.taskduedate)
                        ) : (
                          <div className="w-20"></div>
                        )}
                      </div>
                    </td>
                    {/* Recurring task details */}
                    <td className="p-2 pl-10 truncate">
                      <p
                        className={`${currentTheme.text} font-bold ${
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
      animatingTaskId === task.$id // Pass animation state
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
    <X size={15} /> // X icon for Mark Pending
  ) : (
    <Check size={15} /> // Check icon for Mark Complete
  )}

    </button>
    
    {/* Edit Button */}
    <button
      className={`p-2 bg-gray-600 text-white rounded-full cursor-pointer hover:bg-gray-700 ${
        task.taskcompleted ? "opacity-50 cursor-not-allowed" : ""
      }`}
      aria-label="Edit task"
      onClick={task.taskcompleted ? undefined : () => openEditModal(task)}
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
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecurringTaskTable;
