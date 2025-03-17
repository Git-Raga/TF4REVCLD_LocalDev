import React, { useState, useEffect, useRef } from "react";
import { Query, ID } from "appwrite";
import { format, isToday, isBefore, addDays } from "date-fns";
import { PlusSquare, UserCheck, Search, X, Calendar } from "lucide-react";
import { useTheme } from "./ColorChange"; // Import useTheme hook
import { databases, DATABASE_ID, COLLECTIONS } from "../appwrite/config";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Base styles

// Custom header component for the date picker to match your theme
const CustomHeader = ({
  date,
  decreaseMonth,
  increaseMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
  theme,
}) => {
  const textColor = theme.name === "dark" ? "#ffffff" : "#000000";
  const bgColor = theme.name === "dark" ? "#374151" : "#ffffff";

  const handleDecrease = (e) => {
    e.preventDefault(); // Prevent form submission
    decreaseMonth();
  };

  const handleIncrease = (e) => {
    e.preventDefault(); // Prevent form submission
    increaseMonth();
  };

  return (
    <div
      style={{
        margin: "10px 0",
        display: "flex",
        justifyContent: "space-between",
        fontFamily: "'Titillium Web', sans-serif",
        color: textColor,
        backgroundColor: bgColor,
      }}
    >
      <button
        onClick={handleDecrease}
        disabled={prevMonthButtonDisabled}
        style={{ color: textColor }}
        type="button" // Prevent form submission
      >
        {"<"}
      </button>
      <div
        style={{
          fontWeight: "bold",
          color: textColor,
          fontSize: "1.1rem", // Increased font size
        }}
      >
        {format(date, "MMMM yyyy")}
      </div>
      <button
        onClick={handleIncrease}
        disabled={nextMonthButtonDisabled}
        style={{ color: textColor }}
        type="button" // Prevent form submission
      >
        {">"}
      </button>
    </div>
  );
};

// Searchable dropdown component
const SearchableDropdown = ({ options, value, onChange, loading, theme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const selectedOption = options.find((opt) => opt.id === value);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Determine colors based on theme
  const dropdownBg = theme.name === "dark" ? "#2D3748" : "#ffffff";
  const dropdownTextColor = theme.name === "dark" ? "#ffffff" : "#000000";
  const dropdownBorder =
    theme.name === "dark" ? "2px solid #4299e1" : "1px solid #E5E7EB";
  const optionsBg = theme.name === "dark" ? "#374151" : "#f9fafb";
  const optionsHoverBg = theme.name === "dark" ? "#4B5563" : "#f3f4f6";
  const placeholderColor = theme.name === "dark" ? "#9CA3AF" : "#6B7280";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full px-4 py-3 rounded-lg cursor-pointer"
        style={{
          backgroundColor: dropdownBg,
          color: dropdownTextColor,
          border: dropdownBorder,
          fontFamily: "'Titillium Web', sans-serif",
        }}
      >
        <span>{selectedOption ? selectedOption.name : "Select Owner"}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-5 h-5 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 shadow-lg rounded-md overflow-hidden"
          style={{ backgroundColor: optionsBg }}
        >
          {/* Search input */}
          <div
            className="p-2 border-b"
            style={{
              borderColor: theme.name === "dark" ? "#4B5563" : "#E5E7EB",
            }}
          >
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-8 py-2 rounded"
                style={{
                  backgroundColor:
                    theme.name === "dark" ? "#1F2937" : "#ffffff",
                  color: dropdownTextColor,
                  border:
                    theme.name === "dark"
                      ? "1px solid #4B5563"
                      : "1px solid #E5E7EB",
                  fontFamily: "'Titillium Web', sans-serif",
                }}
              />
              <Search
                className="absolute left-2 top-2.5"
                size={16}
                color={placeholderColor}
              />
              {searchTerm && (
                <X
                  className="absolute right-2 top-2.5 cursor-pointer"
                  size={16}
                  color={placeholderColor}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchTerm("");
                  }}
                />
              )}
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div
                className="px-4 py-2 text-center"
                style={{ color: placeholderColor }}
              >
                No matches found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-600"
                  style={{
                    color: dropdownTextColor,
                    fontFamily: "'Titillium Web', sans-serif",
                    backgroundColor:
                      value === option.id
                        ? theme.name === "dark"
                          ? "#4299e1"
                          : "#EBF5FF"
                        : "transparent",
                    hover: { backgroundColor: optionsHoverBg },
                  }}
                  onClick={() => {
                    onChange({ target: { value: option.id } });
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  {option.name}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Hidden select for form submission */}
      <select value={value} onChange={onChange} className="sr-only" required>
        <option value="" disabled>
          Select Owner
        </option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
};

