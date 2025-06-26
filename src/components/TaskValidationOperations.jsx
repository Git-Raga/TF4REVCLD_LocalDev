// TaskValidationOperations.js
// Database operations and business logic for task validation

import { databases, DATABASE_ID, COLLECTIONS } from "../appwrite/config";
import { Query } from "appwrite";
import { calculateTaskStats } from "./TaskValidationUtils.jsx";

// Fetch all tasks with userdone = true
export const fetchValidationTasks = async () => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID, 
      COLLECTIONS.TASK_DETAILS, 
      [
        Query.equal("userdone", true),
        Query.orderDesc("$updatedAt"),
        Query.limit(100) // Limit to prevent too many results
      ]
    );

    const tasks = response.documents;
    const stats = calculateTaskStats(tasks);
    
    return { tasks, stats, error: null };
  } catch (err) {
    console.error("Error fetching validation tasks:", err);
    return { 
      tasks: [], 
      stats: { total: 0, pending: 0, completed: 0, wellDone: 0 }, 
      error: "Failed to load validation tasks. Please try again." 
    };
  }
};

// Handle Mark Not Done
export const markTaskAsNotDone = async (taskId) => {
  try {
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.TASK_DETAILS,
      taskId,
      { 
        userdone: false,
        taskcompleted: false,
        perfectstar: false
      }
    );
    return { success: true, error: null };
  } catch (err) {
    console.error("Error marking task as not done:", err);
    return { success: false, error: "Failed to mark task as not done" };
  }
};

// Handle Mark Completed
export const markTaskAsCompleted = async (taskId) => {
  try {
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.TASK_DETAILS,
      taskId,
      { 
        taskcompleted: true,
        perfectstar: false
      }
    );
    return { success: true, error: null };
  } catch (err) {
    console.error("Error marking task as completed:", err);
    return { success: false, error: "Failed to mark task as completed" };
  }
};

// Handle Mark Well Done (5 Star)
export const markTaskAsWellDone = async (taskId) => {
  try {
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.TASK_DETAILS,
      taskId,
      { 
        taskcompleted: true,
        perfectstar: true
      }
    );
    return { success: true, error: null };
  } catch (err) {
    console.error("Error marking task as well done:", err);
    return { success: false, error: "Failed to mark task as well done" };
  }
};

// Update local state after marking task as not done
export const updateTasksAfterNotDone = (tasks, taskId) => {
  return tasks.filter(task => task.$id !== taskId);
};

// Update local state after marking task as completed
export const updateTasksAfterCompleted = (tasks, taskId) => {
  return tasks.map(task => 
    task.$id === taskId 
      ? { ...task, taskcompleted: true, perfectstar: false }
      : task
  );
};

// Update local state after marking task as well done
export const updateTasksAfterWellDone = (tasks, taskId) => {
  return tasks.map(task => 
    task.$id === taskId 
      ? { ...task, taskcompleted: true, perfectstar: true }
      : task
  );
};