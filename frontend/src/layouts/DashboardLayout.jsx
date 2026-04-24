import React from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const DashboardLayout = ({ children }) => {
  return (
    // The main background color for the entire app (Deep Slate/Navy)
    <div className="flex h-screen bg-[#0F111A] text-white font-sans overflow-hidden">
      
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-y-auto">
        <Topbar />
        
        {/* This 'children' prop is where our Dashboard page content will be injected */}
        <main className="p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;