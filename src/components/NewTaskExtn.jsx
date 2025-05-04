import React, { useState, useEffect, useRef } from "react";
import { format, isToday, isBefore, addDays } from "date-fns";
import { 
  PlusCircle, 
  Search, 
  X, 
  Calendar, 
  RefreshCw, 
  Check,
  ChevronDown 
} from "lucide-react";
import DatePicker from "react-datepicker";
// Import the animation component
import AnimatedContainer from "./NewTaskAnimate";

// ===============================
// Utility Functions
// ===============================

// Filter past dates for date picker
export const filterPastDates = (date) => {
  return isToday(date) || !isBefore(date, addDays(new Date(), 0));
};

// Get suffix for day number (1st, 2nd, 3rd, etc.)
export function getDaySuffix(day) {
  if (day >= 11 && day <= 13) return "th";
  
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

// Helper function to get background color for initials
export function getInitialBgColor(initial) {
  if (!initial) return 'bg-gray-500';
  
  // Generate a stable color based on initial
  const colors = [
    'bg-blue-600',
    'bg-green-600',
    'bg-purple-600',
    'bg-red-600',
    'bg-yellow-600',
    'bg-pink-600',
    'bg-indigo-600',
    'bg-teal-600',
    'bg-orange-600',
    'bg-cyan-600',
  ];
  
  const charSum = initial.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[charSum % colors.length];
}

// Theme-dependent styles
export const getThemeStyles = (isDark) => {
  return {
    cardClass: `bg-${isDark ? 'gray-800' : 'white'} rounded-xl shadow-xl overflow-hidden`,
    textClass: `text-${isDark ? 'white' : 'gray-800'}`,
    mutedTextClass: `text-${isDark ? 'gray-400' : 'gray-500'}`,
    inputClass: `w-full p-3 rounded-lg bg-${isDark ? 'gray-700' : 'gray-50'} border ${isDark ? 'border-gray-600' : 'border-gray-300'} ${isDark ? 'text-white' : 'text-gray-800'} focus:outline-none focus:ring-2 focus:ring-blue-500`,
    labelClass: `block ${isDark ? 'text-white' : 'text-gray-800'} font-medium mb-2`,
    sectionClass: `mb-6 ${isDark ? 'bg-gray-750' : 'bg-gray-50'} p-6 rounded-lg shadow-sm`,
    buttonClass: `px-4 py-2 rounded-lg font-medium transition-colors duration-200`,
  };
};

// Tab styles
export const getTabClass = (activePanel, tab, isDark, buttonClass) => {
  return `${buttonClass} ${activePanel === tab 
    ? (isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') 
    : (isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-650' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
  }`;
};

// Data constants
export const daysOfWeek = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" }
];

// Month days array
export const monthDays = Array.from({ length: 28 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1}${getDaySuffix(i + 1)}`
}));

// ===============================
// Component Sections
// ===============================

// Basic Details Panel
export const BasicDetailsPanel = ({ 
  taskName, 
  setTaskName, 
  taskDescription, 
  setTaskDescription, 
  urgency, 
  setUrgency, 
  isDark, 
  inputClass, 
  labelClass, 
  buttonClass, 
  setActivePanel 
}) => {
  return (
    <div>
      <div className="mb-6">
        <label htmlFor="taskName" className={`${labelClass} text-lg`}>Task Name *</label>
        <input
          type="text"
          id="taskName"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          className={`${inputClass} text-2xl font-bold`}
          placeholder="Enter task name"
          required
        />
      </div>
      
      <div className="mb-6">
        <label htmlFor="taskDescription" className={labelClass}>Description (Optional)</label>
        <textarea
          id="taskDescription"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          className={`${inputClass} h-32 resize-none`}
          placeholder="Enter additional details about the task"
        />
      </div>
      
      <div className="mb-6">
        <label className={labelClass}>Urgency</label>
        <div className={`grid grid-cols-2 gap-4 p-1 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <button
            type="button"
            className={`py-3 rounded-lg flex items-center justify-center ${
              urgency === "normal" 
                ? (isDark ? 'bg-green-800 text-green-100' : 'bg-green-500 text-white') 
                : (isDark ? 'bg-transparent text-gray-300' : 'bg-transparent text-gray-600')
            }`}
            onClick={() => setUrgency("normal")}
          >
            <Check size={18} className={`mr-2 ${urgency === "normal" ? 'opacity-100' : 'opacity-0'}`} />
            Normal
          </button>
          <button
            type="button"
            className={`py-3 rounded-lg flex items-center justify-center ${
              urgency === "critical" 
                ? (isDark ? 'bg-red-800 text-red-100' : 'bg-red-500 text-white') 
                : (isDark ? 'bg-transparent text-gray-300' : 'bg-transparent text-gray-600')
            }`}
            onClick={() => setUrgency("critical")}
          >
            <Check size={18} className={`mr-2 ${urgency === "critical" ? 'opacity-100' : 'opacity-0'}`} />
            Critical
          </button>
        </div>
      </div>
      
      <div className="flex justify-end space-x-4 mt-8">
        <button
          type="button"
          className={`${buttonClass} ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white px-6 py-3`}
          onClick={() => setActivePanel('schedule')}
        >
          Continue to Schedule
        </button>
      </div>
    </div>
  );
};

// Schedule Panel
export const SchedulePanel = ({ 
  hasDueDate, 
  setHasDueDate, 
  dueDate, 
  setDueDate,
  isDatePickerOpen, 
  setIsDatePickerOpen, 
  isRecurring, 
  setIsRecurring, 
  recurringFrequency, 
  setRecurringFrequency, 
  recurringDay, 
  setRecurringDay, 
  recurringMonth, 
  setRecurringMonth, 
  formattedToday,
  isDark, 
  inputClass, 
  labelClass, 
  buttonClass, 
  textClass,
  datePickerRef,
  daysOfWeek,
  monthDays,
  filterPastDates,
  setActivePanel
}) => {
  return (
    <div>
      <div className="mb-6">
        <label className={labelClass}>Has Due Date?</label>
        <div className={`grid grid-cols-2 gap-4 p-1 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <button
            type="button"
            className={`py-3 rounded-lg flex items-center justify-center ${
              !hasDueDate 
                ? (isDark ? 'bg-blue-700 text-blue-100' : 'bg-blue-500 text-white') 
                : (isDark ? 'bg-transparent text-gray-300' : 'bg-transparent text-gray-600')
            }`}
            onClick={() => setHasDueDate(false)}
          >
            <Check size={18} className={`mr-2 ${!hasDueDate ? 'opacity-100' : 'opacity-0'}`} />
            No
          </button>
          <button
            type="button"
            className={`py-3 rounded-lg flex items-center justify-center ${
              hasDueDate 
                ? (isDark ? 'bg-blue-700 text-blue-100' : 'bg-blue-500 text-white') 
                : (isDark ? 'bg-transparent text-gray-300' : 'bg-transparent text-gray-600')
            }`}
            onClick={() => {
              setHasDueDate(true);
              if (!dueDate) setDueDate(formattedToday);
            }}
          >
            <Check size={18} className={`mr-2 ${hasDueDate ? 'opacity-100' : 'opacity-0'}`} />
            Yes
          </button>
        </div>
      </div>
      
      {hasDueDate && (
        <div className="mb-6" ref={datePickerRef}>
          <label className={labelClass}>Select Due Date</label>
          <div className="relative">
            <div 
              className={`${inputClass} flex items-center cursor-pointer`}
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            >
              <Calendar size={18} className={`mr-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <span>
                {dueDate 
                  ? format(new Date(dueDate), "MMMM d, yyyy") 
                  : "Select a date"}
              </span>
            </div>
            
            {isDatePickerOpen && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center"
                onClick={() => setIsDatePickerOpen(false)}
              >
                <div 
                  className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-3 rounded-lg shadow-2xl border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}
                  onClick={e => e.stopPropagation()}
                  style={{ maxWidth: "340px", width: "95%" }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      Select Due Date
                    </h3>
                    <button 
                      onClick={() => setIsDatePickerOpen(false)}
                      className={`p-1 rounded-full hover:${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
                    >
                      <X size={18} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
                    </button>
                  </div>
                  
                  {/* Calendar container with centered content and no extra padding */}
                  <div className={`flex justify-center items-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg py-1`}>
                    <DatePicker
                      selected={dueDate ? new Date(dueDate) : new Date()}
                      onChange={(date) => {
                        if (date) {
                          const formattedDate = format(date, "yyyy-MM-dd");
                          setDueDate(formattedDate);
                          setIsDatePickerOpen(false);
                        }
                      }}
                      inline
                      filterDate={filterPastDates}
                      minDate={new Date()}
                      calendarClassName={`${isDark ? 'dark-calendar' : ''} !mx-0`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <label className={labelClass}>Is this a recurring task?</label>
        <div className={`grid grid-cols-2 gap-4 p-1 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <button
            type="button"
            className={`py-3 rounded-lg flex items-center justify-center ${
              !isRecurring 
                ? (isDark ? 'bg-blue-700 text-blue-100' : 'bg-blue-500 text-white') 
                : (isDark ? 'bg-transparent text-gray-300' : 'bg-transparent text-gray-600')
            }`}
            onClick={() => setIsRecurring(false)}
          >
            <Check size={18} className={`mr-2 ${!isRecurring ? 'opacity-100' : 'opacity-0'}`} />
            No
          </button>
          <button
            type="button"
            className={`py-3 rounded-lg flex items-center justify-center ${
              isRecurring 
                ? (isDark ? 'bg-blue-700 text-blue-100' : 'bg-blue-500 text-white') 
                : (isDark ? 'bg-transparent text-gray-300' : 'bg-transparent text-gray-600')
            }`}
            onClick={() => setIsRecurring(true)}
          >
            <Check size={18} className={`mr-2 ${isRecurring ? 'opacity-100' : 'opacity-0'}`} />
            Yes
          </button>
        </div>
      </div>
      
      {isRecurring && (
        <div className="space-y-4 mb-6 p-4 rounded-lg border border-dashed bg-opacity-30 bg-blue-50 border-blue-300">
          <div>
            <label className={labelClass}>Recurring Frequency</label>
            <div className={`grid grid-cols-2 gap-4 p-1 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <button
                type="button"
                className={`py-3 rounded-lg flex items-center justify-center ${
                  recurringFrequency === 'weekly' 
                    ? (isDark ? 'bg-blue-700 text-blue-100' : 'bg-blue-500 text-white') 
                    : (isDark ? 'bg-transparent text-gray-300' : 'bg-transparent text-gray-600')
                }`}
                onClick={() => setRecurringFrequency('weekly')}
              >
                <RefreshCw size={18} className="mr-2" />
                Weekly
              </button>
              <button
                type="button"
                className={`py-3 rounded-lg flex items-center justify-center ${
                  recurringFrequency === 'monthly' 
                    ? (isDark ? 'bg-blue-700 text-blue-100' : 'bg-blue-500 text-white') 
                    : (isDark ? 'bg-transparent text-gray-300' : 'bg-transparent text-gray-600')
                }`}
                onClick={() => setRecurringFrequency('monthly')}
              >
                <Calendar size={18} className="mr-2" />
                Monthly
              </button>
            </div>
          </div>
          
          {recurringFrequency === 'weekly' && (
            <div>
              <label className={labelClass}>Recurring Day of the Week</label>
              <select
                value={recurringDay}
                onChange={(e) => setRecurringDay(e.target.value)}
                className={inputClass}
              >
                {daysOfWeek.map(day => (
                  <option key={day.value} value={day.value}>{day.label}</option>
                ))}
              </select>
            </div>
          )}
          
          {recurringFrequency === 'monthly' && (
            <div>
              <label className={labelClass}>Day of the Month</label>
              <select
                value={recurringMonth}
                onChange={(e) => setRecurringMonth(e.target.value)}
                className={inputClass}
              >
                {monthDays.map(day => (
                  <option key={day.value} value={day.value}>{day.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
      
      <div className="flex justify-between mt-8">
        <button
          type="button"
          className={`${buttonClass} ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${textClass}`}
          onClick={() => setActivePanel('basic')}
        >
          Back to Details
        </button>
        <button
          type="button"
          className={`${buttonClass} ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white px-6 py-3`}
          onClick={() => setActivePanel('assign')}
        >
          Continue to Assign
        </button>
      </div>
    </div>
  );
};

// Assign Panel
export const AssignPanel = ({
  taskOwner,
  setTaskOwner,
  selectedUser,
  isUserDropdownOpen,
  setIsUserDropdownOpen,
  searchTerm,
  setSearchTerm,
  filteredUsers,
  loading,
  isDark,
  inputClass,
  labelClass,
  buttonClass,
  textClass,
  mutedTextClass,
  userDropdownRef,
  getInitialBgColor,
  taskName,
  urgency,
  hasDueDate,
  dueDate,
  isRecurring,
  recurringFrequency,
  recurringDay,
  recurringMonth,
  getDaySuffix,
  setActivePanel,
  isSubmitting
}) => {
  // Use the AnimatedContainer component for animation
  return (
    <AnimatedContainer isAnimating={isSubmitting} animationType="shrinkExpand">
      <div className="mb-8">
        <label className={labelClass}>Assign to Team Member *</label>
        <div className="relative" ref={userDropdownRef}>
          <div 
            className={`${inputClass} flex items-center justify-between cursor-pointer`}
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
          >
            <div className="flex items-center">
              {selectedUser ? (
                <>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getInitialBgColor(selectedUser.initials)}`}>
                    {selectedUser.initials}
                  </div>
                  <span className="ml-3">{selectedUser.name}</span>
                </>
              ) : (
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Select team member</span>
              )}
            </div>
            <ChevronDown size={18} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
          </div>
          
          {isUserDropdownOpen && (
            <div className={`absolute z-10 mt-2 w-full rounded-lg shadow-lg ${isDark ? 'bg-gray-700' : 'bg-white'} border ${isDark ? 'border-gray-500' : 'border-gray-200'}`}>
              <div className={`p-2 border-b ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 py-2 rounded ${isDark ? 'bg-gray-600 text-white' : 'bg-gray-50 text-gray-900'} border ${isDark ? 'border-gray-600' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Search team members..."
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={16} />
                  {searchTerm && (
                    <X
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                      size={16}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchTerm("");
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {loading ? (
                  <div className={`py-3 px-4 text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Loading team members...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className={`py-3 px-4 text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    No matching team members found
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`py-3 px-4 flex items-center cursor-pointer ${
                        user.id === taskOwner 
                          ? (isDark ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800') 
                          : (isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100')
                      } transition-colors duration-150 border-b ${isDark ? 'border-gray-600' : 'border-gray-200'} last:border-0`}
                      onClick={() => {
                        setTaskOwner(user.id);
                        setIsUserDropdownOpen(false);
                        setSearchTerm("");
                      }}
                    >
                      <div className={`w-9 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs ${getInitialBgColor(user.initials)}`}>
                        {user.initials}
                      </div>
                      <div className="ml-3">
                        <span className={`${user.id === taskOwner ? 'font-semibold' : 'font-medium'} ${isDark && user.id !== taskOwner ? 'text-gray-200' : ''}`}>
                          {user.name}
                        </span>
                      </div>
                      {user.id === taskOwner && (
                        <Check size={18} className="ml-auto" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Task Summary Section */}
      <div className={`p-6 rounded-lg border ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'} mb-8`}>
        <h3 className={`${textClass} font-semibold text-lg mb-4`}>Task Summary</h3>
        
        <div className="space-y-3">
          <div className="flex">
            <span className={`${mutedTextClass} w-36`}>Task Name:</span>
            <span className={`${textClass} font-medium flex-grow`}>{taskName || <span className="italic opacity-50">Not specified</span>}</span>
          </div>
          
          <div className="flex">
            <span className={`${mutedTextClass} w-36`}>Urgency:</span>
            <span className={`${
              urgency === 'critical' 
                ? (isDark ? 'text-red-400' : 'text-red-600') 
                : (isDark ? 'text-green-400' : 'text-green-600')
            } font-medium`}>
              {urgency === 'critical' ? 'Critical' : 'Normal'}
            </span>
          </div>
          
          <div className="flex">
            <span className={`${mutedTextClass} w-36`}>Due Date:</span>
            <span className={`${textClass} font-medium`}>
              {hasDueDate 
                ? (dueDate ? format(new Date(dueDate), "MMMM d, yyyy") : 'Set a date') 
                : 'No due date'}
            </span>
          </div>
          
          <div className="flex">
            <span className={`${mutedTextClass} w-36`}>Recurring:</span>
            <span className={`${textClass} font-medium`}>
              {isRecurring 
                ? (
                    recurringFrequency === 'weekly' 
                      ? `Weekly on ${recurringDay.charAt(0).toUpperCase() + recurringDay.slice(1)}s` 
                      : `Monthly on the ${recurringMonth}${getDaySuffix(parseInt(recurringMonth))}`
                  )
                : 'Not recurring'}
            </span>
          </div>
          
          <div className="flex">
  <span className={`${mutedTextClass} w-36`}>Assigned to:</span>
  {selectedUser ? (
    <div className="flex items-center">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${getInitialBgColor(selectedUser.initials)} text-xs`}>
        {selectedUser.initials}
      </div>
      <span className={`${textClass} font-medium ml-2`}>{selectedUser.name}</span>
    </div>
  ) : (
    <span className={`${mutedTextClass} italic opacity-50`}>Not assigned</span>
  )}
</div>
        </div>
      </div>
      
      <div className="flex justify-between mt-8">
        <button
          type="button"
          className={`${buttonClass} ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${textClass}`}
          onClick={() => setActivePanel('schedule')}
        >
          Back to Schedule
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`${buttonClass} ${isDark ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white px-6 py-3 flex items-center`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Task...
            </>
          ) : (
            <>
              <PlusCircle size={20} className="mr-2" />
              Create Task
            </>
          )}
        </button>
      </div>
    </AnimatedContainer>
  );
};