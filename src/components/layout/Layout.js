import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { DEBUG } from '../../utils/debug';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Open sidebar by default on desktop
  React.useEffect(() => {
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }
  }, []);

  // Debug logging - always call hook, make logic conditional
  React.useEffect(() => {
    if (DEBUG) {
      console.log('🔍 [Layout] Render', { sidebarOpen });
    }
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* Header - Full Width */}
      <Header toggleSidebar={toggleSidebar} />

      {/* Main content area with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Left for English, Right for Arabic */}
        <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

