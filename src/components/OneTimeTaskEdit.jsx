import { X, Check, Calendar, User } from "lucide-react";
import React, { useState, useEffect } from "react";

// Edit Task Modal Component for One-Time Tasks
export const OneTimeTaskEditModal = ({
  isOpen,
  onClose,
  onSave,
  editTask,
  setEditTask,
  isSaving,
  currentTheme,
}) => {
  // UPDATED: Case owner options with email addresses from the database table
  const caseOwners = [
    { initials: "SS", name: "Sushanth", id: "sushanth", email: "sushant.singh@salesforce.com" },
    { initials: "WAS", name: "Wahaj", id: "wahaj", email: "wshaik@salesforce.com" },
    { initials: "SPK", name: "Sashi", id: "sashi", email: "skotni@salesforce.com" },
    { initials: "RS", name: "Rithik", id: "rithik", email: "ritik.srivastav@salesforce.com" },
    { initials: "PMR", name: "Prasanna", id: "prasanna", email: "prasannamadhava.rao@salesforce.com" },
    { initials: "MMR", name: "Matta", id: "matta", email: "matta.reddy@salesforce.com" },
    { initials: "HD", name: "Harshdeep", id: "harshdeep", email: "hdeep@salesforce.com" },
    { initials: "GG", name: "Geethika", id: "geethika", email: "ggandrala@salesforce.com" },
    { initials: "FH", name: "Farbeena", id: "farbeena", email: "farbeena.hussain@salesforce.com" },
    { initials: "MR", name: "Manu", id: "manu", email: "mmanuramamurthy@salesforce.com" },
    { initials: "CR", name: "Chaten", id: "chaten", email: "craghav@salesforce.com" },
    { initials: "AC", name: "Astha", id: "astha", email: "astha.chaudhary@salesforce.com" },
    { initials: "ARS", name: "Angad", id: "angad", email: "angad.rajpal@salesforce.com" },
    { initials: "RS", name: "Rashi", id: "rashi", email: "rsaraswat@salesforce.com" },
    { initials: "PD", name: "Pushkar", id: "pushkar", email: "pushkar.dwivedi@salesforce.com" },
    { initials: "NS", name: "Nishanth", id: "nishanth", email: "nsagar@salesforce.com" },
    { initials: "RGV", name: "Raghav", id: "raghav", email: "rkrishnamurthy1@salesforce.com" }
  ];

  if (!isOpen) return null;

  const taskToEdit = {
    ...editTask,
    taskname: editTask.taskname || "",
    urgency: editTask.urgency || "Normal",
    taskduedate: editTask.taskduedate || "",
    comments: editTask.comments || "",
    taskownerinitial: editTask.taskownerinitial || "",
    taskownername: editTask.taskownername || "",
    taskowneremail: editTask.taskowneremail || "", // Added email field
  };

  const handleSave = () => {
    onSave(taskToEdit);
  };

  // UPDATED: Handle owner change to update initials, name, and email
  const handleOwnerChange = (e) => {
    const selectedInitials = e.target.value;
    const selectedOwner = caseOwners.find(owner => owner.initials === selectedInitials);
    
    setEditTask({
      ...taskToEdit,
      taskownerinitial: selectedOwner?.initials || "",
      taskownername: selectedOwner?.name || "",
      taskowneremail: selectedOwner?.email || "" // UPDATED: Also update email
    });
  };

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
          <div className="flex justify-between items-center mb-4">
            <h3 className={`${currentTheme.text} text-xl font-semibold`}>
              Edit One-Time Task
            </h3>
            <button
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
                value={taskToEdit.taskname}
                onChange={(e) =>
                  setEditTask({ ...taskToEdit, taskname: e.target.value })
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

            {/* Urgency */}
            <div>
              <label
                className={`block ${currentTheme.text} font-medium mb-2`}
              >
                Urgency
              </label>
              <select
                value={taskToEdit.urgency}
                onChange={(e) =>
                  setEditTask({ ...taskToEdit, urgency: e.target.value })
                }
                className={`w-full p-2 rounded border ${
                  currentTheme.name === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-black"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="Normal">Normal</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label
                className={`block ${currentTheme.text} font-medium mb-2`}
              >
                Due Date
              </label>
              <input
                type="date"
                value={taskToEdit.taskduedate}
                onChange={(e) =>
                  setEditTask({ ...taskToEdit, taskduedate: e.target.value })
                }
                className={`w-full p-2 rounded border ${
                  currentTheme.name === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-black"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {taskToEdit.taskduedate && (
                <div className="mt-2 text-sm flex items-center">
                  <Calendar size={16} className="mr-2 text-blue-500" />
                  <span className={currentTheme.text}>
                    {new Date(taskToEdit.taskduedate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric', 
                      year: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>

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
              
              {/* UPDATED: Show selected owner preview with email */}
              {taskToEdit.taskownerinitial && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center text-sm">
                    <User size={16} className="mr-2 text-blue-500" />
                    <span className={currentTheme.text}>
                      <strong>Assigned to:</strong>
                    </span>
                  </div>
                  <div className="mt-1 ml-6 text-sm space-y-1">
                    <div className={currentTheme.text}>
                      <strong>Name:</strong> {taskToEdit.taskownerinitial} - {taskToEdit.taskownername}
                    </div>
                    <div className={`${currentTheme.text} text-xs opacity-80`}>
                      <strong>Email:</strong> {taskToEdit.taskowneremail}
                    </div>
                  </div>
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
                  setEditTask({ ...taskToEdit, comments: e.target.value })
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

            {/* UPDATED: Debug info section (can be removed in production) */}
            {process.env.NODE_ENV === 'development' && taskToEdit.taskownerinitial && (
              <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs">
                <div className="font-semibold mb-2 text-gray-700 dark:text-gray-300">Debug Info:</div>
                <div className="space-y-1 text-gray-600 dark:text-gray-400">
                  <div><strong>Initials:</strong> {taskToEdit.taskownerinitial}</div>
                  <div><strong>Name:</strong> {taskToEdit.taskownername}</div>
                  <div><strong>Email:</strong> {taskToEdit.taskowneremail}</div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
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
            <button
              type="button"
              onClick={handleSave}
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
        </div>
      </div>
    </>
  );
};