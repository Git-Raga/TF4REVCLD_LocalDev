import React from 'react';
import { X } from 'lucide-react';

const CommentsModal = ({ isOpen, onClose, title, comments, currentTheme }) => {
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

export default CommentsModal;