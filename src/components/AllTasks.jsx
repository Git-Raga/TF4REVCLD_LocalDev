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
import { differenceInDays } from "date-fns";
import TaskFiltersnStats from "./TaskFiltersnStats";

const AllTasks = ({
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
  showActiveOnly,
  setShowActiveOnly,
  taskStats
}) => {
  // Theme-dependent styles
  const headerClass =
    currentTheme.name === "dark"
      ? "bg-zinc-900 text-white border-b border-gray-700"
      : "bg-gray-300 text-gray-800 border-b border-gray-400";

  return (
    <div className="space-y-4">
      {/* Main Table Container */}
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
                <span>One Time ☝ Task Details 📃</span>
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
              {sortedAndFilteredTasks.sections && sortedAndFilteredTasks.sections.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className={`text-center py-10 ${currentTheme.text}`}
                  >
                    No tasks found.
                  </td>
                </tr>
              ) : (
                sortedAndFilteredTasks.sections?.map((section, sectionIndex) => (
                  <React.Fragment key={section.title}>
                    {/* Section Subheader Row */}
                    {section.tasks.length > 0 && (
                      <tr className={`${currentTheme.name === "dark" ? "bg-gray-500" : "bg-gray-400"} border-t-2 ${currentTheme.borderColor}`}>
                        <td colSpan="8" className="py-1 px-4">
                          <div className="flex items-center justify-center">
                            <h3 className={`text-md font-semibold ${currentTheme.textColor} flex items-center`}>
                              <span className={`mr-3 w-3 h-2 rounded-full ${
                                section.title === "Active Tasks" ? "bg-green-500" :
                                section.title === "Tasks Awaiting Review" ? "bg-blue-500" :
                                "bg-gray-500"
                              }`}></span>
                              {section.title}
                            </h3>
                            <span className={`text-sm ml-3 px-3 py-1 rounded-full ${
                              section.title === "Active Tasks" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                              section.title === "Tasks Awaiting Review" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
                              "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                            }`}>
                              {section.count} {section.count === 1 ? 'task' : ""}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Section Tasks */}
                    {section.tasks.map((task, taskIndex) => {
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
                            taskIndex,
                            task
                          )} ${animationClass} h-12`}
                        >
                          {/* Urgency */}
                          <td className="p-2 whitespace-nowrap w-20">
                            {getUrgencyBadge(
                              task.urgency,
                              task.taskduedate,
                              task
                            )}
                          </td>

                          {/* Task Details */}
                          <td className="p-2 pl-10 truncate">
                            <p
                              className={`${currentTheme.text} ${
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
                            <div className="flex items-center ml-8">
                              {getInitialsBadge(task.taskownerinitial)}
                              <span
                                className={`${currentTheme.text} ml-1 text-sm truncate`}
                              >
                                {task.taskownername}
                              </span>
                            </div>
                          </td>

                          {/* Task Age */}
                          <td className="p-2 text-center ml-10">
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
                                    task
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
                    })}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Stats Panel for All Tasks view */}
      <div className={`${currentTheme.name === "dark" ? "bg-gray-800 border-gray-600" : "bg-white border-gray-300"} border rounded-lg p-4 mt-4`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Toggle Buttons - Radio Style */}
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="taskView"
                checked={showActiveOnly}
                onChange={() => setShowActiveOnly(true)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className={`text-sm font-medium ${currentTheme.name === "dark" ? "text-white" : "text-gray-900"}`}>
                Active Tasks
              </span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="taskView"
                checked={!showActiveOnly}
                onChange={() => setShowActiveOnly(false)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className={`text-sm font-medium ${currentTheme.name === "dark" ? "text-white" : "text-gray-900"}`}>
                All Tasks
              </span>
            </label>
          </div>

          {/* Stats Display */}
          <div className="flex flex-wrap items-center gap-6">
            {/* Active Tasks */}
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className={`text-sm font-medium ${currentTheme.name === "dark" ? "text-white" : "text-gray-900"}`}>
                Active Tasks: {sortedAndFilteredTasks.sections?.find(s => s.title === "Active Tasks")?.count || 0}
              </span>
            </div>

            {/* Pending for Review */}
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className={`text-sm font-medium ${currentTheme.name === "dark" ? "text-white" : "text-gray-900"}`}>
                Pending for Review: {sortedAndFilteredTasks.sections?.find(s => s.title === "Tasks Awaiting Review")?.count || 0}
              </span>
            </div>

            {/* Completed */}
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span className={`text-sm font-medium ${currentTheme.name === "dark" ? "text-white" : "text-gray-900"}`}>
                Completed: {sortedAndFilteredTasks.sections?.find(s => s.title === "Tasks Completed")?.count || 0}
              </span>
            </div>

            {/* Total */}
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-bold ${currentTheme.name === "dark" ? "text-white" : "text-gray-900"}`}>
                Total: {taskStats.total}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllTasks;