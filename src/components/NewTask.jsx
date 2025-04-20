import React, { useState, useEffect, useRef } from "react";
import { Query, ID } from "appwrite";
import { format } from "date-fns";
import { 
  PlusCircle, 
  UserCheck, 
  Search, 
  X, 
  Calendar, 
  ChevronDown, 
  Check, 
  AlertTriangle
} from "lucide-react";
import { useTheme } from "./ColorChange";
import { databases, DATABASE_ID, COLLECTIONS } from "../appwrite/config";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Import utilities and UI components from NewTaskExtn
import {
  filterPastDates,
  getDaySuffix,
  daysOfWeek,
  monthDays,
  getInitialBgColor,
  getThemeStyles,
  getTabClass,
  BasicDetailsPanel,
  SchedulePanel,
  AssignPanel
} from "./NewTaskExtn";

const NewTask = () => {
  const { currentTheme } = useTheme();
  const isDark = currentTheme.name === "dark";
  
  // Task basic details
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [urgency, setUrgency] = useState("normal");
  
  // Due date fields
  const [hasDueDate, setHasDueDate] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  // Recurring task fields
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState("weekly");
  const [recurringDay, setRecurringDay] = useState("monday");
  const [recurringMonth, setRecurringMonth] = useState("1"); // 1st of month by default
  
  // Assignee fields
  const [taskOwner, setTaskOwner] = useState("");
  const [userOptions, setUserOptions] = useState([]);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // State fields
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  // UI state
  const [activePanel, setActivePanel] = useState("basic"); // basic, schedule, assign
  
  // Refs
  const userDropdownRef = useRef(null);
  const datePickerRef = useRef(null);

  // Initialize a date for today to avoid null errors
  const today = new Date();
  const formattedToday = format(today, "yyyy-MM-dd");

  // Get theme styles
  const {
    cardClass,
    textClass,
    mutedTextClass,
    inputClass,
    labelClass,
    sectionClass,
    buttonClass
  } = getThemeStyles(isDark);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
      
      if (datePickerRef.current && !datePickerRef.current.contains(event.target) && !event.target.closest('.react-datepicker')) {
        setIsDatePickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch user details
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Try localStorage first
        const storedUsers = localStorage.getItem("userOptions");
        
        if (storedUsers) {
          setUserOptions(JSON.parse(storedUsers));
          setLoading(false);
        } else {
          // Fetch from database
          const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.USER_DETAILS,
            [Query.limit(100)]
          );
          
          const users = response.documents.map((user) => ({
            id: user.$id,
            name: user.username,
            email: user.useremail,
            initials: user.initials || user.initial || user.userInitial || user.username.charAt(0)
          }));
          
          localStorage.setItem("userOptions", JSON.stringify(users));
          setUserOptions(users);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users. Please try again.");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = userOptions.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected user details
  const selectedUser = userOptions.find((user) => user.id === taskOwner);

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!taskName) {
      setError("Task name is required");
      return;
    }
    
    if (!taskOwner) {
      setError("Task owner is required");
      setActivePanel("assign");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Get selected user details
      const selectedUser = userOptions.find(user => user.id === taskOwner);
      
      if (!selectedUser) {
        setError("Selected user not found. Please try again.");
        setIsSubmitting(false);
        return;
      }
      
      // Create task document
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.TASK_DETAILS,
        ID.unique(),
        {
          taskname: taskName,
          comments: taskDescription || null,
          taskownername: selectedUser.name,
          taskownerinitial: selectedUser.initials,
          taskowneremail: selectedUser.email,
          taskduedate: hasDueDate ? dueDate : null,
          userdone: false,
          taskcompleted: false,
          perfectstar: false,
          urgency: urgency === "critical" ? "Critical" : "Normal",
          recurringtask: isRecurring,
          recurringfreq: isRecurring ? recurringFrequency : null,
          recurringday: isRecurring 
            ? (recurringFrequency === "weekly" 
                ? recurringDay 
                : recurringFrequency === "monthly" 
                  ? recurringMonth 
                  : null)
            : null,
        }
      );
      
      // Show success message
      setSuccessMessage("Task created successfully!");
      
      // Reset form
      setTaskName("");
      setTaskDescription("");
      setUrgency("normal");
      setHasDueDate(false);
      setDueDate("");
      setIsRecurring(false);
      setRecurringFrequency("weekly");
      setRecurringDay("monday");
      setRecurringMonth("1");
      setTaskOwner("");
      setActivePanel("basic");
      
      // Clear success message after delay
      setTimeout(() => {
        setSuccessMessage("");
        setIsSubmitting(false);
      }, 1500);
      
    } catch (err) {
      console.error("Error creating task:", err);
      setError(err.message || "Failed to create task. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className={`text-center mb-8`}>
        <h1 className={`text-3xl font-bold ${textClass} mb-4`}>Create New Task</h1>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className={`mb-6 p-4 flex items-center rounded-lg ${isDark ? 'bg-red-900/50 border border-red-800' : 'bg-red-100 border border-red-300'}`}>
          <AlertTriangle className={`mr-3 ${isDark ? 'text-red-400' : 'text-red-500'}`} size={20} />
          <p className={`${isDark ? 'text-red-200' : 'text-red-700'}`}>{error}</p>
          <button 
            onClick={() => setError(null)} 
            className="ml-auto"
            aria-label="Dismiss error"
          >
            <X size={20} className={isDark ? 'text-red-400' : 'text-red-500'} />
          </button>
        </div>
      )}
      
      {/* Success Message */}
      {successMessage && (
        <div className={`mb-6 p-4 flex items-center rounded-lg ${isDark ? 'bg-green-900/50 border border-green-800' : 'bg-green-100 border border-green-300'}`}>
          <Check className={`mr-3 ${isDark ? 'text-green-400' : 'text-green-500'}`} size={20} />
          <p className={`${isDark ? 'text-green-200' : 'text-green-700'}`}>{successMessage}</p>
        </div>
      )}
      
      <div className={cardClass}>
        <form onSubmit={handleSubmit}>
          {/* Tabs */}
          <div className={`flex border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} overflow-x-auto`}>
            <button 
              type="button"
              className={`${getTabClass(activePanel, 'basic', isDark, buttonClass)} px-6 py-4 flex-1`}
              onClick={() => setActivePanel('basic')}
            >
              <span className="flex items-center justify-center">
                <PlusCircle size={18} className="mr-2" />
                <span>Basic Details</span>
              </span>
            </button>
            <button 
              type="button"
              className={`${getTabClass(activePanel, 'schedule', isDark, buttonClass)} px-6 py-4 flex-1`}
              onClick={() => setActivePanel('schedule')}
            >
              <span className="flex items-center justify-center">
                <Calendar size={18} className="mr-2" />
                <span>Schedule</span>
              </span>
            </button>
            <button 
              type="button"
              className={`${getTabClass(activePanel, 'assign', isDark, buttonClass)} px-6 py-4 flex-1`}
              onClick={() => setActivePanel('assign')}
            >
              <span className="flex items-center justify-center">
                <UserCheck size={18} className="mr-2" />
                <span>Assign</span>
              </span>
            </button>
          </div>
          
          <div className="p-6">
            {/* Basic Details Panel */}
            {activePanel === 'basic' && (
              <BasicDetailsPanel
                taskName={taskName}
                setTaskName={setTaskName}
                taskDescription={taskDescription}
                setTaskDescription={setTaskDescription}
                urgency={urgency}
                setUrgency={setUrgency}
                isDark={isDark}
                inputClass={inputClass}
                labelClass={labelClass}
                buttonClass={buttonClass}
                setActivePanel={setActivePanel}
              />
            )}
            
            {/* Schedule Panel */}
            {activePanel === 'schedule' && (
              <SchedulePanel
                hasDueDate={hasDueDate}
                setHasDueDate={setHasDueDate}
                dueDate={dueDate}
                setDueDate={setDueDate}
                isDatePickerOpen={isDatePickerOpen}
                setIsDatePickerOpen={setIsDatePickerOpen}
                isRecurring={isRecurring}
                setIsRecurring={setIsRecurring}
                recurringFrequency={recurringFrequency}
                setRecurringFrequency={setRecurringFrequency}
                recurringDay={recurringDay}
                setRecurringDay={setRecurringDay}
                recurringMonth={recurringMonth}
                setRecurringMonth={setRecurringMonth}
                formattedToday={formattedToday}
                isDark={isDark}
                inputClass={inputClass}
                labelClass={labelClass}
                buttonClass={buttonClass}
                textClass={textClass}
                datePickerRef={datePickerRef}
                daysOfWeek={daysOfWeek}
                monthDays={monthDays}
                filterPastDates={filterPastDates}
                setActivePanel={setActivePanel}
              />
            )}
            
            {/* Assign Panel */}
            {activePanel === 'assign' && (
              <AssignPanel
                taskOwner={taskOwner}
                setTaskOwner={setTaskOwner}
                selectedUser={selectedUser}
                isUserDropdownOpen={isUserDropdownOpen}
                setIsUserDropdownOpen={setIsUserDropdownOpen}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filteredUsers={filteredUsers}
                loading={loading}
                isDark={isDark}
                inputClass={inputClass}
                labelClass={labelClass}
                buttonClass={buttonClass}
                textClass={textClass}
                mutedTextClass={mutedTextClass}
                userDropdownRef={userDropdownRef}
                getInitialBgColor={getInitialBgColor}
                taskName={taskName}
                urgency={urgency}
                hasDueDate={hasDueDate}
                dueDate={dueDate}
                isRecurring={isRecurring}
                recurringFrequency={recurringFrequency}
                recurringDay={recurringDay}
                recurringMonth={recurringMonth}
                getDaySuffix={getDaySuffix}
                setActivePanel={setActivePanel}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTask;