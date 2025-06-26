// TaskValidationCache.js
// Cache management for Task Validation data

class TaskValidationCache {
    constructor() {
      this.cache = {
        tasks: [],
        stats: {
          total: 0,
          pending: 0,
          completed: 0,
          wellDone: 0
        },
        lastUpdated: null,
        isValid: false
      };
      
      // Cache expiry time in milliseconds (5 minutes)
      this.CACHE_EXPIRY = 5 * 60 * 1000;
    }
  
    // Set cache data
    setCache(tasks, stats) {
      this.cache = {
        tasks: [...tasks],
        stats: { ...stats },
        lastUpdated: new Date().getTime(),
        isValid: true
      };
      
      console.log('Cache updated with', tasks.length, 'tasks');
    }
  
    // Get cache data
    getCache() {
      if (!this.isValid()) {
        return null;
      }
      
      console.log('Cache hit - returning cached data');
      return {
        tasks: [...this.cache.tasks],
        stats: { ...this.cache.stats }
      };
    }
  
    // Check if cache is valid
    isValid() {
      if (!this.cache.isValid || !this.cache.lastUpdated) {
        return false;
      }
  
      const now = new Date().getTime();
      const timeDiff = now - this.cache.lastUpdated;
      
      return timeDiff < this.CACHE_EXPIRY;
    }
  
    // Invalidate cache (force refresh from DB)
    invalidate() {
      this.cache.isValid = false;
      this.cache.lastUpdated = null;
      console.log('Cache invalidated');
    }
  
    // Update single task in cache
    updateTaskInCache(taskId, updatedTask) {
      if (!this.cache.isValid) {
        return false;
      }
  
      const taskIndex = this.cache.tasks.findIndex(task => task.$id === taskId);
      if (taskIndex !== -1) {
        this.cache.tasks[taskIndex] = { ...this.cache.tasks[taskIndex], ...updatedTask };
        console.log('Task updated in cache:', taskId);
        return true;
      }
      
      return false;
    }
  
    // Remove task from cache
    removeTaskFromCache(taskId) {
      if (!this.cache.isValid) {
        return false;
      }
  
      this.cache.tasks = this.cache.tasks.filter(task => task.$id !== taskId);
      console.log('Task removed from cache:', taskId);
      return true;
    }
  
    // Update cache statistics
    updateStats(newStats) {
      if (this.cache.isValid) {
        this.cache.stats = { ...newStats };
        console.log('Cache stats updated');
      }
    }
  
    // Get cache info for debugging
    getCacheInfo() {
      return {
        isValid: this.isValid(),
        taskCount: this.cache.tasks.length,
        lastUpdated: this.cache.lastUpdated ? new Date(this.cache.lastUpdated).toLocaleString() : 'Never',
        stats: this.cache.stats
      };
    }
  
    // Clear all cache data
    clear() {
      this.cache = {
        tasks: [],
        stats: {
          total: 0,
          pending: 0,
          completed: 0,
          wellDone: 0
        },
        lastUpdated: null,
        isValid: false
      };
      console.log('Cache cleared');
    }
  }
  
  // Create singleton instance
  const taskValidationCache = new TaskValidationCache();
  
  export default taskValidationCache;