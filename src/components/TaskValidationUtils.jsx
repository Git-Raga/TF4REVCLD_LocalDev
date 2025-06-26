// TaskValidationUtils.js
// Utility functions for task validation - badges, styling, and sorting logic

import { format } from "date-fns";

// Custom sorting function for validation tasks
export const getSortedValidationTasks = (tasks, sortState) => {
  return [...tasks].sort((a, b) => {
    // Check if we're sorting by due date
    if (sortState === "asc" || sortState === "desc") {
      // Handle cases where one or both tasks don't have due dates
      if (!a.taskduedate && !b.taskduedate) {
        // If no due dates, sort by creation date (oldest first)
        return new Date(a.$createdAt) - new Date(b.$createdAt);
      }
      if (!a.taskduedate) return 1; // b comes first
      if (!b.taskduedate) return -1; // a comes first

      // Compare due dates (ascending or descending based on sortState)
      const dateComparison = new Date(a.taskduedate) - new Date(b.taskduedate);
      return sortState === "asc" ? dateComparison : -dateComparison;
    }

    // Default sorting logic (following SortingLogic.jsx prioritization)
    // Helper to determine if task is late
    const isTaskLate = (task) => {
      const dueDate = task.taskduedate ? new Date(task.taskduedate) : null;
      return (
        dueDate &&
        new Date() > dueDate &&
        dueDate.toDateString() !== new Date().toDateString()
      );
    };

    const aIsLate = isTaskLate(a);
    const bIsLate = isTaskLate(b);
    const aIsCritical = a.urgency === "Critical";
    const bIsCritical = b.urgency === "Critical";

    // 1. Critical and late (group them and display based on oldest Due date)
    if (aIsCritical && aIsLate && bIsCritical && bIsLate) {
      return new Date(a.taskduedate) - new Date(b.taskduedate);
    }
    if (aIsCritical && aIsLate) return -1;
    if (bIsCritical && bIsLate) return 1;

    // 2. Normal and Late (group them and display based on oldest Due date)
    if (aIsLate && bIsLate && !aIsCritical && !bIsCritical) {
      return new Date(a.taskduedate) - new Date(b.taskduedate);
    }
    if (aIsLate && !aIsCritical) return -1;
    if (bIsLate && !bIsCritical) return 1;

    // 3. Critical task with due dates (group them and display based on oldest Due date)
    if (aIsCritical && a.taskduedate && bIsCritical && b.taskduedate) {
      return new Date(a.taskduedate) - new Date(b.taskduedate);
    }
    if (aIsCritical && a.taskduedate) return -1;
    if (bIsCritical && b.taskduedate) return 1;

    // 4. Critical task without Due date (oldest first)
    if (aIsCritical && !a.taskduedate && bIsCritical && !b.taskduedate) {
      return new Date(a.$createdAt) - new Date(b.$createdAt);
    }
    if (aIsCritical && !a.taskduedate) return -1;
    if (bIsCritical && !b.taskduedate) return 1;

    // 5. Normal task with due dates (group them and display based on oldest Due date)
    if (!aIsCritical && a.taskduedate && !bIsCritical && b.taskduedate) {
      return new Date(a.taskduedate) - new Date(b.taskduedate);
    }
    if (!aIsCritical && a.taskduedate) return -1;
    if (!bIsCritical && b.taskduedate) return 1;

    // 6. Normal Tasks (without due dates) - oldest first
    if (!aIsCritical && !a.taskduedate && !bIsCritical && !b.taskduedate) {
      return new Date(a.$createdAt) - new Date(b.$createdAt);
    }

    // If we've made it here, sort by creation date (oldest first)
    return new Date(a.$createdAt) - new Date(b.$createdAt);
  });
};

