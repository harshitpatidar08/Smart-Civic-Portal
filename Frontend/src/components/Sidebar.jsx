import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, FileText, Activity, MapPin, User, Settings, LogOut } from 'lucide-react';
import { getUserProfile } from '../services/api';

const Sidebar = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('citizen'); 
  

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await getUserProfile();
        if (res.success && res.data) {
          setRole(res.data.role || 'citizen');
        }
      } catch (e) {
        console.error("Failed to fetch user role for sidebar", e);
      }
    };
    fetchRole();
  }, []);

  const allRoutes = [
    { name: 'Dashboard', path: '/dashboard/citizen', icon: Home, roles: ['citizen', 'district_admin', 'state_admin'] },
    { name: 'Report Issue', path: '/dashboard/report', icon: MapPin, roles: ['citizen', 'district_admin', 'state_admin'] },
    { name: 'Track Complaints', path: '/dashboard/track', icon: Activity, roles: ['citizen', 'district_admin', 'state_admin'] },
    { name: 'District Admin', path: '/dashboard/admin', icon: FileText, roles: ['district_admin', 'state_admin'] },
    { name: 'State Overview', path: '/dashboard/state-admin', icon: Activity, roles: ['state_admin'] },
  ];
  
  const routes = allRoutes.filter(route => route.roles.includes(role));

  return (
    <aside className="w-64 bg-slate-900/95 backdrop-blur-xl hidden md:flex text-slate-300 flex-shrink-0 flex-col border-r border-white/10 shadow-2xl z-20">
      <div className="h-16 flex items-center justify-center border-b border-slate-800/80 px-6">
        <span className="text-white text-xl font-bold flex items-center gap-2">
          <MapPin className="text-primary-500 w-6 h-6" /> Smart Civic
        </span>
      </div>
      
      <div className="py-6 px-4 flex flex-col gap-2 flex-grow">
        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Navigation</p>
        {routes.map((route) => (
          <NavLink
            key={route.name}
            to={route.path}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive 
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <route.icon className="w-5 h-5 mr-3" />
            {route.name}
          </NavLink>
        ))}
      </div>

      <div className="mt-auto p-4 border-t border-slate-800">
        <button 
          onClick={() => { localStorage.clear(); navigate('/login'); }}
          className="flex w-full items-center px-3 py-2.5 rounded-md text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors duration-200"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
