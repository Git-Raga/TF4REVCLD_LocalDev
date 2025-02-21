import React, { useState, useEffect, useCallback } from 'react';
import { useTheme, ThemeToggle } from './ColorChange';
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
  CirclePlus 
} from 'lucide-react';
import FontConfig from './FontConfig';
import { useNavigate } from 'react-router-dom';

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
const NavItem = ({ icon, text, active, onClick, theme }) => (
  <div 
    className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer ${
      active ? theme.activeNavItem : theme.navItem
    }`}
    onClick={onClick}
  >
    <span className={theme.iconColor}>{icon}</span>
    <span className={theme.navItemText}>{text}</span>
  </div>
);

// SubNavItem component
const SubNavItem = ({ text, theme }) => (
  <div className={`flex items-center space-x-3 px-3 py-2 pl-11 rounded-lg cursor-pointer ${theme.navItem}`}>
    <span className={`${theme.navItemText} text-sm`}>{text}</span>
  </div>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const { currentTheme } = useTheme();
  const [userData, setUserData] = useState(null);

  // Use the custom hook for connection setup
  useConnectionSetup();

  // Load user data from localStorage on component mount
  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUserData(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    };

    // Delay the execution to ensure connection listeners are set up first
    setTimeout(loadUserData, 0);
  }, []);

  const handleSettingsClick = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);

  const handlesupportticket = useCallback(() => {
    try {
      // Implement support ticket logic
    } catch (error) {
      console.error('Support ticket error:', error);
    }
  }, []);

  const handleLogout = useCallback(() => {
    // Clear user authentication
    localStorage.removeItem('user');
    
    // Navigate to login
    navigate('/login');
  }, [navigate]);

  return (
    <div className={`flex h-screen ${currentTheme.background}`}>
      {/* Sidebar */}
      <div className={`w-64 ${currentTheme.sidebar} border-r ${currentTheme.borderColor} p-4`}>
        {/* User Profile */}
        <div className="flex items-center space-x-3 mb-8">
          <UserAvatar 
            name={userData?.username || userData?.useremail || 'Unknown User'}
            initials={userData?.initials}
          />
          <div>
            <h3 className={`${currentTheme.text} text-sm font-medium`}>
              {userData?.username || userData?.useremail || 'User'}
            </h3>
            <p className={`${currentTheme.mutedText} text-sm`}>
              {userData?.role || 'No Role Assigned'}
            </p>
          </div>
        </div>
        
        {/* Divider line */}
        <div className={`h-[1px] ${currentTheme.divider} mb-2`}></div>
        {/* Theme Toggle */}
        <div className="mb-4">
          <ThemeToggle />
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          <NavItem icon={<Home size={20} />} text="Home" theme={currentTheme} />
          <NavItem icon={<CirclePlus size={20} />} text="New Task" theme={currentTheme} />
          <NavItem icon={<BarChart2 size={20} />} text="Dashboard" theme={currentTheme} />
          <NavItem icon={<Star size={20} />} text=" Perfect ⭐ " theme={currentTheme} />
          
          <>
            <NavItem 
              icon={<Lock size={20} />} 
              text="Settings" 
              onClick={handleSettingsClick}
              active={showSettings}
              theme={currentTheme}
            />
            {showSettings && (
              <SubNavItem text=" 🔑 Change Password" theme={currentTheme} />
            )}
            <NavItem 
              icon={<Wrench size={20} />} 
              text="Tech Support" 
              onClick={handlesupportticket} 
              theme={currentTheme} 
            />

            <NavItem 
              icon={<LogOut size={20} />} 
              text="Logout" 
              onClick={handleLogout} 
              theme={currentTheme} 
            />
          </>
        </nav>
      </div>

      
      
<div className={`flex-1 ${currentTheme.background} p-3 `}>
  <div className="text-center m-2.5 ">
    <h1 className={`text-3xl font-semibold ${currentTheme.text} `}>
      TaskForce <span className="inline-block animate-pulse">⚡</span>
    </h1>
    <p className={`text-sm ${currentTheme.mutedText}`}>
      Every TASK, brings you the opportunity to LEARN and ESTABLISH something...
    </p>
    
  </div>
   {/* Divider line */}
 <div className={`h-[1px] ${currentTheme.divider} `}></div>
  
</div>




</div>
  );
};

export default LandingPage;