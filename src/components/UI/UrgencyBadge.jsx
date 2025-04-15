import React from 'react';

const UrgencyBadge = ({ urgency, dueDate, isCompleted }) => {
  let bgColor, text, flashingClass = "";

  // If task is completed, don't show flashing and use muted colors
  if (isCompleted) {
    bgColor = "bg-gray-500";
    text = urgency === "Critical" ? "CRITICAL" : "NORMAL";
    return (
      <div
        className={`${bgColor} text-white px-3 py-1 rounded text-xs font-bold inline-block text-center w-25 opacity-70`}
      >
        {text}
      </div>
    );
  }

  // Check if task is late
  const isLate =
    dueDate &&
    new Date() > new Date(dueDate) &&
    new Date(dueDate).toDateString() !== new Date().toDateString();

  if (urgency === "Critical" && isLate) {
    bgColor = "bg-red-700"; // Darker, more intense red
    text = "CRITICAL-LATE";
    flashingClass = "animate-pulse"; // Add flashing effect
  } else if (urgency === "Critical") {
    bgColor = "bg-red-600"; // Medium red
    text = "CRITICAL";
  } else if (isLate) {
    bgColor = "bg-red-500"; // Lighter red
    text = "NORMAL-LATE";
  } else {
    bgColor = "bg-green-600";
    text = "NORMAL";
  }

  return (
    <div
      className={`${bgColor} ${flashingClass} text-white px-3 py-1 rounded text-xs inline-block text-center w-25`}
    >
      {text}
    </div>
  );
};

export default UrgencyBadge;