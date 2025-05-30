// RecurringTaskFiltersnStats.jsx - Specialized component for recurring tasks
import React from "react";
import { LayoutList, ListChecks } from "lucide-react";

const RecurringTaskFiltersnStats = ({
  currentTheme,
  showActiveOnly,
  setShowActiveOnly,
  tasks, // Array of recurring tasks
}) => {
  // Calculate frequency-specific statistics for recurring tasks
  const calculateRecurringStats = (tasks) => {
    const stats = {
      weekly: { total: 0, open: 0, closed: 0 },
      monthly: { total: 0, open: 0, closed: 0 },
      daily: { total: 0, open: 0, closed: 0 },
      yearly: { total: 0, open: 0, closed: 0 }
    };
    
    tasks.forEach(task => {
      const freq = task.recurringfreq;
      
      if (stats[freq]) {
        stats[freq].total++;
        if (task.recurringdone) {
          stats[freq].closed++;
        } else {
          stats[freq].open++;
        }
      }
    });
    
    return stats;
  };

  const stats = calculateRecurringStats(Array.isArray(tasks) ? tasks : []);

  // Get frequency info with matching colors from the table
  const getFrequencyInfo = (frequency) => {
    switch (frequency) {
      case 'weekly':
        return {
          symbol: 'W',
          name: 'Weekly Tasks',
          bgColor: 'bg-teal-400',
          textColor: 'text-black',
          
        };
      case 'monthly':
        return {
          symbol: 'M',
          name: 'Monthly Tasks',
          bgColor: 'bg-teal-800',
          textColor: 'text-white'
        };
      case 'daily':
        return {
          symbol: 'D',
          name: 'Daily Tasks',
          bgColor: 'bg-green-600',
          textColor: 'text-white'
        };
      case 'yearly':
        return {
          symbol: 'Y',
          name: 'Yearly Tasks',
          bgColor: 'bg-orange-600',
          textColor: 'text-white'
        };
      default:
        return null;
    }
  };

  // Filter out frequencies with no tasks
  const activeFrequencies = Object.keys(stats).filter(freq => stats[freq].total > 0);

  return (
    <div
      className={`${
        currentTheme.name === "dark"
          ? "bg-gray-800 text-white"
          : "bg-gray-100 text-gray-800"
      } p-4 mt-4 rounded-lg shadow-lg`}
    >
      <div className="flex items-center justify-between">
        {/* Weekly Tasks - Left Side */}
        <div className="flex items-center">
          {stats.weekly.total > 0 && (
            <div className="flex items-center space-x-3">
              {/* Frequency Badge */}
              <div className="w-10 h-10 bg-teal-400 rounded-xl flex items-center justify-center">
                <span className="  text-xl text-black">W</span>
              </div>
              
              {/* Statistics */}
              <div className="flex items-center space-x-4 text-sm">
                <span className="flex items-center space-x-1">
                  <span className={`${currentTheme.name === "dark" ? "text-blue-300" : "text-blue-600"}`}>📋</span>
                  <span className="font-semibold">Total: {stats.weekly.total}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <LayoutList 
                    size={16} 
                    className={`${currentTheme.name === "dark" ? "text-yellow-400" : "text-yellow-600"}`}
                  />
                  <span className="font-semibold">Open: {stats.weekly.open}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <ListChecks 
                    size={16} 
                    className={`${currentTheme.name === "dark" ? "text-green-400" : "text-green-600"}`}
                  />
                  <span className="font-semibold">Closed: {stats.weekly.closed}</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Vertical Separator */}
        <div className={`h-8 w-px ${
          currentTheme.name === "dark" ? "bg-gray-500" : "bg-gray-400"
        }`}></div>

        {/* Monthly Tasks - Right Side */}
        <div className="flex items-center">
          {stats.monthly.total > 0 && (
            <div className="flex items-center space-x-3">
              {/* Frequency Badge */}
              <div className="w-10 h-10 bg-teal-800 rounded-xl flex items-center justify-center">
                <span className="  text-xl text-white">M</span>
              </div>
              
              {/* Statistics */}
              <div className="flex items-center space-x-4 text-sm">
                <span className="flex items-center space-x-1">
                  <span className={`${currentTheme.name === "dark" ? "text-blue-300" : "text-blue-600"}`}>📋</span>
                  <span className="font-semibold">Total: {stats.monthly.total}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <LayoutList 
                    size={16} 
                    className={`${currentTheme.name === "dark" ? "text-yellow-400" : "text-yellow-600"}`}
                  />
                  <span className="font-semibold">Open: {stats.monthly.open}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <ListChecks 
                    size={16} 
                    className={`${currentTheme.name === "dark" ? "text-green-400" : "text-green-600"}`}
                  />
                  <span className="font-semibold">Closed: {stats.monthly.closed}</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Fallback if no recurring tasks */}
        {stats.weekly.total === 0 && stats.monthly.total === 0 && (
          <div className="flex items-center justify-center w-full">
            <div className="flex items-center space-x-1">
              <span className="text-gray-400">📝</span>
              <span className="font-semibold text-gray-400">No recurring tasks found</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecurringTaskFiltersnStats;