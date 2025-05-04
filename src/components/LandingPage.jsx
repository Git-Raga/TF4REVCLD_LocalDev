import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from './ColorChange';
import NewTask from './NewTask'
import TaskHomeUser from './TaskHomeUser';
import TaskHomeAdmin from './TaskHomeAdmin';
import { 
  Home, 
  Grid, 
  FolderOpen, 
  PlusSquare, 
  Users, 
  Layout, 
  BarChart2, 
  Lock, 
  Paintbrush, 
  LogOut, 
  Star, 
  Import,
  Wrench,
  CirclePlus, 
  Workflow,
  ChevronLeft,
  ChevronRight,
  CalendarSync,
  Menu,
  CheckCheck 
} from 'lucide-react';
import FontConfig from './FontConfig';
import { useNavigate } from 'react-router-dom';
import RecurringTask from './RecurringTask';

// Custom hook for connection setup
const useConnectionSetup = () => {
  useEffect(() => {
    // Setup connection listeners here
    const setupListeners = () => {
      // Add your connection setup logic here
    };

    setupListeners();

    // Cleanup function
    return () => {
      // Add any cleanup logic here
    };
  }, []);
};

// Array of Tailwind background color classes
const bgColors = [
  'bg-blue-800',
  'bg-green-800',
  'bg-red-800',
  'bg-yellow-800',
  'bg-purple-800',
  'bg-pink-800',
  'bg-indigo-800',
  'bg-teal-800'
];

// Array of Tailwind text color classes
const textColors = [
  'text-white',
  'text-gray-100'
];

// Function to get a fixed color combination
const getFixedColors = () => {
  const bgColorIndex = Math.floor(Math.random() * bgColors.length);
  const textColorIndex = Math.floor(Math.random() * textColors.length);
  return {
    backgroundColor: bgColors[bgColorIndex],
    textColor: textColors[textColorIndex]
  };
};

// Custom ThemeToggle Component
const ThemeToggle = () => {
  const { currentTheme, toggleTheme } = useTheme();
  const isDarkMode = currentTheme.name === 'dark';
  
  const handleToggleClick = () => {
    toggleTheme();
  };

  return (
    <div className="flex justify-start mb-4">
      <button
        onClick={handleToggleClick}
        className={`
          relative w-10 h-5 rounded-full p-1 transition-colors duration-200
          ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}
          cursor-pointer
        `}
        aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      >
        <span 
         className={`
          absolute left-1 top-1 w-3 h-3 rounded-full shadow-md
          transform transition-transform duration-200 ease-in-out
          ${isDarkMode ? 'translate-x-4 bg-white' : 'translate-x-0 bg-black'}
          pointer-events-none
        `}
        >
          {/* Subtle bubble effects inside the circle */}
          <span className={`
            absolute top-1 left-1 w-1 h-1 rounded-full opacity-70
            ${isDarkMode ? 'bg-gray-200' : 'bg-gray-700'}
          `}></span>
        </span>
      </button>
    </div>
  );
};

// User Avatar Component
const UserAvatar = ({ name, initials }) => {
  const [colorClasses, setColorClasses] = useState({ backgroundColor: '', textColor: '' });

  useEffect(() => {
    setColorClasses(getFixedColors());
  }, []);

  return (
    <div 
      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${colorClasses.backgroundColor} ${colorClasses.textColor}`}
    >
      <span className="text-sm">{initials || 'UN'}</span>
    </div>
  );
};

// NavItem component
const NavItem = ({ icon, text, active, onClick, theme, isCollapsed }) => {
  // Get the color based on active state
  const textColorClass = active ? theme.activeNavItemText : theme.navItemText;
  
  return (
    <div 
      className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 rounded-lg cursor-pointer ${
        active ? theme.activeNavItem : theme.navItem
      }`}
      onClick={onClick}
      title={isCollapsed ? text : ''}
    >
      {/* Clone the icon element and pass the appropriate color */}
      {React.cloneElement(icon, { 
        className: textColorClass,
        color: active ? (theme.name === 'dark' ? 'black' : 'white') : (theme.name === 'dark' ? '#9CA3AF' : '#4B5563')
      })}
      {!isCollapsed && <span className={textColorClass}>{text}</span>}
    </div>
  );
};

// SubNavItem component
const SubNavItem = ({ text, theme, onClick, isCollapsed }) => (
  <div 
    className={`flex  ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 ${isCollapsed ? 'pl-3' : 'pl-11'} rounded-lg cursor-pointer ${theme.navItem}`}
    onClick={onClick}
    title={isCollapsed ? text : ''}
  >
    {!isCollapsed && <span className={`${theme.navItemText} text-sm`}>{text}</span>}
    {isCollapsed && <span className={`${theme.navItemText} text-sm`}>🔑</span>}
  </div>
);

