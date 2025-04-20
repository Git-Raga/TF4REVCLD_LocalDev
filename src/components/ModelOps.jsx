import React from "react";
import { X, Trash2, Check, Calendar } from "lucide-react";
import { format } from "date-fns";

// Delete Confirmation Modal Component
export const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  taskName,
  isDeleting,
  currentTheme,
}) => {
  if (!isOpen) return null;

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
          } rounded-lg p-6 max-w-md w-full shadow-2xl pointer-events-auto opacity-95`}
        >
          <div className="flex flex-col items-center text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-500 mb-4"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h3
              className={`${currentTheme.text} text-xl font-semibold mb-2`}
            >
              Confirm Deletion
            </h3>
            <p className={`${currentTheme.text} mb-6`}>
              Are you sure you want to delete "
              <span className="font-semibold">
                {taskName}
              </span>
              "?
              <br />
              This action cannot be undone.
            </p>

            <div className="flex space-x-4">
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded ${
                  currentTheme.name === "dark"
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                } ${currentTheme.text}`}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center ${
                  isDeleting ? "opacity-70" : ""
                }`}
              >
                {isDeleting ? (
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
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} className="mr-2" />
                    Yes, Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Comments Modal Component
export const CommentsModal = ({
  isOpen,
  onClose,
  title,
  comments,
  currentTheme,
}) => {
  if (!isOpen) return null;

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
          } rounded-lg p-6 max-w-lg w-full max-h-screen overflow-y-auto shadow-2xl pointer-events-auto opacity-95`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className={`${currentTheme.text} text-xl font-semibold`}>
              Notes for the Task: {title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          <div
            className={`${currentTheme.text} p-4 rounded ${
              currentTheme.name === "dark" ? "bg-gray-700" : "bg-gray-100"
            } min-h-[100px]`}
          >
            {comments || "No comments available"}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded ${
                currentTheme.name === "dark"
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-200 hover:bg-gray-300"
              } ${currentTheme.text}`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Edit Task Modal Component
export const EditTaskModal = ({
  isOpen,
  onClose,
  onSave,
  editTask,
  setEditTask,
  isSaving,
  currentTheme,
}) => {
  if (!isOpen) return null;

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
              Edit Task
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
                value={editTask.taskname}
                onChange={(e) =>
                  setEditTask({ ...editTask, taskname: e.target.value })
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
              <div className="flex space-x-4">
                <label
                  className={`flex items-center cursor-pointer ${currentTheme.text}`}
                >
                  <input
                    type="radio"
                    name="urgency"
                    value="Normal"
                    checked={editTask.urgency === "Normal"}
                    onChange={() =>
                      setEditTask({ ...editTask, urgency: "Normal" })
                    }
                    className="mr-2"
                  />
                  Normal
                </label>
                <label
                  className={`flex items-center cursor-pointer ${currentTheme.text}`}
                >
                  <input
                    type="radio"
                    name="urgency"
                    value="Critical"
                    checked={editTask.urgency === "Critical"}
                    onChange={() =>
                      setEditTask({ ...editTask, urgency: "Critical" })
                    }
                    className="mr-2"
                  />
                  Critical
                </label>
              </div>
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
                value={editTask.taskduedate}
                onChange={(e) =>
                  setEditTask({ ...editTask, taskduedate: e.target.value })
                }
                className={`w-full p-2 rounded border ${
                  currentTheme.name === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-black"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {editTask.taskduedate && (
                <div className="mt-2 text-sm flex items-center">
                  <Calendar size={16} className="mr-2 text-blue-500" />
                  <span className={currentTheme.text}>
                    {format(new Date(editTask.taskduedate), "MMMM d, yyyy")}
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
                value={editTask.comments}
                onChange={(e) =>
                  setEditTask({ ...editTask, comments: e.target.value })
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
              onClick={onSave}
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
                  Saving...
                </>
              ) : (
                <>
                  <Check size={18} className="mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};