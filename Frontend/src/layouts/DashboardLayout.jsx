import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const DashboardLayout = () => {
  return (
    <div className="flex bg-transparent min-h-screen font-sans text-slate-800">
      <Sidebar />
      <div className="flex flex-col flex-1 w-full">
        <Navbar />
        <main className="h-full overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
