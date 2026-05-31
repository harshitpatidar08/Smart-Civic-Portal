import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Clock, CheckCircle, AlertTriangle, ChevronLeft, ChevronRight, Activity, Megaphone, X, Check } from 'lucide-react';
import ComplaintCard from '../components/ComplaintCard';
import { getMyComplaints, getUserProfile, getLatestAnnouncement } from '../services/api';

// Animated Counter Component
const AnimatedCounter = ({ end }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const duration = 1500; // 1.5 seconds
    const interval = Math.max(16, duration / (end || 1));
    const increment = (end / (duration / interval)) || 0;
    
    if (end === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCount(0);
      return;
    }
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, [end]);

  return <span>{count}</span>;
};

const CitizenDashboard = () => {
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const carouselImages = [
    {
      url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=1200",
      title: "Smart Civic Infrastructure",
      subtitle: "Building safer and cleaner neighborhoods together."
    },
    {
      url: "https://images.unsplash.com/photo-1517036665790-25e6e2f11edc?auto=format&fit=crop&q=80&w=1200",
      title: "Community Cleanliness",
      subtitle: "Report waste and ensure timely sanitation."
    },
    {
      url: "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&q=80&w=1200",
      title: "Modern Reporting",
      subtitle: "Instant updates directly from local authorities."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselImages.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);

  // Removed mockComplaints

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, complaintsRes, annRes] = await Promise.all([
          getUserProfile().catch(() => null),
          getMyComplaints().catch(() => null),
          getLatestAnnouncement().catch(() => null)
        ]);
        
        if (profileRes && profileRes.success) {
          setUser(profileRes.data);
        }
        if (annRes && annRes.success) {
          setAnnouncement(annRes.data);
        }
        
        if (complaintsRes && complaintsRes.success) {
          setComplaints(complaintsRes.data);
        } else {
          setComplaints([]);
        }
      } catch (error) {
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = {
    pending: complaints.filter(c => c.status === 'pending').length,
    in_progress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length
  };

  return (
    <div className="space-y-8 pb-12 font-sans bg-slate-50 min-h-screen -mx-6 -mt-6 p-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/50 animate-fade-in mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋
          </h2>
          <p className="text-slate-500 font-medium mt-1">Here is a summary of your civic engagements.</p>
        </div>
        <Link 
          to="/dashboard/report" 
          className="mt-4 sm:mt-0 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center shadow-sm transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" /> Report Issue
        </Link>
      </div>

      {/* State-wide Announcement Banner */}
      {announcement && (
        <div className={`mb-6 p-4 rounded-xl border flex items-start gap-4 shadow-lg animate-fade-in
           ${announcement.priority === 'warning' ? 'bg-orange-50 border-orange-200 text-orange-900' : 
             announcement.priority === 'alert' ? 'bg-red-50 border-red-200 text-red-900' : 
             announcement.priority === 'success' ? 'bg-green-50 border-green-200 text-green-900' : 
             'bg-blue-50 border-blue-200 text-blue-900'}`}
        >
           <div className={`p-2 rounded-full mt-0.5 
              ${announcement.priority === 'warning' ? 'bg-orange-100 text-orange-600' : 
                announcement.priority === 'alert' ? 'bg-red-100 text-red-600' : 
                announcement.priority === 'success' ? 'bg-green-100 text-green-600' : 
                'bg-blue-100 text-blue-600'}`}
           >
              {announcement.priority === 'success' ? <Check className="w-5 h-5"/> : <Megaphone className="w-5 h-5" />}
           </div>
           <div className="flex-1">
              <h4 className="text-sm font-black uppercase tracking-wider opacity-80 mb-1">State-Wide Announcement</h4>
              <p className="font-semibold">{announcement.text}</p>
           </div>
           <button onClick={() => setAnnouncement(null)} className="text-current opacity-50 hover:opacity-100 transition"><X className="w-5 h-5"/></button>
        </div>
      )}

      {/* Clean Carousel Hero */}
      <div className="relative w-full h-80 rounded-2xl overflow-hidden shadow-sm group">
        {carouselImages.map((img, idx) => (
          <div 
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === idx ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="absolute inset-0 bg-slate-900/40 z-10"></div>
            <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-6 text-white">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-md">{img.title}</h1>
              <p className="text-lg md:text-xl max-w-2xl drop-shadow-md">{img.subtitle}</p>
            </div>
          </div>
        ))}
        
        {/* Carousel Controls */}
        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-opacity opacity-0 group-hover:opacity-100 backdrop-blur-sm">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-opacity opacity-0 group-hover:opacity-100 backdrop-blur-sm">
          <ChevronRight className="w-6 h-6" />
        </button>
        
        {/* Carousel Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
          {carouselImages.map((_, idx) => (
            <button 
              key={idx} 
              onClick={() => setCurrentSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${currentSlide === idx ? 'bg-white w-6' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/50 animate-fade-in">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋
          </h2>
          <p className="text-slate-500 font-medium mt-1">Here is a summary of your civic engagements.</p>
        </div>
        <Link 
          to="/dashboard/report" 
          className="mt-4 sm:mt-0 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center shadow-sm transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" /> Report Issue
        </Link>
      </div>

      {/* Clean Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fade-in">
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-lg flex flex-col justify-center transition-all hover:-translate-y-1 hover:shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-blue-50/80 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-blue-600 text-sm font-semibold bg-blue-50/80 backdrop-blur-sm px-3 py-1 rounded-full border border-blue-100">Pending</span>
          </div>
          <h3 className="text-4xl font-extrabold text-slate-900"><AnimatedCounter end={stats.pending} /></h3>
          <p className="text-slate-500 font-medium text-sm mt-1">Awaiting review</p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-lg flex flex-col justify-center transition-all hover:-translate-y-1 hover:shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-yellow-50/80 text-yellow-600 rounded-xl flex items-center justify-center shadow-sm">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-yellow-600 text-sm font-semibold bg-yellow-50/80 backdrop-blur-sm px-3 py-1 rounded-full border border-yellow-100">In Progress</span>
          </div>
          <h3 className="text-4xl font-extrabold text-slate-900"><AnimatedCounter end={stats.in_progress} /></h3>
          <p className="text-slate-500 font-medium text-sm mt-1">Currently being handled</p>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-lg flex flex-col justify-center transition-all hover:-translate-y-1 hover:shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-green-50/80 text-green-600 rounded-xl flex items-center justify-center shadow-sm">
              <CheckCircle className="w-6 h-6" />
            </div>
            <span className="text-green-600 text-sm font-semibold bg-green-50/80 backdrop-blur-sm px-3 py-1 rounded-full border border-green-100">Resolved</span>
          </div>
          <h3 className="text-4xl font-extrabold text-slate-900"><AnimatedCounter end={stats.resolved} /></h3>
          <p className="text-slate-500 font-medium text-sm mt-1">Successfully closed</p>
        </div>
      </div>

      <div className="animate-fade-in">
        <h2 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center">
          Recent Complaints
        </h2>
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading complaints...</div>
        ) : complaints.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complaints.slice(0, 3).map(complaint => (
              <ComplaintCard key={complaint.id} complaint={complaint} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-500 bg-white border border-slate-200 rounded-xl">
             No complaints found. Help improve your neighborhood!
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenDashboard;
