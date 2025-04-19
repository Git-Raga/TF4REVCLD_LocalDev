// SortingLogic.jsx
import { differenceInDays } from "date-fns";

/**
 * Sort and filter tasks based on various criteria
 * @param {Array} tasks - Array of task objects
 * @param {boolean} showActiveOnly - Whether to only show active (non-completed) tasks
 * @param {string} sortState - Sort state ('default', 'asc', or 'desc')
 * @returns {Array} - Sorted and filtered tasks array
 */
export const getSortedAndFilteredTasks = (tasks, showActiveOnly, sortState) => {
  return [...tasks]
    // Apply active/all filter
    .filter((task) => !showActiveOnly || !task.taskcompleted)
    // Sort tasks
    .sort((a, b) => {
      // Check if we're sorting by due date (when user clicks on Due Date header)
      if (sortState === "asc" || sortState === "desc") {
        // First, separate completed tasks (always push them to the bottom)
        if (a.taskcompleted && !b.taskcompleted) return 1; // a goes after b
        if (!a.taskcompleted && b.taskcompleted) return -1; // a goes before b

        // If both are completed, sort by creation date (newest first)
        if (a.taskcompleted && b.taskcompleted) {
          return new Date(b.$createdAt) - new Date(a.$createdAt);
        }

        // Handle cases where one or both tasks don't have due dates
        if (!a.taskduedate && !b.taskduedate) return 0;
        if (!a.taskduedate) return 1; // b comes first
        if (!b.taskduedate) return -1; // a comes first

        // Compare due dates (ascending or descending based on sortState)
        const dateComparison =
          new Date(a.taskduedate) - new Date(b.taskduedate);
        return sortState === "asc" ? dateComparison : -dateComparison;
      }

      // Default sorting logic
      // First, separate completed tasks (always push them to the bottom)
      if (a.taskcompleted && !b.taskcompleted) return 1; // a goes after b
      if (!a.taskcompleted && b.taskcompleted) return -1; // a goes before b

      // If both are completed, sort by creation date (newest first)
      if (a.taskcompleted && b.taskcompleted) {
        return new Date(b.$createdAt) - new Date(a.$createdAt);
      }

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
        // If both are critical and late, sort by due date (oldest first)
        return new Date(a.taskduedate) - new Date(b.taskduedate);
      }
      if (aIsCritical && aIsLate) return -1; // a goes before b
      if (bIsCritical && bIsLate) return 1; // b goes before a

      // 2. Normal and Late (group them and display based on oldest Due date)
      if (aIsLate && bIsLate && !aIsCritical && !bIsCritical) {
        // If both are normal and late, sort by due date (oldest first)
        return new Date(a.taskduedate) - new Date(b.taskduedate);
      }
      if (aIsLate && !aIsCritical) return -1; // a goes before b
      if (bIsLate && !bIsCritical) return 1; // b goes before a

      // 3. Critical task with due dates (group them and display based on oldest Due date)
      if (aIsCritical && a.taskduedate && bIsCritical && b.taskduedate) {
        // If both are critical with due dates, sort by due date (oldest first)
        return new Date(a.taskduedate) - new Date(b.taskduedate);
      }
      if (aIsCritical && a.taskduedate) return -1; // a goes before b
      if (bIsCritical && b.taskduedate) return 1; // b goes before a

      // 4. Critical task without Due date
      if (aIsCritical && !a.taskduedate && bIsCritical && !b.taskduedate) {
        // If both are critical without due dates, sort by creation date (newest first)
        return new Date(b.$createdAt) - new Date(a.$createdAt);
      }
      if (aIsCritical && !a.taskduedate) return -1; // a goes before b
      if (bIsCritical && !b.taskduedate) return 1; // b goes before a

      // 5. Normal task with due dates (group them and display based on oldest Due date)
      if (!aIsCritical && a.taskduedate && !bIsCritical && b.taskduedate) {
        // If both are normal with due dates, sort by due date (oldest first)
        return new Date(a.taskduedate) - new Date(b.taskduedate);
      }
      if (!aIsCritical && a.taskduedate) return -1; // a goes before b
      if (!bIsCritical && b.taskduedate) return 1; // b goes before a

      // 6. Normal Tasks (without due dates)
      if (!aIsCritical && !a.taskduedate && !bIsCritical && !b.taskduedate) {
        // If both are normal without due dates, sort by creation date (newest first)
        return new Date(b.$createdAt) - new Date(a.$createdAt);
      }

      // If we've made it here, sort by creation date (newest first)
      return new Date(b.$createdAt) - new Date(a.$createdAt);
    });
};

// Helper function to calculate task statistics
export const calculateTaskStats = (tasks) => {
  return {
    total: tasks.length,
    completed: tasks.filter((task) => task.taskcompleted).length,
    open: tasks.filter((task) => !task.taskcompleted).length,
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