const NewTask = () => {
  // Get theme from context
  const { currentTheme } = useTheme();

  // Initialize state for form fields
  const [taskName, setTaskName] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [hasDueDate, setHasDueDate] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [taskOwner, setTaskOwner] = useState("");
  const [userOptions, setUserOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [isTaskAssigned, setIsTaskAssigned] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isTitleAnimating, setIsTitleAnimating] = useState(false);

  // Initialize a date for today to avoid null errors
  const today = new Date();
  const formattedToday = format(today, "yyyy-MM-dd");

  // Add this separate useEffect for animations - MOVED INSIDE COMPONENT
  useEffect(() => {
    const animStyle = document.createElement("style");
    animStyle.id = "custom-animations";
    animStyle.textContent = `
      /* Full rotation animation */
      @keyframes rotateContainer {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .container-rotate {
        animation: rotateContainer 1.5s ease-in-out;
      }
      
      /* Title zoom animation */
      @keyframes titleZoom {
        0% { transform: scale(1); }
        50% { transform: scale(1.3); }
        100% { transform: scale(1); }
      }
      
      .title-zoom {
        animation: titleZoom 1s ease-in-out;
      }
      
      /* Disabled form overlay */
      .form-disabled {
        position: relative;
        pointer-events: none;
        opacity: 0.7;
      }
      
      .form-disabled::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.1);
        border-radius: 0.5rem;
        z-index: 50;
      }
    `;
    document.head.appendChild(animStyle);
    
    return () => {
      const existingStyle = document.getElementById("custom-animations");
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []); // Empty dependency array - run once on mount only

  // Automatically open date picker when the user selects "Yes"
  useEffect(() => {
    if (hasDueDate) {
      // Initialize dueDate to today if it's empty to avoid potential null errors
      if (!dueDate) {
        setDueDate(formattedToday);
      }

      // Set a slight delay to ensure component is rendered
      setTimeout(() => {
        setIsDatePickerOpen(true);
      }, 50);
    } else {
      setIsDatePickerOpen(false);
      setDueDate(""); // Clear the date if "No" is selected
    }
  }, [hasDueDate, formattedToday]);

  // Fetch user details from the database
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        // Try to get users from localStorage first
        const storedUsers = localStorage.getItem("userOptions");

        if (storedUsers) {
          // If users exist in localStorage, use them
          setUserOptions(JSON.parse(storedUsers));
          setLoading(false);
        } else {
          // If not in localStorage, fetch from database
          const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.USER_DETAILS,
            [Query.limit(100)]
          );

          const users = response.documents.map((user) => ({
            id: user.$id,
            name: user.username,
            email: user.useremail,
          }));

          // Store in localStorage for future use
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

  // Function to filter out past dates
  const filterPastDates = (date) => {
    // Allow today or future dates
    return isToday(date) || !isBefore(date, addDays(new Date(), 0));
  };

  // Function to determine class name for each day
  const getDayClassName = (date) => {
    // Current theme specific class
    const themeClass = currentTheme.name === "dark" ? "dark-day" : "light-day";

    // Add selected class if this date is the selected date
    if (dueDate && date.toDateString() === new Date(dueDate).toDateString()) {
      return `${themeClass} selected-day`;
    }

    return themeClass;
  };

  // Add calendar-specific and animation styles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      /* Add direct inline styling for selected days in light mode */
      .light-day.react-datepicker__day--selected,
      .light-day.react-datepicker__day--keyboard-selected {
        background-color: #87edb5 !important;
        color: black !important;
      }
      
      .light-day:hover:not(.react-datepicker__day--disabled):not(.react-datepicker__day--selected) {
        background-color: #6ab089 !important;
        color: black !important;
      }
      
      .selected-day {
        background-color: ${
          currentTheme.name === "dark" ? "#4299e1" : "#87edb5"
        } !important;
        color: ${currentTheme.name === "dark" ? "white" : "black"} !important;
      }
      
      .dark-theme-datepicker .react-datepicker {
        background-color: #374151;
        border: 1px solid #4B5563;
        font-family: 'Titillium Web', sans-serif;
        z-index: 1000;
      }
      
      .dark-theme-datepicker .react-datepicker__header {
        background-color: #1F2937;
        border-bottom: 1px solid #4B5563;
      }
      
      .dark-theme-datepicker .react-datepicker__current-month,
      .dark-theme-datepicker .react-datepicker__day-name,
      .dark-theme-datepicker .react-datepicker__day {
        color: #ffffff;
        font-family: 'Titillium Web', sans-serif;
      }
      
      .dark-theme-datepicker .react-datepicker__day:hover {
        background-color:rgb(24, 98, 56);
      }
      
      .dark-theme-datepicker .react-datepicker__day--selected {
        background-color:rgb(28, 116, 103);
      }
      
      .dark-theme-datepicker .react-datepicker__day--today {
        font-weight: bold;
        color:rgb(199, 241, 241);
      }
      
      .light-theme-datepicker .react-datepicker__day--selected {
        background-color: #87edb5 !important;
        color: black !important;
      }
      
      .light-theme-datepicker .react-datepicker__day--keyboard-selected {
        background-color: #87edb5 !important;
        color: black !important;
      }
      
      .light-theme-datepicker .react-datepicker__day:hover:not(.react-datepicker__day--disabled):not(.react-datepicker__day--selected) {
        background-color: #6ab089 !important;
        color: black !important;
      }
      
      .react-datepicker__day {
        font-family: 'Titillium Web', sans-serif;
      }
      
      .react-datepicker__navigation-icon {
        top: 4px;
      }
      
      .react-datepicker__day--keyboard-selected {
        background-color: ${
          currentTheme.name === "dark" ? "#4299e1" : "#87edb5"
        } !important;
        color: ${currentTheme.name === "dark" ? "white" : "black"} !important;
      }
      
      .react-datepicker__day--disabled {
        color: ${
          currentTheme.name === "dark" ? "#6B7280" : "#D1D5DB"
        } !important;
        cursor: not-allowed;
      }
      
      /* Fix for the dropdown expanding container issue */
      .react-datepicker-popper {
        z-index: 9999 !important;
        position: absolute !important;
      }
      
      .react-datepicker-wrapper {
        width: 100%;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [currentTheme.name, dueDate]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!taskName || !taskOwner) {
      setError("Task name and owner are required fields");
      return;
    }
  
    try {
      setAuthLoading(true);
      // Get selected user details
      const selectedUser = userOptions.find((user) => user.id === taskOwner);
  
      // Check if we have the user data before proceeding
      if (!selectedUser) {
        setError("Selected user not found. Please refresh and try again.");
        setAuthLoading(false);
        return;
      }
  
      // Create new task document with explicit permissions
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.TASK_DETAILS,
        ID.unique(), // Generate unique ID using Appwrite's ID utility
        {
          taskname: taskName,
          taskownername: selectedUser.name,
          taskownerinitial: selectedUser.name.charAt(0),
          taskowneremail: selectedUser.email,
          taskduedate: hasDueDate ? dueDate : null,
          userdone: false,
          taskcompleted: false,
          perfectstar: false,
          urgency: urgency === "critical" ? "Critical" : "Normal",
        }
      );
  
      // Change button text to "Task assigned"
      setIsTaskAssigned(true);
  
      // Start rotation animation
      setIsRotating(true);
  
      // Reset form after successful submission (with a delay to see the "Task assigned" text)
      setTimeout(() => {
        // Start title animation after rotation is complete
        setIsTitleAnimating(true);
        
        setTimeout(() => {
          // Reset form values
          setTaskName("");
          setUrgency("normal");
          setHasDueDate(false);
          setDueDate("");
          setTaskOwner("");
          setError(null);
          setIsTaskAssigned(false); // Reset button text after delay
          setIsRotating(false); // Stop rotation animation
          setIsTitleAnimating(false); // Stop title animation
          setAuthLoading(false); // Only re-enable form after all animations
        }, 1000); // 1 second for title animation
      }, 1500); // Wait for rotation to complete
    } catch (err) {
      console.error("Error creating task:", err);
      // Provide more specific error message based on error type
      if (err.code === 401) {
        setError("Authentication error: Please log in again to create tasks.");
      } else if (err.code === 403) {
        setError(
          "Permission denied: You do not have permission to create tasks."
        );
      } else {
        setError(`Failed to assign task: ${err.message}`);
      }
      setAuthLoading(false); // Re-enable form on error
    }  
  };

  // Setup theme-dependent styles
  const containerClass =
    currentTheme.name === "dark"
      ? `max-w-3xl mx-auto mt-10 p-6 ${
          currentTheme.cardBackground
        } rounded-lg shadow-lg ${isRotating ? "container-rotate" : ""}`
      : `max-w-3xl mx-auto p-6 mt-10 bg-gray-100 rounded-lg shadow-lg ${
          isRotating ? "container-rotate" : ""
        }`;

  const labelClass =
    currentTheme.name === "dark"
      ? `block ${currentTheme.text} text-lg font-semibold mb-2`
      : "block text-gray-700 text-lg font-semibold mb-2";

  const inputClass =
    currentTheme.name === "dark"
      ? `w-full px-4 py-3 ${currentTheme.text} bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`
      : "w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";

  const errorClass =
    currentTheme.name === "dark"
      ? "mb-4 p-3 bg-red-900 border border-red-800 text-red-200 rounded"
      : "mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded";

  const radioClass =
    currentTheme.name === "dark"
      ? `px-3 py-2 rounded-lg cursor-pointer text-sm`
      : "px-3 py-2 rounded-lg cursor-pointer text-sm";

  const radioActiveClassNormal =
    currentTheme.name === "dark"
      ? "bg-green-800 border-2 border-green-600 text-green-100"
      : "bg-green-100 border-2 border-green-500 text-green-700";

  const radioInactiveClass =
    currentTheme.name === "dark"
      ? "bg-gray-700 text-gray-300"
      : "bg-gray-100 text-gray-600";

  const radioActiveClassCritical =
    currentTheme.name === "dark"
      ? "bg-red-900 border-2 border-red-600 text-red-100"
      : "bg-red-100 border-2 border-red-500 text-red-700";

  const buttonClass =
    currentTheme.name === "dark"
      ? "w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-3 px-6 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 flex items-center justify-center"
      : "w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 flex items-center justify-center";

  const iconColor = currentTheme.name === "dark" ? "white" : "currentColor";

  return (
    <div className={containerClass}>
      <div className="flex items-center justify-center flex-col mb-6 ">
        <h1
          className={`text-3xl font-bold ${currentTheme.text} mb-4 text-center ${
            isTitleAnimating ? "title-zoom" : ""
          }`}
        >
          Create New Task
        </h1>
        <PlusSquare size={68} className={currentTheme.text} />
      </div>

      {error && <div className={errorClass}>{error}</div>}

      <form 
        onSubmit={handleSubmit} 
        className={authLoading || isRotating ? "form-disabled" : ""}
      >
        {/* Task Name */}
        <div className="mb-6 text-2xl">
          <label htmlFor="taskName" className={labelClass}>
            New Task Details
          </label>
          <input
            type="text"
            id="taskName"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className={inputClass}
            placeholder="Enter the task"
            required
          />
        </div>
        {/* Inline Section for Task Owner, Urgency, and Due Date */}
        <div className="mb-16 mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Task Owner - Searchable Dropdown Component */}
          <div
            className="text-center p-4.5 border rounded-lg shadow-sm"
            style={{
              borderColor: currentTheme.name === "dark" ? "#4B5563" : "#E5E7EB",
              position: "relative", // Add this to contain the dropdown
              zIndex: 2, // Lower z-index than the date picker
            }}
          >
            <label htmlFor="taskOwner" className={`${labelClass} text-center`}>
              Task Owner
            </label>
            <div>
              {loading ? (
                <div
                  className={`px-4 py-3 ${
                    currentTheme.name === "dark" ? "bg-gray-700" : "bg-gray-100"
                  } rounded-lg ${currentTheme.text}`}
                >
                  Loading...
                </div>
              ) : (
                <SearchableDropdown
                  options={userOptions}
                  value={taskOwner}
                  onChange={(e) => setTaskOwner(e.target.value)}
                  loading={loading}
                  theme={currentTheme}
                />
              )}
            </div>
          </div>

          {/* Urgency Toggle */}
          <div
            className="text-center p-3 border rounded-lg shadow-sm"
            style={{
              borderColor: currentTheme.name === "dark" ? "#4B5563" : "#E5E7EB",
              position: "relative", // Add this to contain the dropdown
              zIndex: 2, // Lower z-index than the date picker
            }}
          >
            <label className={`${labelClass} text-center`}>Urgency</label>
            <div className="flex items-center justify-center space-x-2">
              <div
                className={`${radioClass} ${
                  urgency === "normal"
                    ? radioActiveClassNormal
                    : radioInactiveClass
                }`}
                onClick={() => setUrgency("normal")}
              >
                <span className="font-medium">Normal</span>
              </div>
              <div
                className={`${radioClass} ${
                  urgency === "critical"
                    ? radioActiveClassCritical
                    : radioInactiveClass
                }`}
                onClick={() => setUrgency("critical")}
              >
                <span className="font-medium">Critical</span>
              </div>
            </div>
          </div>

          {/* Due Date with Radio Button */}
          <div
            className="text-center p-3 border rounded-lg shadow-sm"
            style={{
              borderColor: currentTheme.name === "dark" ? "#4B5563" : "#E5E7EB",
              position: "relative", // Add this to contain the dropdown
              zIndex: 10, // Higher z-index for the date picker
            }}
          >
            <label className={`${labelClass} text-center`}>
              Has a due date?
            </label>
            <div className="flex items-center justify-center space-x-2">
              <div
                className={`${radioClass} ${
                  !hasDueDate ? radioActiveClassNormal : radioInactiveClass
                }`}
                onClick={() => setHasDueDate(false)}
              >
                <span className="font-medium">No</span>
              </div>
              <div
                className={`${radioClass} ${
                  hasDueDate ? radioActiveClassCritical : radioInactiveClass
                }`}
                onClick={() => setHasDueDate(true)}
              >
                <span className="font-medium">Yes</span>
              </div>
            </div>

            {/* Date picker appears when "Yes" is selected */}
            {hasDueDate && (
              <div className="mt-3 relative">
                <DatePicker
                  selected={dueDate ? new Date(dueDate) : new Date()} // Default to today
                  onChange={(date) => {
                    if (date) {
                      // Check for valid date
                      const formattedDate = format(date, "yyyy-MM-dd");
                      setDueDate(formattedDate);
                      setIsDatePickerOpen(false); // Close calendar after selection
                    }
                  }}
                  dateFormat="dd-MM-yyyy"
                  open={isDatePickerOpen}
                  onClickOutside={() => setIsDatePickerOpen(false)} // Close when clicking outside
                  filterDate={filterPastDates} // Disable past dates
                  minDate={new Date()} // Set minimum date to today
                  // Use simpler positioning settings
                  popperProps={{
                    positionFixed: true,
                    strategy: "fixed",
                  }}
                  // Add day className for styling specific days
                  dayClassName={getDayClassName}
                  // Add inline styling for selected day
                  renderDayContents={(day, date) => {
                    return (
                      <div
                        style={{
                          backgroundColor:
                         
                          dueDate &&
                          date.toDateString() ===
                            new Date(dueDate).toDateString() &&
                          currentTheme.name !== "dark"
                            ? "#87edb5"
                            : undefined,
                        color:
                          dueDate &&
                          date.toDateString() ===
                            new Date(dueDate).toDateString() &&
                          currentTheme.name !== "dark"
                            ? "black"
                            : undefined,
                        width: "100%",
                        height: "100%",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {day}
                    </div>
                  );
                }}
                renderCustomHeader={(props) => (
                  <CustomHeader {...props} theme={currentTheme} />
                )}
                calendarClassName={
                  currentTheme.name === "dark"
                    ? "dark-calendar"
                    : "light-calendar"
                }
                popperClassName={
                  currentTheme.name === "dark"
                    ? "dark-theme-datepicker"
                    : "light-theme-datepicker"
                }
                wrapperClassName="w-full"
                customInput={
                  <div className="relative w-full">
                    <input
                      type="text"
                      className={`${inputClass} pl-10 cursor-pointer`}
                      value={
                        dueDate ? format(new Date(dueDate), "dd-MM-yyyy") : ""
                      } // Show selected date
                      placeholder="dd-mm-yyyy"
                      readOnly
                      onClick={() => setIsDatePickerOpen(!isDatePickerOpen)} // Toggle calendar on input click
                      style={{
                        fontFamily: "'Titillium Web', sans-serif",
                        color:
                          currentTheme.name === "dark" ? "white" : "black",
                        backgroundColor:
                          currentTheme.name === "dark"
                            ? "#374151"
                            : "#ffffff",
                      }}
                    />
                    <div
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent input's onClick from firing
                        setIsDatePickerOpen(!isDatePickerOpen); // Toggle calendar on icon click
                      }}
                    >
                      <Calendar
                        size={18}
                        color={
                          currentTheme.name === "dark" ? "#9CA3AF" : "#6B7280"
                        }
                      />
                    </div>
                  </div>
                }
              />
              {dueDate && (
                <div
                  className={`mt-2 ${currentTheme.text} text-sm`}
                  style={{
                    fontFamily: "'Titillium Web', sans-serif",
                  }}
                >
                  Selected: {format(new Date(dueDate), "dd-MMM-yy")}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Assign Task Button with UserCheck icon */}
      <button
        type="submit"
        disabled={authLoading || isRotating}
        className={`${buttonClass} mb-10`}
      >
        <UserCheck size={20} className="mr-2" color={iconColor} />
        {authLoading || isRotating
          ? "Assigning the task - please wait..."
          : isTaskAssigned
          ? "Task assigned"
          : "Assign Task"}
      </button>
    </form>
  </div>
);
};

export default NewTask;