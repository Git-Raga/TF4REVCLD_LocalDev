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
    let textColor = "text-white";  // Default text color
    let text = frequency || "Single";
    
    if (frequency === "daily") {
      bgColor = "bg-green-600";
      textColor = "text-white";
    } else if (frequency === "weekly") {
      bgColor = "bg-teal-400";
      textColor = "text-black";  // Custom text color for weekly
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

  // Get status badge
  const getStatusBadge = (status, isCompleted, recurringDone, frequency) => {
    let bgColor = "bg-red-500";
    let text = "Pending";
  
    if (recurringDone && frequency === "weekly") {
      bgColor = "bg-green-600";
      text = "Weekly Done";
    } else if (recurringDone && frequency === "monthly") {
      bgColor = "bg-green-600";
      text = "Monthly Done";
    } else if (isCompleted) {
      bgColor = "bg-green-600";
      text = "Completed";
    } else if (status === "Active") {
      bgColor = "bg-green-600";
      text = "Active";
    } else if (status === "Paused") {
      bgColor = "bg-yellow-600";
      text = "Paused";
    } else if (status === "Suspended") {
      bgColor = "bg-red-600";
      text = "Suspended";
    }
  
    return (
      <div
        className={`${bgColor} text-white px-3 py-1 rounded text-xs inline-block text-center w-20`}
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
        <colgroup>
            <col className="w-15" />
            <col className="w-15" />
            <col className="w-11" />
            <col className="w-50" />
            <col className="w-12" />
            <col className="w-32" />
            <col className="w-20" />
            <col className="w-32" />
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
          <colgroup>
            <col className="w-15" />
            <col className="w-15" />
            <col className="w-11" />
            <col className="w-50" />
            <col className="w-12" />
            <col className="w-32" />
            <col className="w-20" />
            <col className="w-32" />
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
                    )} ${animationClass} h-12`}
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
                        {task.recurringfreq === "weekly" && task.recurringday ? (
                          <div className="bg-black text-white px-3 py-1 rounded text-xs inline-block text-center w-20">
                            {task.recurringday.charAt(0).toUpperCase() + task.recurringday.slice(1)}
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
    {task.recurringfreq === "monthly" && task.recurringday ? (
      <div className="bg-red-500 text-xs text-white px-3 py-1 rounded text-sm inline-block text-center w-20">
        {getOrdinalSuffix(task.recurringday)}
      </div>
    ) : task.recurringfreq === "weekly" ? (
      <div className="w-20"></div>  /* Display blank for weekly tasks */
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
                        {getStatusBadge(task.status, task.taskcompleted, task.recurringdone, task.recurringfreq)}
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td className="p-2 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          className={`px-2 py-1 rounded text-xs cursor-pointer ${
                            task.recurringdone
                              ? "bg-red-500 hover:bg-red-600 text-white"
                              : "bg-green-500 hover:bg-green-600 text-white"
                          } opacity-100 mr-1`}
                          aria-label={
                            task.recurringdone
                              ? "Mark Pending"
                              : "Mark Complete"
                          }
                          onClick={() =>
                            toggleRecurringDone(
                              task.$id,
                              task.recurringdone
                            )
                          }
                          disabled={isAnimating}
                        >
                          {task.recurringdone ? "Mark Pending" : "Mark Complete"}
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
                          onClick={() => openDeleteModal(task)}
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
  );
};

export default RecurringTaskTable;