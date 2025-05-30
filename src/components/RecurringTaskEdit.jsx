import { X, Check, User } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";

// Edit Task Modal Component for Recurring Tasks
export const RecurringTaskEditModal = ({
  isOpen,
  onClose,
  onSave,
  editTask,
  setEditTask,
  isSaving,
  currentTheme,
}) => {
  // Use refs to track form state
  const formRef = useRef(null);
  const selectRef = useRef(null);
  
  // Local state to maintain dropdown value independently from parent state
  const [localRecurringDay, setLocalRecurringDay] = useState("");
  
  // Case owner options based on your user details
  const caseOwners = [
    { initials: "SS", name: "Sushanth", id: "sushanth" },
    { initials: "WAS", name: "Wahaj", id: "wahaj" },
    { initials: "SPK", name: "Sashi", id: "sashi" },
    { initials: "RS", name: "Rithik", id: "rithik" },
    { initials: "PMR", name: "Prasanna", id: "prasanna" },
    { initials: "MMR", name: "Matta", id: "matta" },
    { initials: "HD", name: "Harshdeep", id: "harshdeep" },
    { initials: "GG", name: "Geethika", id: "geethika" },
    { initials: "FH", name: "Farbeena", id: "farbeena" },
    { initials: "MR", name: "Manu", id: "manu" },
    { initials: "CR", name: "Chaten", id: "chaten" },
    { initials: "AC", name: "Astha", id: "astha" },
    { initials: "ARS", name: "Angad", id: "angad" },
    { initials: "PD", name: "Pushkar", id: "pushkar" },
    { initials: "NS", name: "Nishanth", id: "nishanth" },
    { initials: "RGV", name: "Raghav", id: "raghav" }
  ];
  
  // Update local state when editTask changes
  useEffect(() => {
    if (editTask && editTask.recurringday) {
      setLocalRecurringDay(editTask.recurringday.toLowerCase());
    }
  }, [editTask]);
  
  // Handle direct save from dropdown change
  const handleWeekdayChange = (e) => {
    const newDay = e.target.value;
    setLocalRecurringDay(newDay);
    // Update parent state with new value
    setEditTask(prevTask => ({ 
      ...prevTask, 
      recurringday: newDay 
    }));
  };

  // Handle case owner change
  const handleOwnerChange = (e) => {
    const selectedInitials = e.target.value;
    const selectedOwner = caseOwners.find(owner => owner.initials === selectedInitials);
    
    setEditTask(prevTask => ({
      ...prevTask,
      taskownerinitial: selectedOwner?.initials || "",
      taskownername: selectedOwner?.name || ""
    }));
  };
  
  // FIXED: Improved form submission handler
  const handleSave = (e) => {
    // Prevent any default form behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Ensure all current values are captured
    const taskToSave = {
      ...editTask,
      recurringday: localRecurringDay || editTask.recurringday,
      // Ensure we have all required fields
      taskname: editTask.taskname || "",
      comments: editTask.comments || "",
      recurringfreq: editTask.recurringfreq || "",
      taskownerinitial: editTask.taskownerinitial || "",
      taskownername: editTask.taskownername || "",
    };
    
    console.log("Saving task with data:", taskToSave); // Debug log
    
    // Call the onSave function with the complete task object
    onSave(taskToSave);
  };
  
  // FIXED: Handle form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSave();
  };
  
  if (!isOpen) return null;

  // Initialize recurringfreq and recurringday if they don't exist
  const taskToEdit = {
    ...editTask,
    recurringfreq: editTask.recurringfreq || "",
    recurringday: editTask.recurringday || "",
    taskname: editTask.taskname || "",
    comments: editTask.comments || "",
    taskownerinitial: editTask.taskownerinitial || "",
    taskownername: editTask.taskownername || "",
  };

  // Generate options for monthly recurring (1-31)
  const monthlyOptions = [];
  for (let i = 1; i <= 31; i++) {
    monthlyOptions.push(
      <option key={i} value={i.toString()}>
        {i}
      </option>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-30 pointer-events-none"
        style={{ backdropFilter: "blur(2px)" }}
      ></div>
      <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
        <div
          className={`${
            currentTheme.name === "dark" ? "bg-gray-800" : "bg-white"
          } rounded-lg p-6 max-w-xl w-full max-h-screen overflow-y-auto shadow-2xl pointer-events-auto opacity-95`}
        >
          {/* FIXED: Proper form handling */}
          <form ref={formRef} onSubmit={handleFormSubmit}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`${currentTheme.text} text-xl font-semibold`}>
                Edit Recurring Task
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Task Name */}
              <div>
                <label
                  className={`block ${currentTheme.text} font-medium mb-2`}
                >
                  Task Name
                </label>
                <input
                  type="text"
                  value={taskToEdit.taskname || ""}
                  onChange={(e) =>
                    setEditTask(prevTask => ({ 
                      ...prevTask, 
                      taskname: e.target.value 
                    }))
                  }
                  className={`w-full p-2 rounded border ${
                    currentTheme.name === "dark"
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-black"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter task name"
                  required
                />
              </div>

              {/* Recurring Frequency - Read Only with distinct styling */}
              <div>
                <label
                  className={`block ${currentTheme.text} font-medium mb-2`}
                >
                  Recurring Frequency
                </label>
                <input
                  type="text"
                  value={taskToEdit.recurringfreq || ""}
                  readOnly
                  className={`w-full p-2 rounded border ${
                    currentTheme.name === "dark"
                      ? "bg-gray-600 border-gray-500 text-gray-300"
                      : "bg-gray-100 border-gray-300 text-gray-500"
                  } cursor-not-allowed opacity-80`}
                  style={{ 
                    backgroundColor: currentTheme.name === "dark" ? "#374151" : "#f3f4f6" 
                  }}
                />
              </div>

              {/* Weekly Recurring Day Selection - FIXED state management */}
              {taskToEdit.recurringfreq === "weekly" && (
                <div>
                  <label
                    className={`block ${currentTheme.text} font-medium mb-2`}
                  >
                    Edit Recurring Weekday
                  </label>
                  <select
                    ref={selectRef}
                    value={localRecurringDay}
                    onChange={handleWeekdayChange}
                    className={`w-full p-2 rounded border ${
                      currentTheme.name === "dark"
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-black"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="" disabled>Select a day</option>
                    <option value="sunday">Sunday</option>
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                    <option value="saturday">Saturday</option>
                  </select>
                </div>
              )}

              {/* Monthly Recurring Date Selection - FIXED state management */}
              {taskToEdit.recurringfreq === "monthly" && (
                <div>
                  <label
                    className={`block ${currentTheme.text} font-medium mb-2`}
                  >
                    Edit Monthly Recurring Date
                  </label>
                  <select
                    ref={selectRef}
                    value={localRecurringDay}
                    onChange={(e) => {
                      const newDay = e.target.value;
                      setLocalRecurringDay(newDay);
                      setEditTask(prevTask => ({ 
                        ...prevTask, 
                        recurringday: newDay 
                      }));
                    }}
                    className={`w-full p-2 rounded border ${
                      currentTheme.name === "dark"
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-black"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="" disabled>Select a date</option>
                    {monthlyOptions}
                  </select>
                </div>
              )}

              {/* Case Owner Dropdown */}
              <div>
                <label
                  className={`block ${currentTheme.text} font-medium mb-2`}
                >
                  Case Owner
                </label>
                <select
                  value={taskToEdit.taskownerinitial}
                  onChange={handleOwnerChange}
                  className={`w-full p-2 rounded border ${
                    currentTheme.name === "dark"
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-black"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select Case Owner</option>
                  {caseOwners.map((owner) => (
                    <option key={owner.id} value={owner.initials}>
                      {owner.initials} - {owner.name}
                    </option>
                  ))}
                </select>
                
                {/* Show selected owner preview */}
                {taskToEdit.taskownerinitial && (
                  <div className="mt-2 text-sm flex items-center">
                    <User size={16} className="mr-2 text-blue-500" />
                    <span className={currentTheme.text}>
                      Assigned to: <strong>{taskToEdit.taskownerinitial} - {taskToEdit.taskownername}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Comments */}
              <div>
                <label
                  className={`block ${currentTheme.text} font-medium mb-2`}
                >
                  Comments
                </label>
                <textarea
                  value={taskToEdit.comments || ""}
                  onChange={(e) =>
                    setEditTask(prevTask => ({ 
                      ...prevTask, 
                      comments: e.target.value 
                    }))
                  }
                  rows={4}
                  className={`w-full p-2 rounded border ${
                    currentTheme.name === "dark"
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-black"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter any comments or notes about this task"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded ${
                  currentTheme.name === "dark"
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                } ${currentTheme.text}`}
                disabled={isSaving}
              >
                Cancel
              </button>
              {/* FIXED: Submit button that works on first click */}
              <button
                type="submit"
                disabled={isSaving}
                className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center ${
                  isSaving ? "opacity-70" : ""
                }`}
              >
                {isSaving ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check size={18} className="mr-2" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};