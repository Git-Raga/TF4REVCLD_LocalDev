// TaskCacheService.js - Local Storage Caching System for Tasks
import { databases, DATABASE_ID, COLLECTIONS } from "../appwrite/config";
import { Query } from "appwrite";

class TaskCacheService {
  constructor() {
    this.CACHE_KEYS = {
      ONE_TIME_TASKS: 'taskforce_onetime_tasks',
      RECURRING_TASKS: 'taskforce_recurring_tasks',
      ONE_TIME_LAST_FETCH: 'taskforce_onetime_last_fetch',
      RECURRING_LAST_FETCH: 'taskforce_recurring_last_fetch',
      CACHE_DIRTY_FLAG: 'taskforce_cache_dirty'
  };
    
    // Cache expiry time (optional - 24 hours)
    this.CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  }

  // Check if cache is dirty (needs refresh due to recent DB operations)
  isCacheDirty(taskType) {
    const dirtyFlag = localStorage.getItem(this.CACHE_KEYS.CACHE_DIRTY_FLAG);
    if (!dirtyFlag) return false;
    
    const dirtyData = JSON.parse(dirtyFlag);
    return dirtyData[taskType] === true;
  }

  // Mark cache as dirty for a specific task type
  markCacheDirty(taskType) {
    const existingDirtyFlag = localStorage.getItem(this.CACHE_KEYS.CACHE_DIRTY_FLAG);
    const dirtyData = existingDirtyFlag ? JSON.parse(existingDirtyFlag) : {};
    
    dirtyData[taskType] = true;
    localStorage.setItem(this.CACHE_KEYS.CACHE_DIRTY_FLAG, JSON.stringify(dirtyData));
  }

  // Clear dirty flag for a specific task type
  clearDirtyFlag(taskType) {
    const existingDirtyFlag = localStorage.getItem(this.CACHE_KEYS.CACHE_DIRTY_FLAG);
    if (!existingDirtyFlag) return;
    
    const dirtyData = JSON.parse(existingDirtyFlag);
    delete dirtyData[taskType];
    localStorage.setItem(this.CACHE_KEYS.CACHE_DIRTY_FLAG, JSON.stringify(dirtyData));
  }

  // Check if cache is expired (optional feature)
  isCacheExpired(lastFetchKey) {
    const lastFetch = localStorage.getItem(lastFetchKey);
    if (!lastFetch) return true;
    
    const lastFetchTime = parseInt(lastFetch);
    const now = Date.now();
    return (now - lastFetchTime) > this.CACHE_EXPIRY;
  }

  // Save tasks to local storage
  saveTasks(taskType, tasks) {
    const cacheKey = taskType === 'onetime' ? this.CACHE_KEYS.ONE_TIME_TASKS : this.CACHE_KEYS.RECURRING_TASKS;
    const lastFetchKey = taskType === 'onetime' ? this.CACHE_KEYS.ONE_TIME_LAST_FETCH : this.CACHE_KEYS.RECURRING_LAST_FETCH;
    
    try {
      localStorage.setItem(cacheKey, JSON.stringify(tasks));
      localStorage.setItem(lastFetchKey, Date.now().toString());
      this.clearDirtyFlag(taskType);
      console.log(`✅ ${taskType} tasks cached successfully (${tasks.length} tasks)`);
    } catch (error) {
      console.error(`❌ Error caching ${taskType} tasks:`, error);
    }
  }

  // Get tasks from local storage
  getCachedTasks(taskType) {
    const cacheKey = taskType === 'onetime' ? this.CACHE_KEYS.ONE_TIME_TASKS : this.CACHE_KEYS.RECURRING_TASKS;
    
    try {
      const cachedData = localStorage.getItem(cacheKey);
      if (!cachedData) return null;
      
      const tasks = JSON.parse(cachedData);
      console.log(`📦 Retrieved ${taskType} tasks from cache (${tasks.length} tasks)`);
      return tasks;
    } catch (error) {
      console.error(`❌ Error retrieving cached ${taskType} tasks:`, error);
      return null;
    }
  }

