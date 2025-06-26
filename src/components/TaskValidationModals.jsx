import React from "react";
import { X } from "lucide-react";

// Comments Modal Component
export const CommentsModal = ({ 
  showCommentsModal, 
  selectedTask, 
  currentTheme, 
  setShowCommentsModal 
}) => {
  if (!showCommentsModal || !selectedTask) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50" 
      style={{backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0, 0, 0, 0.3)'}}
    >
      <div className={`${currentTheme.cardBg || (currentTheme.name === "dark" ? "bg-gray-800" : "bg-gray-200")} rounded-lg p-6 max-w-lg w-full mx-4`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-bold ${currentTheme.text}`}>Task Notes</h3>
          <button
            onClick={() => setShowCommentsModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-4">
          <p className={`text-sm font-medium ${currentTheme.text} mb-2`}>
            Task: {selectedTask.taskname}
          </p>
        </div>
        
        <div 
          className="bg-gray-100 p-4 rounded-lg" 
          style={{backgroundColor: currentTheme.name === "dark" ? "#374151" : "#f3f4f6"}}
        >
          <p 
            className="text-sm leading-relaxed whitespace-pre-wrap" 
            style={{color: currentTheme.name === "dark" ? "#ffffff" : "#000000"}}
          >
            {selectedTask.comments}
          </p>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={() => setShowCommentsModal(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Details Modal Component  
export const DetailsModal = ({ 
  showDetailsModal, 
  selectedTask, 
  currentTheme, 
  setShowDetailsModal 
}) => {
  if (!showDetailsModal || !selectedTask) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${currentTheme.cardBg || (currentTheme.name === "dark" ? "bg-gray-800" : "bg-white")} rounded-lg p-6 max-w-md w-full mx-4`}>
        <h3 className={`text-lg font-bold ${currentTheme.text} mb-4`}>Task Details</h3>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-500">Type:</label>
            <p className={currentTheme.text}>
              {selectedTask.recurringtask ? 
                (selectedTask.recurringfreq === 'weekly' ? 'Weekly Recurring' :
                 selectedTask.recurringfreq === 'monthly' ? 'Monthly Recurring' :
                 'Recurring Task') : 'One Time Task'}
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Urgency:</label>
            <p className={currentTheme.text}>{selectedTask.urgency || 'Normal'}</p>
          </div>
          
          {selectedTask.taskownername && (
            <div>
              <label className="text-sm font-medium text-gray-500">Owner:</label>
              <p className={currentTheme.text}>{selectedTask.taskownername}</p>
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium text-gray-500">Current Status:</label>
            <div className="mt-1">
              <div className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold inline-block text-center">
                Status
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setShowDetailsModal(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};