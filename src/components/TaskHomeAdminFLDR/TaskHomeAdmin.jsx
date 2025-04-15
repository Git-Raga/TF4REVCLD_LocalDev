import React, { useState, useEffect } from "react";
// These imports will be commented out until you set up Appwrite
// import { databases, DATABASE_ID, COLLECTIONS } from "../../appwrite/config";
// import { Query } from "appwrite";
import { useTheme } from "../../ColorChange";

// Import custom hooks - we'll need to create these
import { useSidebarToggle } from "./hooks/useSidebarToggle";
import { useTaskActions } from "./hooks/useTaskActions";
import { useSortableTasks } from "./hooks/useSortableTasks";

// Import sub-components - we'll need to create theseç
import SidebarToggle from "./SidebarToggle";
import TaskTable from "./TaskTable";
import TaskFilters from "./TaskFilters";
import TaskStats from "./TaskStats";
// These modals will be commented out until created
// import DeleteModal from "./modals/DeleteModal";
// import EditModal from "./modals/EditModal"; 
// import CommentsModal from "./modals/CommentsModal";

const TaskHomeAdmin = () => {
  const { currentTheme } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Task filtering state
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  
  // Modal states
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [selectedTaskComments, setSelectedTaskComments] = useState("");
  const [commentModalTitle, setCommentModalTitle] = useState("");
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTask, setEditTask] = useState({
    $id: "",
    taskname: "",
    urgency: "Normal",
    taskduedate: "",
    comments: "",
  });
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTask, setDeleteTask] = useState({ $id: "", taskname: "" });
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Custom hooks - mocked for now
  const { sidebarCollapsed, toggleSidebar } = useSidebarToggle ? useSidebarToggle() : { sidebarCollapsed: false, toggleSidebar: () => {} };
  
  // Temporary mock data and functions until the full implementation is ready
  const mockTasks = [
    {
      $id: "1",
      taskname: "Design new landing page",
      urgency: "High",
      taskduedate: "2025-05-01",
      comments: "Need to incorporate the new branding",
      taskcompleted: false,
      assignee: "John Doe"
    },
    {
      $id: "2",
      taskname: "Implement user authentication",
      urgency: "Critical",
      taskduedate: "2025-04-20",
      comments: "Use Firebase for quicker implementation",
      taskcompleted: true,
      assignee: "Jane Smith"
    },
    {
      $id: "3",
      taskname: "Fix navigation bug",
      urgency: "Medium",
      taskduedate: "2025-04-25",
      comments: "Bug occurs on mobile devices",
      taskcompleted: false,
      assignee: "Alex Johnson"
    }
  ];
  
  // Mocked task actions
  const { 
    animatingTaskId,
    toggleTaskCompletion,
    handleDeleteTask,
    saveEditedTask,
    isSaving
  } = useTaskActions ? useTaskActions(tasks, setTasks, deleteTask, editTask, setIsEditModalOpen, setIsDeleteModalOpen, setIsDeleting) : 
  {
    animatingTaskId: null,
    toggleTaskCompletion: () => {},
    handleDeleteTask: () => {},
    saveEditedTask: () => {},
    isSaving: false
  };
  
  // Mocked sortable tasks hook
  const { 
    sortedAndFilteredTasks,
    sortState, 
    setSortState, 
    handleDueDateClick 
  } = useSortableTasks ? useSortableTasks(tasks, showActiveOnly) : 
  {
    sortedAndFilteredTasks: tasks,
    sortState: {column: null, direction: 'asc'},
    setSortState: () => {},
    handleDueDateClick: () => {}
  };
  
  // Fetch tasks (mock implementation)
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Use mock data for now
        setTasks(mockTasks);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Failed to load tasks. Please try again.");
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Modal handling functions
  const openCommentsModal = (task) => {
    setSelectedTaskComments(task.comments || "No comments available");
    setCommentModalTitle(task.taskname);
    setIsCommentsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditTask({
      $id: task.$id,
      taskname: task.taskname,
      urgency: task.urgency || "Normal",
      taskduedate: task.taskduedate
        ? new Date(task.taskduedate).toISOString().split('T')[0]
        : "",
      comments: task.comments || "",
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (task) => {
    setDeleteTask({
      $id: task.$id,
      taskname: task.taskname
    });
    setIsDeleteModalOpen(true);
  };

  // Task statistics
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter((task) => task.taskcompleted).length,
    open: tasks.filter((task) => !task.taskcompleted).length,
    overdue: tasks.filter((task) => {
      const dueDate = task.taskduedate ? new Date(task.taskduedate) : null;
      return (
        !task.taskcompleted &&
        dueDate &&
        new Date() > dueDate &&
        dueDate.toDateString() !== new Date().toDateString()
      );
    }).length,
  };

  if (loading) {
    return (
      <div className={`text-center py-10 ${currentTheme.text}`}>
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent"></div>
        <p className="mt-2">Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  // Temporary simplified UI until all components are created
  return (
    <div className="p-6">
      <h2 className={`text-2xl font-bold mb-4 ${currentTheme.text}`}>Admin Task Dashboard</h2>
      <p className={`mb-6 ${currentTheme.text}`}>This is a simplified version of the TaskHomeAdmin component. The full implementation with all subcomponents is in progress.</p>
      
      <div className={`p-4 rounded-lg mb-6 ${currentTheme.name === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <h3 className={`text-lg font-semibold mb-2 ${currentTheme.text}`}>Task Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-3 rounded ${currentTheme.name === 'dark' ? 'bg-gray-700' : 'bg-white'} ${currentTheme.text}`}>
            <div className="text-sm opacity-75">Total Tasks</div>
            <div className="text-2xl font-bold">{taskStats.total}</div>
          </div>
          <div className={`p-3 rounded ${currentTheme.name === 'dark' ? 'bg-gray-700' : 'bg-white'} ${currentTheme.text}`}>
            <div className="text-sm opacity-75">Completed</div>
            <div className="text-2xl font-bold">{taskStats.completed}</div>
          </div>
          <div className={`p-3 rounded ${currentTheme.name === 'dark' ? 'bg-gray-700' : 'bg-white'} ${currentTheme.text}`}>
            <div className="text-sm opacity-75">Open</div>
            <div className="text-2xl font-bold">{taskStats.open}</div>
          </div>
          <div className={`p-3 rounded ${currentTheme.name === 'dark' ? 'bg-gray-700' : 'bg-white'} ${currentTheme.text}`}>
            <div className="text-sm opacity-75">Overdue</div>
            <div className="text-2xl font-bold">{taskStats.overdue}</div>
          </div>
        </div>
      </div>
      
      <div className={`overflow-x-auto rounded-lg ${currentTheme.name === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${currentTheme.name === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={currentTheme.name === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${currentTheme.text}`}>Task</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${currentTheme.text}`}>Urgency</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${currentTheme.text}`}>Due Date</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${currentTheme.text}`}>Status</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${currentTheme.text}`}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <tr key={task.$id} className={task.taskcompleted ? 'opacity-60' : ''}>
                <td className={`px-6 py-4 whitespace-nowrap ${currentTheme.text}`}>{task.taskname}</td>
                <td className={`px-6 py-4 whitespace-nowrap ${currentTheme.text}`}>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${task.urgency === 'Critical' ? 'bg-red-100 text-red-800' : 
                      task.urgency === 'High' ? 'bg-orange-100 text-orange-800' : 
                      task.urgency === 'Medium' ? 'bg-blue-100 text-blue-800' : 
                      'bg-green-100 text-green-800'}`}>
                    {task.urgency}
                  </span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap ${currentTheme.text}`}>
                  {task.taskduedate ? new Date(task.taskduedate).toLocaleDateString() : 'No date'}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap ${currentTheme.text}`}>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${task.taskcompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {task.taskcompleted ? 'Completed' : 'Active'}
                  </span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium`}>
                  <button 
                    onClick={() => toggleTaskCompletion(task)} 
                    className={`mr-2 ${currentTheme.name === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900'}`}
                  >
                    {task.taskcompleted ? 'Reopen' : 'Complete'}
                  </button>
                  <button 
                    onClick={() => openEditModal(task)} 
                    className={`mr-2 ${currentTheme.name === 'dark' ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-900'}`}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => openDeleteModal(task)} 
                    className={`${currentTheme.name === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'}`}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6">
        <p className={`text-sm ${currentTheme.text}`}>
          Note: This is a placeholder component. To implement the full TaskHomeAdmin functionality, you'll need to create all the sub-components and hooks referenced in this file.
        </p>
      </div>
    </div>
  );
};

export default TaskHomeAdmin;