// Dynamic content components for each section
const HomeContent = ({ theme }) => (
  <div className={`p-6 ${theme.text}`}>
    <h2 className="text-2xl font-bold mb-4">Home Dashboard</h2>
    <p className="mb-4">Welcome to TaskForce! Your personal task management solution.</p>
    <div className={`p-4 rounded-lg ${theme.cardBg}`}>
      <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
      <ul className="list-disc pl-5">
        <li>Task "Project Review" was completed</li>
        <li>New task "Client Meeting" was added</li>
        <li>Task "Documentation Update" deadline was extended</li>
      </ul>
    </div>
  </div>
);

const TaskFlowContent = ({ theme }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  return (
    <div className="p-4 flex justify-center">
      <div className="border-2 rounded-lg overflow-hidden">
        <img 
          src="/src/assets/Taskflow.png" 
          alt="TaskForce Workflow Diagram" 
          className="max-w-full h-auto" 
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            console.error('Image load error');
          }}
        />
        
        {!imageLoaded && (
          <div className="p-8 text-center">
            <p>Loading workflow diagram...</p>
          </div>
        )}
      </div>
    </div>
  );
};

const DashboardContent = ({ theme }) => (
  <div className={`p-6 ${theme.text}`}>
    <h2 className="text-2xl font-bold mb-4">Task Dashboard</h2>
    <p className="mb-4">Overview of your current tasks and progress.</p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className={`p-4 rounded-lg ${theme.cardBg}`}>
        <h3 className="text-lg font-semibold mb-2">Total Tasks</h3>
        <p className="text-3xl font-bold">24</p>
      </div>
      <div className={`p-4 rounded-lg ${theme.cardBg}`}>
        <h3 className="text-lg font-semibold mb-2">In Progress</h3>
        <p className="text-3xl font-bold">8</p>
      </div>
      <div className={`p-4 rounded-lg ${theme.cardBg}`}>
        <h3 className="text-lg font-semibold mb-2">Completed</h3>
        <p className="text-3xl font-bold">16</p>
      </div>
    </div>
  </div>
);

const PerfectContent = ({ theme }) => (
  <div className={`p-6 ${theme.text}`}>
    <h2 className="text-2xl font-bold mb-4">Perfect Tasks ⭐</h2>
    <p className="mb-4">These tasks were completed with perfect ratings.</p>
    <div className={`p-4 rounded-lg ${theme.cardBg}`}>
      <ul className="divide-y divide-gray-200">
        <li className="py-3">Project Proposal for Client A</li>
        <li className="py-3">UI Design Overhaul</li>
        <li className="py-3">Database Optimization</li>
        <li className="py-3">Documentation Update</li>
      </ul>
    </div>
  </div>
);

const SettingsContent = ({ theme }) => (
  <div className={`p-6 ${theme.text}`}>
    <h2 className="text-2xl font-bold mb-4">Settings</h2>
    <p className="mb-4">Manage your account settings and preferences.</p>
    <div className={`p-4 rounded-lg ${theme.cardBg}`}>
      <h3 className="text-lg font-semibold mb-2">Account Settings</h3>
      <div className="mb-4">
        <label className="block mb-2">Email Notifications</label>
        <div className="flex items-center">
          <input type="checkbox" className="mr-2" />
          <span>Receive email notifications for task updates</span>
        </div>
      </div>
      <div className="mb-4">
        <label className="block mb-2">Display Name</label>
        <input type="text" className={`w-full p-2 rounded ${theme.inputBg} ${theme.borderColor}`} placeholder="Your display name" />
      </div>
      <button className={`px-4 py-2 rounded ${theme.buttonBg} text-white`}>Save Changes</button>
    </div>
  </div>
);

const PasswordContent = ({ theme }) => (
  <div className={`p-6 ${theme.text}`}>
    <h2 className="text-2xl font-bold mb-4">Change Password</h2>
    <p className="mb-4">Update your account password.</p>
    <div className={`p-4 rounded-lg ${theme.cardBg}`}>
      <div className="mb-4">
        <label className="block mb-2">Current Password</label>
        <input type="password" className={`w-full p-2 rounded ${theme.inputBg} ${theme.borderColor}`} placeholder="Enter current password" />
      </div>
      <div className="mb-4">
        <label className="block mb-2">New Password</label>
        <input type="password" className={`w-full p-2 rounded ${theme.inputBg} ${theme.borderColor}`} placeholder="Enter new password" />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Confirm New Password</label>
        <input type="password" className={`w-full p-2 rounded ${theme.inputBg} ${theme.borderColor}`} placeholder="Confirm new password" />
      </div>
      <button className={`px-4 py-2 rounded ${theme.buttonBg} text-white`}>Update Password</button>
    </div>
  </div>
);

