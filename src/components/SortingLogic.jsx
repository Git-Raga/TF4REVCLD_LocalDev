// SortingLogic.jsx
import { differenceInDays } from "date-fns";

/**
 * Sort and filter tasks based on various criteria
 * @param {Array} tasks - Array of task objects
 * @param {boolean} showActiveOnly - Whether to only show active (non-completed) tasks
 * @param {string} sortState - Sort state ('default', 'asc', or 'desc')
 * @returns {Array|Object} - Sorted and filtered tasks array, or sectioned object when showing all tasks
 */
export const getSortedAndFilteredTasks = (tasks, showActiveOnly, sortState) => {
  if (showActiveOnly) {
    // When showing active only, return flat array with just active tasks
    return [...tasks]
      .filter((task) => !task.userdone && !task.taskcompleted)
      .sort((a, b) => sortTasksWithinSection(a, b, sortState));
  }

  // When showing all tasks, return sectioned object
  const activeTasks = tasks.filter((task) => !task.userdone && !task.taskcompleted);
  const userDoneTasks = tasks.filter((task) => task.userdone && !task.taskcompleted);
  const completedTasks = tasks.filter((task) => task.taskcompleted);

  return {
    sections: [
      {
        title: "Active Tasks",
        tasks: activeTasks.sort((a, b) => sortTasksWithinSection(a, b, sortState)),
        count: activeTasks.length
      },
      {
        title: "Tasks Awaiting Review",
        tasks: userDoneTasks.sort((a, b) => sortTasksWithinSection(a, b, sortState)),
        count: userDoneTasks.length
      },
      {
        title: "Tasks Completed",
        tasks: completedTasks.sort((a, b) => sortTasksWithinSection(a, b, sortState)),
        count: completedTasks.length
      }
    ]
  };
};

/**
 * Sort tasks within a section based on the sort state
 * @param {Object} a - First task object
 * @param {Object} b - Second task object
 * @param {string} sortState - Sort state ('default', 'asc', or 'desc')
 * @returns {number} - Sort comparison result
 */
const sortTasksWithinSection = (a, b, sortState) => {
  // Check if we're sorting by due date (when user clicks on Due Date header)
  if (sortState === "asc" || sortState === "desc") {
    // Handle cases where one or both tasks don't have due dates
    if (!a.taskduedate && !b.taskduedate) {
      // If no due dates, sort by creation date (newest first)
      return new Date(b.$createdAt) - new Date(a.$createdAt);
    }
    if (!a.taskduedate) return 1; // b comes first
    if (!b.taskduedate) return -1; // a comes first

    // Compare due dates (ascending or descending based on sortState)
    const dateComparison = new Date(a.taskduedate) - new Date(b.taskduedate);
    return sortState === "asc" ? dateComparison : -dateComparison;
  }

  // Default sorting logic within sections
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

  // 4. Critical task without Due date
  if (aIsCritical && !a.taskduedate && bIsCritical && !b.taskduedate) {
    return new Date(b.$createdAt) - new Date(a.$createdAt);
  }
  if (aIsCritical && !a.taskduedate) return -1;
  if (bIsCritical && !b.taskduedate) return 1;

  // 5. Normal task with due dates (group them and display based on oldest Due date)
  if (!aIsCritical && a.taskduedate && !bIsCritical && b.taskduedate) {
    return new Date(a.taskduedate) - new Date(b.taskduedate);
  }
  if (!aIsCritical && a.taskduedate) return -1;
  if (!bIsCritical && b.taskduedate) return 1;

  // 6. Normal Tasks (without due dates)
  if (!aIsCritical && !a.taskduedate && !bIsCritical && !b.taskduedate) {
    return new Date(b.$createdAt) - new Date(a.$createdAt);
  }

  // If we've made it here, sort by creation date (newest first)
  return new Date(b.$createdAt) - new Date(a.$createdAt);
};

// Helper function to calculate task statistics
export const calculateTaskStats = (tasks) => {
  return {
    total: tasks.length,
    completed: tasks.filter((task) => task.taskcompleted).length,
    userdone: tasks.filter((task) => task.userdone && !task.taskcompleted).length,
    active: tasks.filter((task) => !task.userdone && !task.taskcompleted).length,
    open: tasks.filter((task) => !task.taskcompleted).length, // Keep for backward compatibility
    overdue: tasks.filter((task) => {
      const dueDate = task.taskduedate ? new Date(task.taskduedate) : null;
      return (
        !task.taskcompleted &&
        dueDate &&
        new Date() > dueDate &&
        dueDate.toDateString() !== new Date().toDateString()
      );
    }).length,
  };
};