  // Fetch one-time tasks from database
  async fetchOneTimeTasks() {
    try {
      console.log('🔄 Fetching one-time tasks from database...');
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TASK_DETAILS,
        [
          Query.equal("recurringtask", false),
          Query.limit(100)
        ]
      );
      
      console.log(`✅ Fetched ${response.documents.length} one-time tasks from database`);
      return response.documents;
    } catch (error) {
      console.error('❌ Error fetching one-time tasks from database:', error);
      throw error;
    }
  }

  // Fetch recurring tasks from database
  async fetchRecurringTasks() {
    try {
      console.log('🔄 Fetching recurring tasks from database...');
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TASK_DETAILS,
        [
          Query.equal("recurringtask", true),
          Query.limit(100)
        ]
      );
      
      console.log(`✅ Fetched ${response.documents.length} recurring tasks from database`);
      return response.documents;
    } catch (error) {
      console.error('❌ Error fetching recurring tasks from database:', error);
      throw error;
    }
  }

  // Main method to get tasks (checks cache first, then database if needed)
  async getTasks(taskType, forceRefresh = false) {
    const lastFetchKey = taskType === 'onetime' ? this.CACHE_KEYS.ONE_TIME_LAST_FETCH : this.CACHE_KEYS.RECURRING_LAST_FETCH;
    
    // Check if we should use cache
    const shouldUseCache = !forceRefresh && 
                          !this.isCacheDirty(taskType) && 
                          !this.isCacheExpired(lastFetchKey);

    if (shouldUseCache) {
      const cachedTasks = this.getCachedTasks(taskType);
      if (cachedTasks) {
        return cachedTasks;
      }
    }

    // Fetch from database
    let tasks;
    if (taskType === 'onetime') {
      tasks = await this.fetchOneTimeTasks();
    } else {
      tasks = await this.fetchRecurringTasks();
    }

    // Save to cache
    this.saveTasks(taskType, tasks);
    
    return tasks;
  }

  // Update a single task in cache after database operation
  updateTaskInCache(taskType, updatedTask) {
    const cachedTasks = this.getCachedTasks(taskType);
    if (!cachedTasks) return;

    const updatedTasks = cachedTasks.map(task => 
      task.$id === updatedTask.$id ? updatedTask : task
    );

    this.saveTasks(taskType, updatedTasks);
    console.log(`🔄 Updated task ${updatedTask.$id} in ${taskType} cache`);
  }

  // Add a new task to cache after database operation
  addTaskToCache(taskType, newTask) {
    const cachedTasks = this.getCachedTasks(taskType) || [];
    const updatedTasks = [...cachedTasks, newTask];
    
    this.saveTasks(taskType, updatedTasks);
    console.log(`➕ Added new task ${newTask.$id} to ${taskType} cache`);
  }

  // Remove a task from cache after database operation
  removeTaskFromCache(taskType, taskId) {
    const cachedTasks = this.getCachedTasks(taskType);
    if (!cachedTasks) return;

    const updatedTasks = cachedTasks.filter(task => task.$id !== taskId);
    
    this.saveTasks(taskType, updatedTasks);
    console.log(`🗑️ Removed task ${taskId} from ${taskType} cache`);
  }

  // Clear all cache (useful for logout or cache reset)
  clearAllCache() {
    Object.values(this.CACHE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('🧹 All task cache cleared');
  }

  // Get cache status for debugging
  getCacheStatus() {
    const oneTimeCached = !!localStorage.getItem(this.CACHE_KEYS.ONE_TIME_TASKS);
    const recurringCached = !!localStorage.getItem(this.CACHE_KEYS.RECURRING_TASKS);
    const dirtyFlags = JSON.parse(localStorage.getItem(this.CACHE_KEYS.CACHE_DIRTY_FLAG) || '{}');
    
    return {
      oneTimeCached,
      recurringCached,
      dirtyFlags,
      oneTimeLastFetch: localStorage.getItem(this.CACHE_KEYS.ONE_TIME_LAST_FETCH),
      recurringLastFetch: localStorage.getItem(this.CACHE_KEYS.RECURRING_LAST_FETCH)
    };
  }
}

// Export singleton instance
export const taskCacheService = new TaskCacheService();
export default taskCacheService;