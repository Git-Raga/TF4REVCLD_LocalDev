import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SidebarToggle = ({ sidebarCollapsed, toggleSidebar }) => {
  return (
    <button 
      onClick={toggleSidebar}
      className="sidebar-toggle-btn"
      aria-label={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
    >
      {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
    </button>
  );
};

export default SidebarToggle;