const SupportContent = ({ theme }) => (
  <div className={`p-6 ${theme.text}`}>
    <h2 className="text-2xl font-bold mb-4">Tech Support</h2>
    <p className="mb-4">Get help with technical issues or contact our support team.</p>
    <div className={`p-4 rounded-lg ${theme.cardBg}`}>
      <div className="mb-4">
        <label className="block mb-2">Issue Type</label>
        <select className={`w-full p-2 rounded ${theme.inputBg} ${theme.borderColor}`}>
          <option>Account Access</option>
          <option>Feature Request</option>
          <option>Bug Report</option>
          <option>Other</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-2">Description</label>
        <textarea className={`w-full p-2 rounded ${theme.inputBg} ${theme.borderColor}`} rows="4" placeholder="Describe your issue"></textarea>
      </div>
      <button className={`px-4 py-2 rounded ${theme.buttonBg} text-white`}>Submit Ticket</button>
    </div>
  </div>
);

const LogoutContent = ({ theme, onConfirm, onCancel }) => (
  <div className={`p-6 ${theme.text}`}>
    <h2 className="text-2xl font-bold mb-4">Logout</h2>
    <p className="mb-4">Are you sure you want to logout?</p>
    <div className={`p-4 rounded-lg ${theme.cardBg}`}>
      <p className="mb-4">You will be redirected to the login page.</p>
      <div className="flex space-x-4">
        <button 
          className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          onClick={onConfirm}
        >
          Confirm Logout
        </button>
        <button 
          className="px-6 py-2 rounded bg-gray-500 text-white hover:bg-gray-600 transition-colors"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const { currentTheme, isDarkTheme, toggleTheme } = useTheme();
  const [userData, setUserData] = useState(null);
  const [activeNavItem, setActiveNavItem] = useState('Home');
  const [userRole, setUserRole] = useState('User'); // Default to User role
  
  // Add sidebar collapsed state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const renderHomeContent = () => {
    // Check if user is Admin or SuperAdmin
    if (userRole === 'Admin' || userRole === 'SuperAdmin') {
      return <TaskHomeAdmin theme={theme} />;
    } else {
      // Regular user view
      return <TaskHomeUser theme={theme} />;
    }
  };

  // Add button theme and input background to currentTheme
  const theme = {
    ...currentTheme,
    buttonBg: currentTheme.name === 'dark' ? 'bg-blue-600' : 'bg-blue-500',
    inputBg: currentTheme.name === 'dark' ? 'bg-gray-700' : 'bg-white',
    cardBg: currentTheme.name === 'dark' ? 'bg-gray-800' : 'bg-gray-100',
  };

  // Use the custom hook for connection setup
  useConnectionSetup();

  // Load user data from localStorage on component mount
  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUserData(parsedUser);
          
          // Set the user role from stored data
          if (parsedUser.role) {
            setUserRole(parsedUser.role);
          }
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    };

    // Delay the execution to ensure connection listeners are set up first
    setTimeout(loadUserData, 0);
  }, []);

  const handleSettingsClick = useCallback(() => {
    setActiveNavItem('Settings');
    setShowSettings(prev => !prev);
  }, []);

  const handleNavItemClick = useCallback((navItem) => {
    setActiveNavItem(navItem);
    if (navItem === 'Settings') {
      setShowSettings(true);
    } else if (navItem !== 'Change Password') {
      setShowSettings(false);
    }
  }, []);

  const handlesupportticket = useCallback(() => {
    setActiveNavItem('Tech Support');
    try {
      // Implement support ticket logic
    } catch (error) {
      console.error('Support ticket error:', error);
    }
  }, []);

  const handleLogout = useCallback(() => {
    setActiveNavItem('Logout');
  }, []);

  // Render the appropriate content based on the active nav item
  const renderContent = () => {
    switch (activeNavItem) {
      case 'Home':
        return renderHomeContent(); 
      case 'New Task':
        return <NewTask theme={theme} />;
      case 'Task Flow':
        return <TaskFlowContent theme={theme} />;
      case 'Dashboard':
        return <DashboardContent theme={theme} />;
      case 'Perfect ⭐':
        return <PerfectContent theme={theme} />;
      case 'Settings':
        return <SettingsContent theme={theme} />;
      case 'Change Password':
        return <PasswordContent theme={theme} />;
      case 'Tech Support':
        return <SupportContent theme={theme} />;
        case 'Logout':
          return (
            <LogoutContent 
              theme={theme} 
              onConfirm={() => {
                // Clear user authentication data
                localStorage.removeItem('user');
                // Navigate to login page
                navigate('/login');
              }}
              onCancel={() => {
                // Return to home page
                setActiveNavItem('Home');
              }}
            />
          );
          
          case 'reoccur':
            return <RecurringTask theme={theme} />;
          default:
            return <HomeContent theme={theme} />;
        }
  };

  return (
    <div className={`flex h-screen ${currentTheme.background}`}>
      {/* Sidebar Toggle Button (Mobile) */}
      <div className="md:hidden absolute top-4 left-4 z-20">
        <button 
          onClick={toggleSidebar}
          className={`p-2 rounded-full ${currentTheme.name === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-lg`}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Sidebar - Fixed width with boat.jpg background */}
      <div 
        className={`
          ${sidebarCollapsed ? 'w-16' : 'w-64'} 
          ${currentTheme.sidebar} 
          border-r ${currentTheme.borderColor} 
          p-4 
          relative 
          overflow-hidden
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'md:w-20' : 'md:w-48'}
          ${sidebarCollapsed ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
          absolute md:relative
          h-full
          z-10
        `}
      >
        {/* Background boat image with 50% opacity */}
        <img 
          src="/src/assets/boat.jpg" 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover opacity-8 z-0 pointer-events-none"
          style={{
            objectFit: 'cover',
            objectPosition: 'center'
          }}
        />
{/* Content in foreground */}
<div className="relative z-10 flex flex-col h-full">
  {/* User Profile with horizontal layout */}
  <div className="flex flex-col mb-6">
    {/* User info row */}
    <div className="flex items-center mb-3">
      {/* User Avatar */}
      <UserAvatar 
        name={userData?.username || userData?.useremail || 'Unknown User'}
        initials={userData?.initials}
      />
      
      {/* User Info - only show when sidebar is expanded */}
      {!sidebarCollapsed && (
        <div className="ml-3">
          <h3 className={`${currentTheme.text} text-sm font-medium`}>
            {userData?.username || userData?.useremail || 'User'}
          </h3>
          <p className={`${currentTheme.mutedText} text-xs`}>
            {userData?.role || 'No Role Assigned'}
          </p>
        </div>
      )}
    </div>
    
   {/* Chevron Toggle Button - centered below the profile row */}
