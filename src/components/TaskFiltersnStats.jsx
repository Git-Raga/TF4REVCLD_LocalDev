// TaskFiltersnStats.jsx
import React from "react";
import {
  CheckCircle,
  LayoutList,
  Clock,
  ListTodo,
} from "lucide-react";

const TaskFiltersnStats = ({ 
  currentTheme, 
  showActiveOnly, 
  setShowActiveOnly, 
  taskStats 
}) => {
  return (
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

        {/* Task Statistics - Conditional based on view */}
        <div className="flex flex-wrap items-center gap-4">
          {showActiveOnly ? (
            // Active Tasks View - Only show Active Total and Overdue (from active tasks only)
            <>
              <div className="flex items-center space-x-2 text-sm">
                <LayoutList
                  size={18}
                  className={
                    currentTheme.name === "dark"
                      ? "text-green-400"
                      : "text-green-600"
                  }
                />
                <span className={`${currentTheme.name === "dark" ? "text-white" : "text-gray-900"}`}>
                  Active: <strong>{taskStats.active}</strong>
                </span>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <Clock size={18} className="text-red-500" />
                <span className={`${currentTheme.name === "dark" ? "text-white" : "text-gray-900"}`}>
                  Overdue: <strong>{taskStats.activeOverdue}</strong>
                </span>
              </div>
            </>
          ) : (
            // All Tasks View - Show all statistics
            <>
              <div className="flex items-center space-x-2 text-sm">
                <ListTodo
                  size={18}
                  className={
                    currentTheme.name === "dark"
                      ? "text-blue-400"
                      : "text-blue-600"
                  }
                />
                <span className={`${currentTheme.name === "dark" ? "text-white" : "text-gray-900"}`}>
                  Total: <strong>{taskStats.total}</strong>
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
                <span className={`${currentTheme.name === "dark" ? "text-white" : "text-gray-900"}`}>
                  Completed: <strong>{taskStats.completed}</strong>
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
                <span className={`${currentTheme.name === "dark" ? "text-white" : "text-gray-900"}`}>
                  Pending for Review: <strong>{taskStats.userdone}</strong>
                </span>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <Clock size={18} className="text-red-500" />
                <span className={`${currentTheme.name === "dark" ? "text-white" : "text-gray-900"}`}>
                  Overdue: <strong>{taskStats.overdue}</strong>
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskFiltersnStats;