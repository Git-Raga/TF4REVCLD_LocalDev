import React from 'react';

const TaskFilters = ({ currentTheme, showActiveOnly, setShowActiveOnly }) => {
  return (
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
  );
};

export default TaskFilters;