<div className="flex justify-left">
  <button 
    onClick={toggleSidebar}
    className={`
      p-2 
      rounded-full 
      transition-colors 
      duration-200 
      border-2 
      ${currentTheme.name === 'dark' 
        ? 'border-gray-300 hover:bg-gray-700' 
        : 'border-gray-700 hover:bg-gray-200'
      }
    `}
    aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
  >
    {sidebarCollapsed ? (
      <ChevronRight 
        size={16} 
        className={currentTheme.text} 
      />
    ) : (
      <ChevronLeft 
        size={16} 
        className={currentTheme.text} 
      />
    )}
  </button>
</div>
  </div>
  
  {/* Divider line */}
  <div className={`h-[1px] ${currentTheme.divider} mb-2`}></div>
          
          {/* Theme Toggle */}
          <div className={`mb-4 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
            <ThemeToggle />
          </div>

          {/* Navigation */}
          <nav className="space-y-3 flex-grow">
            <NavItem 
              icon={<CheckCheck  size={20} />} 
              text="Onetime" 
              theme={currentTheme} 
              active={activeNavItem === 'Home'}
              onClick={() => handleNavItemClick('Home')}
              isCollapsed={sidebarCollapsed}
            />

              <NavItem 
              icon={<CalendarSync size={20} />} 
              text="Recurring" 
              theme={currentTheme} 
              active={activeNavItem === 'reoccur'}
              onClick={() => handleNavItemClick('reoccur')}
              isCollapsed={sidebarCollapsed}
            />
            <div className={`my-5 border-0 border-b-1 border-line ${currentTheme.name === 'dark' ? 'border-gray-500' : 'border-gray-400'} mx-2`}></div>

            <NavItem 
              icon={<CirclePlus size={20} />} 
              text="New Task" 
              theme={currentTheme} 
              active={activeNavItem === 'New Task'}
              onClick={() => handleNavItemClick('New Task')}
              isCollapsed={sidebarCollapsed}
            />
            <NavItem 
              icon={<Workflow size={20} />} 
              text="Task Flow" 
              theme={currentTheme} 
              active={activeNavItem === 'Task Flow'}
              onClick={() => handleNavItemClick('Task Flow')}
              isCollapsed={sidebarCollapsed}
            />
            
            <NavItem 
              icon={<BarChart2 size={20} />} 
              text="Dashboard" 
              theme={currentTheme} 
              active={activeNavItem === 'Dashboard'}
              onClick={() => handleNavItemClick('Dashboard')}
              isCollapsed={sidebarCollapsed}
            />
            <NavItem 
              icon={<Star size={20} />} 
              text="Perfect ⭐" 
              theme={currentTheme} 
              active={activeNavItem === 'Perfect ⭐'}
              onClick={() => handleNavItemClick('Perfect ⭐')}
              isCollapsed={sidebarCollapsed}
            />
            
            <>
              <NavItem 
                icon={<Lock size={20} />} 
                text="Settings" 
                onClick={handleSettingsClick}
                active={activeNavItem === 'Settings'}
                theme={currentTheme}
                isCollapsed={sidebarCollapsed}
              />
              {showSettings && (
                <SubNavItem 
                  text="Change Password" 
                  theme={currentTheme} 
                  onClick={() => handleNavItemClick('Change Password')}
                  isCollapsed={sidebarCollapsed}
                />
              )}
              <NavItem 
                icon={<Wrench size={20} />} 
                text="Tech Support" 
                onClick={handlesupportticket} 
                theme={currentTheme} 
                active={activeNavItem === 'Tech Support'}
                isCollapsed={sidebarCollapsed}
              />

              <NavItem 
                icon={<LogOut size={20} />} 
                text="Logout" 
                onClick={handleLogout} 
                theme={currentTheme} 
                active={activeNavItem === 'Logout'}
                isCollapsed={sidebarCollapsed}
              />
            </>
          </nav>
          
         {/* Footer */}
          <div className="mt-auto pt-4">
            <div className={`h-[1px] ${currentTheme.divider} mb-3`}></div>
            {!sidebarCollapsed ? (
              <div className="flex flex-col items-center text-center">
                <div className="relative group">
                  <div 
                    className={`${currentTheme.mutedText} text-xs cursor-pointer hover:text-blue-500 transition-colors duration-200`}
                  >
                    © {new Date().getFullYear()} FreeMind.Works..🦋
                  </div>
                  {/* Custom tooltip that appears on hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                    Built using AI by Raghav
                  </div>
                </div>
                <div className={`${currentTheme.mutedText} text-xs mt-1`}>
                  Ver 1.0
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className={`${currentTheme.mutedText} text-xs`}>🦋</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-0 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main Content */}
      <div className={`flex-1 p-3 ${currentTheme.background} overflow-auto transition-all duration-300 ease-in-out`}>
        {/* Header with RevCLD logo on right and centered title */}
        <div className={`relative flex items-center border-b ${currentTheme.borderColor} py-2 px-4`}>
          {/* Empty div on left for balance */}
          <div className="w-12"></div>
          
          {/* Centered title container */}
          <div className="flex-1 flex justify-center items-center">
            <div className="text-center">
              <h1 className={`text-4xl font-semibold ${currentTheme.text}`}>
                TaskForce <span className="inline-block animate-pulse">⚡</span>
              </h1>
              <p className={`text-sm ${currentTheme.mutedText}`}>
                Every TASK, brings you the opportunity to LEARN and ESTABLISH something...
              </p>
            </div>
          </div>
          
          {/* RevCLD Logo in the top right corner */}
          <div className={`
            p-1 rounded-xl flex items-center space-x-2
            ${currentTheme.name === 'dark' ? 'border border-white' : 'border border-gray-900'}
          `}>
            <img
              src="/src/assets/sficon.png"
              alt="Salesforce Logo"
              className="h-6 w-7 rounded-lg"
              onError={(e) => {
                console.error('Salesforce logo load error');
              }}
            />
            
            <img
              src="/src/assets/revcld.png"
              alt="RevCLD Logo"
              className="h-6 w-7 rounded-lg"
              onError={(e) => {
                console.error('RevCLD logo load error');
              }}
            />
          </div>
        </div>
          
        {/* Dynamic Display Area */}
        <div className={`p-4 ${activeNavItem === 'Task Flow' ? 'h-[calc(100vh-140px)] flex justify-center items-center' : ''}`}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;