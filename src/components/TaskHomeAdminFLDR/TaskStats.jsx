import React from 'react';
import { ListTodo, CheckCircle, LayoutList, Clock } from 'lucide-react';

const TaskStats = ({ currentTheme, taskStats }) => {
  return (
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
          Total : <strong>{taskStats.total}</strong>
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
          Completed : <strong>{taskStats.completed}</strong>
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
          Open : <strong>{taskStats.open}</strong>
        </span>
      </div>

      <div className="flex items-center space-x-2 text-sm">
        <Clock size={18} className="text-red-500" />
        <span className={`${currentTheme.text} font-bold`}>
          Overdue : <strong>{taskStats.overdue}</strong>
        </span>
      </div>
    </div>
  );
};

export default TaskStats;