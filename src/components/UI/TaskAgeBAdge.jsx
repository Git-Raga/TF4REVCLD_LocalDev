import React from 'react';

const TaskAgeBadge = ({ days, currentTheme }) => {
  return (
    <div
      className={`${
        currentTheme.name === "dark" ? "bg-gray-950" : "bg-gray-800"
      } text-white px-3 py-1 rounded inline-block text-center w-24`}
    >
      {days} Days
    </div>
  );
};

export default TaskAgeBadge;