import React, { useState } from 'react';
import { useTheme, ThemeToggle } from './ColorChange';
import { Home, Grid, FolderOpen, PlusSquare, Users, Layout, BarChart2, Lock, Paintbrush, LogOut, Star, Import } from 'lucide-react';
import FontConfig from './FontConfig';
import { useNavigate } from 'react-router-dom'; // Add this import

const LandingPage = ({ onLogout }) => {
  const navigate = useNavigate(); //
  const files = [
    { name: 'Dashboard tech requirements', size: '220 KB', type: 'docx', uploadedBy: 'Amelie Laurent', email: 'amelie@untitledui.com' },
    { name: 'Marketing site requirements', size: '488 KB', type: 'docx', uploadedBy: 'Ammar Foley', email: 'ammar@untitledui.com' },
    { name: 'Q4_2023 Reporting', size: '1.2 MB', type: 'pdf', uploadedBy: 'Amelie Laurent', email: 'amelie@untitledui.com' },
    { name: 'Q3_2023 Reporting', size: '1.3 MB', type: 'pdf', uploadedBy: 'Sienna Hewitt', email: 'sienna@untitledui.com' }
  ];

  const [showSettings, setShowSettings] = useState(false);
  const { currentTheme } = useTheme();

  const handleSettingsClick = () => {
    setShowSettings(!showSettings);
  };

  const handleLogout = () => {
    // Clear user authentication
    localStorage.removeItem('user');
    
    // Navigate to login
    navigate('/login');
  };

  return (
    <div className={`flex h-screen ${currentTheme.background}`}>
      {/* Sidebar */}
      <div className={`w-64 ${currentTheme.sidebar} border-r ${currentTheme.borderColor} p-4`}>
        {/* User Profile */}
        <div className="flex items-center space-x-3 mb-8">
          <img
            src="https://i.pravatar.cc/40"
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className={`${currentTheme.text} text-sm font-medium`}>Adriana O'Sullivan</h3>
            <p className={`${currentTheme.mutedText} text-sm`}>adriana@untitledui.com</p>
          </div>
        </div>
        {/* Divider line */}
        <div className={`h-[1px] ${currentTheme.divider} mb-4`}></div>
        {/* Theme Toggle */}
        <div className="mb-4">
          <ThemeToggle />
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          <NavItem icon={<Home size={20} />} text="Home" theme={currentTheme} />
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
              icon={<LogOut size={20} />} 
              text="Logout" 
              onClick={handleLogout} 
              theme={currentTheme} 
            />
          </>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`flex-1 ${currentTheme.background}`}>
        <div className="p-8">
          <h1 className={`text-2xl font-semibold ${currentTheme.text} mb-8`}>Project files</h1>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <QuickActionCard icon={<PlusSquare size={24} />} title="New document" theme={currentTheme} />
            <QuickActionCard icon={<Grid size={24} />} title="New spreadsheet" theme={currentTheme} />
            <QuickActionCard icon={<FolderOpen size={24} />} title="New project" theme={currentTheme} />
          </div>

          {/* Recently Modified Section */}
          <div className="mb-8">
            <h2 className={`${currentTheme.text} text-lg font-medium mb-4`}>Recently modified</h2>
            <div className="grid grid-cols-3 gap-4">
              {files.slice(0, 3).map((file, index) => (
                <FileCard key={index} file={file} theme={currentTheme} />
              ))}
            </div>
          </div>

          {/* All Files Section */}
          <div>
            <h2 className={`${currentTheme.text} text-lg font-medium mb-4`}>All files</h2>
            <div className={`${currentTheme.cardBackground} rounded-lg overflow-hidden`}>
              <div className={`flex items-center ${currentTheme.mutedText} text-sm px-4 py-2 border-b ${currentTheme.borderColor}`}>
                <div className="w-8"></div>
                <div className="flex-1">File name</div>
                <div className="w-32 text-right">Uploaded by</div>
              </div>
              {files.map((file, index) => (
                <FileListItem key={index} file={file} theme={currentTheme} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 
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

const SubNavItem = ({ text, theme }) => (
  <div className={`flex items-center space-x-3 px-3 py-2 pl-11 rounded-lg cursor-pointer ${theme.navItem}`}>
    <span className={`${theme.navItemText} text-sm`}>{text}</span>
  </div>
);

const QuickActionCard = ({ icon, title, theme }) => (
  <div className={`${theme.cardBackground} p-4 rounded-lg cursor-pointer ${theme.hoverBackground} transition-colors`}>
    <div className="flex items-center space-x-3">
      <span className={theme.iconColor}>{icon}</span>
      <span className={theme.text}>{title}</span>
    </div>
  </div>
);

const FileCard = ({ file, theme }) => (
  <div className={`${theme.cardBackground} p-4 rounded-lg`}>
    <div className="flex items-center space-x-3 mb-2">
      <FolderOpen size={20} className={theme.iconColor} />
      <span className={`${theme.text} text-sm`}>{file.name}</span>
    </div>
    <div className={`${theme.mutedText} text-sm`}>{file.size} • {file.type}</div>
  </div>
);

const FileListItem = ({ file, theme }) => (
  <div className={`flex items-center px-4 py-3 ${theme.hoverBackground} transition-colors`}>
    <div className="w-8">
      <FolderOpen size={20} className={theme.iconColor} />
    </div>
    <div className="flex-1">
      <div className={`${theme.text} text-sm`}>{file.name}</div>
      <div className={`${theme.mutedText} text-sm`}>{file.size} • {file.type}</div>
    </div>
    <div className="w-32 flex items-center space-x-2">
      <img src="https://i.pravatar.cc/24" alt="Avatar" className="w-6 h-6 rounded-full" />
      <div className="text-right">
        <div className={`${theme.text} text-sm`}>{file.uploadedBy}</div>
        <div className={`${theme.mutedText} text-xs`}>{file.email}</div>
      </div>
    </div>
  </div>
);

export default LandingPage;