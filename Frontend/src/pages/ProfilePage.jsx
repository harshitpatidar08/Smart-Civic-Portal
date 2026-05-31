import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Grid, CheckCircle, LogOut, Edit3, Award, Star, Shield, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, getMyComplaints } from '../services/api';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ reported: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  
  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', district: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await getUserProfile();
        if (profileRes.success && profileRes.data) {
          setUser(profileRes.data);
          setEditForm({ name: profileRes.data.name || '', district: profileRes.data.district || '' });
        }
        
        const complaintsRes = await getMyComplaints();
        if (complaintsRes.success && complaintsRes.data) {
          const resolved = complaintsRes.data.filter(c => c.status === 'resolved').length;
          setStats({ reported: complaintsRes.data.length, resolved });
        }
      } catch (err) {
        console.error("Failed to fetch profile data", err);
        // Scaffold fallback if api fails
        setUser({ name: "Citizen User", email: "citizen@example.com", district: "Central Ward", role: "citizen" });
        setEditForm({ name: "Citizen User", district: "Central Ward" });
        setStats({ reported: 4, resolved: 2 });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleSave = () => {
    // Scaffold API update logic
    setUser(prev => ({ ...prev, ...editForm }));
    setIsEditing(false);
    // In real app, call API e.g., await updateProfile(editForm)
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Loading profile data...</div>;
  }

  // Badges Logic
  const badges = [
    { 
      id: 1, 
      name: "First Step", 
      desc: "Reported your first issue", 
      icon: <Star className="w-6 h-6" />, 
      earned: stats.reported >= 1,
      color: "text-amber-500",
      bg: "bg-amber-50"
    },
    { 
      id: 2, 
      name: "Active Citizen", 
      desc: "Reported 3+ issues", 
      icon: <Shield className="w-6 h-6" />, 
      earned: stats.reported >= 3,
      color: "text-blue-500",
      bg: "bg-blue-50"
    },
    { 
      id: 3, 
      name: "Community Hero", 
      desc: "Helped resolve 2+ issues", 
      icon: <Award className="w-6 h-6" />, 
      earned: stats.resolved >= 2,
      color: "text-green-500",
      bg: "bg-green-50"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Your Profile</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Manage your account and view statistics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="md:col-span-1 glass-panel bg-white/80 backdrop-blur-md border border-white/60 rounded-3xl shadow-xl p-8 flex flex-col items-center text-center space-y-5">
          <div className="w-32 h-32 bg-gradient-to-tr from-primary-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/30">
            <User className="w-16 h-16 text-white" />
          </div>
          <div className="w-full">
            <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">{user?.name}</h2>
            {user?.role && (
              <span className="inline-block mt-2 px-3.5 py-1 bg-primary-100/50 text-primary-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-primary-200">
                {user.role}
              </span>
            )}
          </div>
          
          <button 
            onClick={handleLogout}
            className="mt-6 w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 font-bold transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </button>
        </div>

        {/* Details & Edit Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/60 p-8">
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-4 mb-6">
               <h3 className="text-xl font-extrabold text-slate-800">Account Information</h3>
               {!isEditing ? (
                 <button onClick={() => setIsEditing(true)} className="flex items-center text-sm font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg transition-colors">
                   <Edit3 className="w-4 h-4 mr-1.5" /> Edit Profile
                 </button>
               ) : (
                 <div className="flex items-center gap-2">
                   <button onClick={() => setIsEditing(false)} className="p-1.5 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-lg transition-colors">
                     <X className="w-5 h-5" />
                   </button>
                   <button onClick={handleSave} className="flex items-center text-sm font-bold text-white bg-green-500 hover:bg-green-600 px-4 py-1.5 rounded-lg shadow-sm shadow-green-500/30 transition-colors">
                     <Save className="w-4 h-4 mr-1.5" /> Save
                   </button>
                 </div>
               )}
            </div>
            
            <div className="space-y-5">
              {isEditing ? (
                <>
                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                     <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium text-slate-900" />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                     <input type="email" value={user?.email || ''} disabled className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium" />
                     <p className="text-[10px] text-slate-400 mt-1">Email cannot be changed.</p>
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Default Location (District/Ward)</label>
                     <input type="text" value={editForm.district} onChange={e => setEditForm({...editForm, district: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium text-slate-900" />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center p-4 bg-slate-50/80 backdrop-blur-sm rounded-2xl border border-slate-100">
                    <Mail className="w-6 h-6 text-slate-400 mr-5" />
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Email Address</p>
                      <p className="text-base font-semibold text-slate-900">{user?.email || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-slate-50/80 backdrop-blur-sm rounded-2xl border border-slate-100">
                    <MapPin className="w-6 h-6 text-slate-400 mr-5" />
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Default Location</p>
                      <p className="text-base font-semibold text-slate-900">{user?.district || "N/A"}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="glass-panel bg-white/80 backdrop-blur-md rounded-3xl shadow-lg border border-white/60 p-6 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-full flex items-center justify-center mb-4 shadow-md shadow-blue-500/30">
                <Grid className="w-7 h-7" />
              </div>
              <h4 className="text-4xl font-black text-slate-900 tracking-tight">{stats.reported}</h4>
              <p className="text-xs font-bold text-slate-500 mt-1.5 uppercase tracking-wider">Issues Reported</p>
            </div>
            
            <div className="glass-panel bg-white/80 backdrop-blur-md rounded-3xl shadow-lg border border-white/60 p-6 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-600 text-white rounded-full flex items-center justify-center mb-4 shadow-md shadow-green-500/30">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h4 className="text-4xl font-black text-slate-900 tracking-tight">{stats.resolved}</h4>
              <p className="text-xs font-bold text-slate-500 mt-1.5 uppercase tracking-wider">Issues Resolved</p>
            </div>
          </div>

          {/* Achievement Badges Section */}
          <div className="glass-panel bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/60 p-8">
            <h3 className="text-xl font-extrabold text-slate-800 border-b border-slate-200/60 pb-4 mb-6 flex items-center">
               <Award className="w-6 h-6 mr-2 text-primary-500" /> Civic Achievements
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               {badges.map(badge => (
                 <div key={badge.id} className={`p-4 rounded-2xl border ${badge.earned ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60 filter grayscale'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${badge.bg} ${badge.color}`}>
                       {badge.icon}
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">{badge.name}</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{badge.desc}</p>
                 </div>
               ))}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
