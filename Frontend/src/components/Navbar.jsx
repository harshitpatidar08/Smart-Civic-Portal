import React, { useState, useEffect } from 'react';
import { Menu, User, Bell, Search, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyComplaints } from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const data = await getMyComplaints();
        if (data && data.success) {
          const count = data.data.filter(c => c.status !== 'pending').length;
          setUnreadCount(count);
        }
      } catch (err) {
        console.error("Failed to fetch count", err);
      }
    };
    fetchUnread();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setShowSearchDropdown(e.target.value.trim().length > 0);
  };

  return (
    <header className="z-40 glass-nav py-4 px-6 flex items-center justify-between sticky top-0 transition-all duration-300">
      <div className="flex items-center">
        <button className="text-slate-500 hover:text-slate-700 focus:outline-none focus:ring md:hidden">
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden md:flex ml-4 relative z-50">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="w-5 h-5 text-slate-400" />
          </span>
          <input
            className="w-full sm:w-72 pl-10 pr-4 py-2 border border-slate-200 rounded-full text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-white/70 backdrop-blur-sm transition-all shadow-sm"
            type="text"
            placeholder="Search complaints or issues..."
            value={searchQuery}
            onChange={handleSearch}
          />
          {showSearchDropdown && (
            <div className="absolute top-12 left-0 w-full bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in">
              <div className="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-500">Quick Search Results</span>
                <button onClick={() => setShowSearchDropdown(false)}><X className="w-4 h-4 text-slate-400" /></button>
              </div>
              <div className="p-2 space-y-1">
                <div className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors" onClick={() => navigate('/dashboard/track?id=1234')}>
                  <p className="text-sm font-medium text-slate-800">Search: "{searchQuery}"</p>
                  <p className="text-xs text-slate-500">Press enter to view all results</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-5">
        <div className="relative">
          <Link 
            to="/dashboard/notifications"
            className="text-slate-500 hover:text-primary-600 relative p-2 rounded-full hover:bg-primary-50 transition-colors focus:outline-none flex items-center justify-center"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 border-2 border-white rounded-full">
                {unreadCount}
              </span>
            )}
          </Link>
        </div>

        <Link to="/dashboard/profile" className="relative group focus:outline-none">
          <button className="flex items-center space-x-2 p-1 pr-3 rounded-full hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all">
            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 text-white font-semibold shadow-md group-hover:shadow-primary-500/30 transition-all">
              <User className="w-5 h-5" />
            </div>
            <span className="hidden md:inline-block text-sm font-semibold text-slate-700 group-hover:text-primary-600 transition-colors">My Profile</span>
          </button>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