// Get urgency badge
export const getUrgencyBadge = (task) => {
  const urgency = task.urgency;
  const dueDate = task.taskduedate ? new Date(task.taskduedate) : null;
  const today = new Date();
  const isLate = dueDate && today > dueDate && dueDate.toDateString() !== today.toDateString();
  
  if (urgency === 'Critical' && isLate) {
    return (
      <div className="bg-red-800 text-white px-2 py-1 rounded text-xs font-bold inline-block text-center w-24 animate-bounce">
        CRITICAL LATE
      </div>
    );
  } else if (urgency === 'Critical') {
    return (
      <div className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold inline-block text-center w-20">
        CRITICAL
      </div>
    );
  } else if (isLate) {
    return (
      <div className="bg-orange-600 text-white px-2 py-1 rounded text-xs font-bold inline-block text-center w-24 animate-bounce">
        NORMAL LATE
      </div>
    );
  } else {
    return (
      <div className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold inline-block text-center w-20">
        NORMAL
      </div>
    );
  }
};

// Get task type display (updated to show proper categories)
export const getTaskTypeDisplay = (task) => {
  if (task.recurringtask) {
    if (task.recurringfreq === 'weekly') {
      return (
        <div className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold inline-block text-center">
          🔁 Weekly
        </div>
      );
    } else if (task.recurringfreq === 'monthly') {
      return (
        <div className="bg-indigo-600 text-white px-2 py-1 rounded text-xs font-bold inline-block text-center">
          🔁 Monthly
        </div>
      );
    } else {
      return (
        <div className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold inline-block text-center">
          🔁 Recurring
        </div>
      );
    }
  } else {
    return (
      <div className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold inline-block text-center">
        ☝ One Time
      </div>
    );
  }
};

// Get status badge
export const getStatusBadge = (task) => {
  if (task.perfectstar) {
    return (
      <div className="bg-yellow-500 text-white px-3 py-1 rounded text-xs font-bold inline-block text-center">
        ⭐ WELL DONE
      </div>
    );
  } else if (task.taskcompleted) {
    return (
      <div className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold inline-block text-center">
        ✓ COMPLETED
      </div>
    );
  } else {
    return (
      <div className="bg-orange-600 text-white px-3 py-1 rounded text-xs font-bold inline-block text-center">
        ⏳ PENDING
      </div>
    );
  }
};

// Get initials badge
export const getInitialsBadge = (initial) => {
  if (!initial) return null;

  const colorMap = {
    VLM: "bg-pink-600",
    SR: "bg-amber-700", 
    RS: "bg-blue-500",
    PD: "bg-orange-600",
    PK: "bg-green-500",
    NS: "bg-teal-600",
    ES: "bg-yellow-600",
    AK: "bg-violet-600",
    RGV: "bg-blue-700",
    SS: "bg-indigo-600",
    WAS: "bg-emerald-600",
    SPK: "bg-cyan-600",
    PMR: "bg-rose-600",
    MMR: "bg-purple-600",
    HD: "bg-amber-500",
    GG: "bg-lime-600",
    FH: "bg-sky-600",
    MR: "bg-fuchsia-600",
    CR: "bg-orange-500",
    AC: "bg-violet-500"
  };

  const bgColor = colorMap[initial] || "bg-gray-500";
  const textSize = initial.length > 2 ? "text-xs" : "text-sm";

  return (
    <div className={`${bgColor} text-white rounded-sm w-9 h-9 flex items-center justify-center font-semibold ${textSize}`}>
      {initial}
    </div>
  );
};

// Get row class for styling
export const getRowClass = (index, task, currentTheme) => {
  const evenRow = currentTheme.name === "dark" ? "bg-gray-800" : "bg-gray-200";
  const oddRow = currentTheme.name === "dark" ? "bg-gray-700" : "bg-gray-100";
  const baseClass = index % 2 === 0 ? evenRow : oddRow;
  
  let statusClass = "";
  if (task.perfectstar) {
    statusClass = "border-l-4 border-yellow-500";
  } else if (task.taskcompleted) {
    statusClass = "border-l-4 border-blue-500";
  } else {
    statusClass = "border-gray-500 ";
  }

  return `${baseClass} ${statusClass} hover:bg-opacity-90 transition duration-150 ease-in-out`;
};

// Calculate task age in days
export const calculateTaskAge = (createdAt) => {
  return Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24));
};

// Calculate task statistics
export const calculateTaskStats = (tasks) => {
  return {
    total: tasks.length,
    pending: tasks.filter(task => !task.taskcompleted).length,
    completed: tasks.filter(task => task.taskcompleted && !task.perfectstar).length,
    wellDone: tasks.filter(task => task.perfectstar).length
  };
};