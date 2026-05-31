import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertTriangle, Clock, CheckIcon, CheckCheck } from 'lucide-react';
import { getMyComplaints } from '../services/api';
import { Link } from 'react-router-dom';

function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  let interval = seconds / 31536000;
  if (interval >= 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval >= 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval >= 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval >= 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval >= 1) return Math.floor(interval) + " mins ago";
  return "just now";
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [readIds, setReadIds] = useState(new Set());

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getMyComplaints();
        if (data && data.success) {
          const notifs = [];
          data.data.forEach(complaint => {
            if (complaint.status !== 'pending') {
              notifs.push({
                id: `status-${complaint.id}`,
                complaintId: complaint.id,
                title: "Issue Status Updated",
                message: `Your report "${complaint.title}" is now marked as ${complaint.status.replace('_', ' ')}.`,
                status: complaint.status,
                date: complaint.created_at // Assuming we use created_at as scaffold for update time
              });
            }
          });
          setNotifications(notifs.reverse());
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAllAsRead = () => {
    const allIds = new Set(notifications.map(n => n.id));
    setReadIds(allIds);
  };

  const markAsRead = (e, id) => {
    // If clicking link, it automatically triggers, but we can do it here too just in case
    setReadIds(prev => new Set(prev).add(id));
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'updates' && (n.status === 'in_progress' || n.status === 'pending')) return true;
    if (n.status === filter) return true;
    return false;
  });

  const unreadCount = notifications.length - readIds.size;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Notifications</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Updates regarding your complaints and reports</p>
        </div>
        <button 
           onClick={markAllAsRead}
           disabled={unreadCount === 0}
           className={`flex items-center px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm ${unreadCount > 0 ? "bg-white text-primary-600 hover:bg-primary-50 border border-primary-200" : "bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed"}`}
        >
           <CheckCheck className="w-4 h-4 mr-2" /> Mark all as read
        </button>
      </div>

      {/* Glassmorphic Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
         {[
           { id: 'all', label: 'All' },
           { id: 'updates', label: 'Updates' },
           { id: 'resolved', label: 'Resolved' },
           { id: 'escalated', label: 'Escalated' }
         ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${filter === f.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'bg-white/80 backdrop-blur-md text-slate-600 hover:bg-slate-50 border border-white/60 shadow-sm'}`}>
              {f.label}
            </button>
         ))}
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg border border-white/60 overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-medium">Loading your notifications...</div>
        ) : filteredNotifications.length > 0 ? (
          <div className="divide-y divide-slate-100/50">
            {filteredNotifications.map(notif => {
              const isRead = readIds.has(notif.id);
              return (
                <Link 
                  onClick={(e) => markAsRead(e, notif.id)}
                  to={`/dashboard/track?id=${notif.complaintId}`} 
                  key={notif.id} 
                  className={`p-5 sm:p-6 transition-all flex items-start gap-5 relative group ${isRead ? 'opacity-60 bg-transparent hover:bg-slate-50/50' : 'bg-primary-50/30 hover:bg-primary-50/70 border-l-4 border-l-primary-500'}`}
                >
                  <div className="mt-1 shrink-0">
                    <div className={`p-2 rounded-full ${isRead ? 'bg-slate-100' : 'bg-white shadow-sm ring-1 ring-black/5'}`}>
                      {notif.status === 'resolved' ? <CheckCircle className={`w-6 h-6 ${isRead ? 'text-slate-400' : 'text-green-500'}`} /> : 
                       notif.status === 'in_progress' ? <AlertTriangle className={`w-6 h-6 ${isRead ? 'text-slate-400' : 'text-yellow-500'}`} /> :
                       <Clock className={`w-6 h-6 ${isRead ? 'text-slate-400' : 'text-blue-500'}`} />}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`font-extrabold text-sm sm:text-base ${isRead ? 'text-slate-600' : 'text-slate-900 group-hover:text-primary-700'}`}>{notif.title}</h3>
                      <span className="text-xs font-bold text-slate-400 shrink-0 ml-4 whitespace-nowrap bg-white/50 px-2 py-1 rounded-md border border-slate-100/50">{timeAgo(notif.date)}</span>
                    </div>
                    <p className={`text-sm ${isRead ? 'text-slate-500' : 'text-slate-700 font-medium'} leading-relaxed`}>{notif.message}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 px-6 text-slate-500 flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4 shadow-inner">
               <Bell className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-700 mb-2">No new notifications</h3>
            <p className="text-sm font-medium">We'll let you know when authorities update your complaints.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
