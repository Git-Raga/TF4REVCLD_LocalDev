import React from 'react';
import { ArrowUp, X, Edit, Trash2, Check } from 'lucide-react';
import { differenceInDays } from 'date-fns';

// UI Components
import UrgencyBadge from './ui/UrgencyBadge';
import DueDateBadge from './ui/DueDateBadge';
import InitialsBadge from './ui/InitialsBadge';
import TaskAgeBadge from './ui/TaskAgeBadge';
import { Star, MessageSquareMore, MessageSquareOff } from 'lucide-react';

const TaskTable = ({
  currentTheme,
  sortedAndFilteredTasks,
  sortState,
  handleDueDateClick,
  setSortState,
  animatingTaskId,
  toggleTaskCompletion,
  openEditModal,
  openDeleteModal,
  openCommentsModal
}) => {
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

  return (
    <>
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
              <th className="p-3 text-center w-18">
                <span>Notes</span>
              </th>
               
              <th
                className="p-3 text-center w-20 whitespace-nowrap cursor-pointer hover:bg-opacity-80"
                onClick={handleDueDateClick}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>Due </span>
                   
                  {sortState === "asc" && <ArrowUp size={35} />}
                  {sortState === "desc" && (
                    <ArrowUp size={34} className="transform rotate-180" />
                  )}
                  {sortState !== "default" && (
                    <X
                      size={34}
                      className="ml-1 text-gray-400 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSortState("default");
                      }}
                    />
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
                  <span>Assigned to 🙋</span>
                </div>
              </th>
              <th className="p-3 text-center w-24 whitespace-nowrap">
                <span>Task Age🗓️</span>
              </th>
              <th className="p-3 text-right justify-left w-32 mr-15 whitespace-nowrap">
                <span>Actions ⚙️</span>
              </th>
            </tr>
          </thead>
        </table>
      </div>

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
            <col className="w-109" />
            <col className="w-15" />
            <col className="w-20" />
            <col className="w-20" />
            <col className="w-40" />
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
                      <UrgencyBadge
                        urgency={task.urgency}
                        dueDate={task.taskduedate}
                        isCompleted={task.taskcompleted}
                      />
                    </td>

                    {/* Task Details */}
                    <td className="p-3 pl-15 truncate">
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
                    <td className="p-3 text-center">
                      <div className="flex justify-center">
                        <DueDateBadge dueDate={task.taskduedate} />
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
                        <InitialsBadge initial={task.taskownerinitial} />
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
                        <TaskAgeBadge days={taskAge} currentTheme={currentTheme} />
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
    </>
  );
};

export default TaskTable;