// TableDisplay.jsx
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

const TableDisplay = ({
  currentTheme,
  sortedAndFilteredTasks,
  sortState,
  handleDueDateClick,
  setSortState,
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
}) => {
  // Theme-dependent styles
  const headerClass =
    currentTheme.name === "dark"
      ? "bg-zinc-900 text-white border-b border-gray-700"
      : "bg-gray-300 text-gray-800 border-b border-gray-400";

  return (
    <div className="overflow-hidden rounded-lg shadow-xl border border-gray-700">
      {/* Header */}
      <table
        className={`w-full table-fixed ${
          currentTheme.name === "dark" ? "bg-gray-900" : "bg-white"
        }`}
      >
        <colgroup>
          <col className="w-20" />
          <col className="w-1/3" />
          <col className="w-12" />
          <col className="w-20" />
          <col className="w-20" />
          <col className="w-40" />
          <col className="w-24" />
          <col className="w-32" />
        </colgroup>
        <thead>
          <tr className={headerClass}>
            <th className="p-3 text-right w-20 whitespace-nowrap">
              <div className="flex items-center ml-3 space-x-2">
                <span>Urgency 🔥</span>
              </div>
            </th>
            <th className="p-3 pl-10 text-left">
              <span>Task Details 📃</span>
            </th>
            <th className="p-2 text-center">
              <span>Notes</span>
            </th>
            <th
              className="p-3 text-center whitespace-nowrap cursor-pointer hover:bg-opacity-80"
              onClick={handleDueDateClick}
            >
              <div className="flex items-center justify-center space-x-1">
                <span>Due</span>
                <Calendar size={14} />
                {sortState === "asc" && <ArrowUp size={14} />}
                {sortState === "desc" && (
                  <ArrowUp size={14} className="transform rotate-180" />
                )}
                {sortState !== "default" && (
                  <X
                    size={14}
                    className="ml-1 text-gray-400 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSortState("default");
                    }}
                  />
                )}
              </div>
            </th>
            <th className="p-3 text-center whitespace-nowrap">
              <div className="flex items-center justify-center space-x-2">
                <span>Perfect ⭐</span>
              </div>
            </th>
            <th className="p-3 whitespace-nowrap">
              <div className="flex items-center pl-5 justify-start space-x-3">
                <span>Assigned to 🙋</span>
              </div>
            </th>
            <th className="p-3 text-center whitespace-nowrap">
              <span>Task Age🗓️</span>
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
            <col className="w-20" />
            <col className="w-1/3" />
            <col className="w-12" />
            <col className="w-20" />
            <col className="w-20" />
            <col className="w-40" />
            <col className="w-24" />
            <col className="w-32" />
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
                    )} ${animationClass} `}
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

                    {/* Due Date */}
                    <td className="p-2 text-center">
                      <div className="flex justify-center">
                        {task.taskduedate ? (
                          getDueDateBadge(task.taskduedate)
                        ) : (
                          <div className="w-20"></div>
                        )}
                      </div>
                    </td>

                    {/* Perfect Star */}
                    <td className="p-2 text-center">
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
                    <td className="p-2">
                      <div className="flex items-center ml-5">
                        {getInitialsBadge(task.taskownerinitial)}
                        <span
                          className={`${currentTheme.text} ml-1 text-sm truncate`}
                        >
                          {task.taskownername}
                        </span>
                      </div>
                    </td>

                    {/* Task Age */}
                    <td className="p-2 text-center">
                      <div className="flex justify-center">
                        {getTaskAgeBadge(taskAge)}
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td className="p-2 text-right">
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

export default TableDisplay;