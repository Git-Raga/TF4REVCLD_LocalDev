// TaskFilters.jsx
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
            <span className={`${currentTheme.text} font-bold`}>
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
            <span className={`${currentTheme.text} font-bold`}>
              Open: <strong>{taskStats.open}</strong>
            </span>
          </div>

          <div className="flex items-center space-x-2 text-sm">
            <Clock size={18} className="text-red-500" />
            <span className={`${currentTheme.text} font-bold`}>
              Overdue: <strong>{taskStats.overdue}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskFiltersnStats;