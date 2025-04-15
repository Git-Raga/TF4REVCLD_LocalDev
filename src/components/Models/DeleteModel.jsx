import React from 'react';
import { AlertCircle, Trash2 } from 'lucide-react';

const DeleteModal = ({ isOpen, onClose, onDelete, isDeleting, taskName, currentTheme }) => {
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
            <AlertCircle 
              size={48} 
              className="text-red-500 mb-4" 
            />
            <h3 className={`${currentTheme.text} text-xl font-semibold mb-2`}>
              Confirm Deletion
            </h3>
            <p className={`${currentTheme.text} mb-6`}>
              Are you sure you want to delete "<span className="font-semibold">{taskName}</span>"?
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
                onClick={onDelete}
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

export default DeleteModal;