import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { complaintAPI } from '../services/api';
import ComplaintCard from '../components/ComplaintCard'; 
import MapView from '../components/MapView'; 

// --- UTILITY FUNCTIONS FOR STYLING ---

// 1. Status Card Styling (No Emojis, professional icons/colors)
const getStatusCardStyle = (title) => {
  switch (title) {
    case 'Total Complaints':
      return {
        // Placeholder class for an icon (e.g., from an icon library like Heroicons)
        icon: 'i-heroicons-clipboard-document-list', 
        color: 'bg-indigo-50 text-indigo-700',
        valueColor: 'text-indigo-600',
      };
    case 'Active Queue':
      return {
        icon: 'i-heroicons-exclamation-triangle',
        color: 'bg-red-50 text-red-700',
        valueColor: 'text-red-600',
      };
    case 'Resolved':
      return {
        icon: 'i-heroicons-check-circle',
        color: 'bg-emerald-50 text-emerald-700',
        valueColor: 'text-emerald-600',
      };
    case 'Average Resolution':
      return {
        icon: 'i-heroicons-clock',
        color: 'bg-amber-50 text-amber-700',
        valueColor: 'text-amber-600',
      };
    default:
      return {
        icon: 'i-heroicons-chart-bar',
        color: 'bg-slate-50 text-slate-700',
        valueColor: 'text-slate-600',
      };
  }
};

// 2. Status Colors for Pie Chart and Complaint Cards
// MODIFIED: Added low-opacity background (bg-*-50) and border for the cards.
const getStatusColors = (status) => {
  switch (status) {
    case 'pending':
      return { 
        color: '#FCD34D', 
        border: 'border-l-4 border-amber-400', 
        cardBg: 'bg-amber-50', // Low opacity background effect
      }; 
    case 'in-progress':
      return { 
        color: '#4F46E5', 
        border: 'border-l-4 border-indigo-400', 
        cardBg: 'bg-indigo-50', // Low opacity background effect
      }; 
    case 'resolved':
      return { 
        color: '#10B981', 
        border: 'border-l-4 border-emerald-400', 
        cardBg: 'bg-emerald-50', // Low opacity background effect
      }; 
    default:
      return { 
        color: '#CBD5E1', 
        border: 'border-l-4 border-slate-300', 
        cardBg: 'bg-white',
      }; 
  }
};


const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    setFetching(true);
    complaintAPI
      .adminList()
      .then(({ data }) => setComplaints(data.complaints || []))
      .catch(() => toast.error('Unable to load admin complaints'))
      .finally(() => setFetching(false));
  }, [user]);

  const stats = useMemo(() => {
    const base = { total: complaints.length, pending: 0, inProgress: 0, resolved: 0 };
    complaints.forEach((complaint) => {
      if (complaint.status === 'pending') base.pending += 1;
      if (complaint.status === 'in-progress') base.inProgress += 1;
      if (complaint.status === 'resolved') base.resolved += 1;
    });
    return base;
  }, [complaints]);

  const handleUpdate = async (id, payload) => {
    try {
      const { data } = await complaintAPI.update(id, payload);
      setComplaints((prev) => prev.map((complaint) => (complaint._id === id ? data.complaint : complaint)));
      toast.success('Complaint updated successfully.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update complaint');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-base font-medium text-indigo-600 animate-pulse">Loading Dashboard...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const totalActive = stats.pending + stats.inProgress;

  const statusCards = [
    {
      title: 'Total Complaints',
      value: stats.total,
      sub: `Current workload: ${totalActive} active`,
    },
    {
      title: 'Active Queue',
      value: totalActive,
      sub: `${stats.pending} pending / ${stats.inProgress} in progress`,
    },
    {
      title: 'Resolved',
      value: stats.resolved,
      sub: 'Total closed in all time',
    },
    {
      title: 'Average Resolution',
      value: stats.total ? `${Math.max(1, Math.round((stats.total / (stats.resolved || 1)) * 0.7))} days` : 'N/A',
      sub: 'Est. time per resolution',
    },
  ];

  const infoChips = [
    { label: 'Avg. Citizen Rating', value: '4.8/5.0', color: 'bg-green-100 text-green-700' },
    { label: 'New Citizens', value: '961', color: 'bg-sky-100 text-sky-700' },
    { label: 'Active Projects', value: '770', color: 'bg-orange-100 text-orange-700' },
  ];

  const pieSegments = [
    { label: 'Pending', value: stats.pending, ...getStatusColors('pending') }, 
    { label: 'In Progress', value: stats.inProgress, ...getStatusColors('in-progress') }, 
    { label: 'Resolved', value: stats.resolved, ...getStatusColors('resolved') }, 
  ];
  
  const pieTotal = pieSegments.reduce((sum, seg) => sum + seg.value, 0) || 1;
  let accumulated = 0;
  const pieGradient = pieSegments
    .map((seg) => {
      const start = (accumulated / pieTotal) * 100;
      accumulated += seg.value;
      const end = (accumulated / pieTotal) * 100;
      return `${seg.color} ${start}% ${end}%`;
    })
    .join(', ');

  return (
    // Base container uses a tight font size and a clean gray background
    <section className="space-y-10 py-8 px-6 bg-slate-50 min-h-screen text-sm">
      
      {/* 1. Welcome Header Card - Sharp shadow and clear indigo branding */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-lg shadow-indigo-100/50">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Dashboard</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Operations Overview</h2>
            <p className="mt-1 text-xs text-slate-500">
              Welcome back, **{user.name}**. You have **{stats.pending}** critical complaints waiting for triage.
              Let's keep the city running smoothly.
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md transition-all duration-200 hover:bg-indigo-700 hover:shadow-lg"
          >
            View Full Reports
          </button>
        </div>
      </div>

      {/* 2. Status Cards Section (KPIs) - Defined borders and minimal padding */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {statusCards.map((card) => {
          const style = getStatusCardStyle(card.title);
          return (
            <div
              key={card.title}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-indigo-400"
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-8 w-8 items-center justify-center rounded-md ${style.color}`}>
                  {/* Icon placeholder (replace with actual icon component/library if needed) */}
                  <span className={`text-lg ${style.icon}`} /> 
                </span>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{card.title}</p>
              </div>
              <p className={`mt-3 text-3xl font-extrabold ${style.valueColor}`}>{card.value}</p>
              <p className={`mt-1 text-xs text-slate-500`}>{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* 3. Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        
        {/* LEFT COLUMN */}
        <div className="space-y-8">
          
          {/* Complaint Distribution Chart */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-800">Complaint Distribution</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">Live Status</span>
            </div>
            
            <div className="mt-6 flex flex-wrap items-center gap-10">
              <div className="relative h-40 w-40 rounded-full border-4 border-slate-100 shadow-inner">
                <div
                  className="h-full w-full rounded-full"
                  style={{ backgroundImage: `conic-gradient(${pieGradient})` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-slate-800">{stats.total}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {pieSegments.map((seg) => (
                  <div key={seg.label} className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: seg.color }} />
                    <p className="font-semibold text-slate-700">
                      {seg.label}{' '}
                      <span className="text-slate-400 font-normal">
                        ({seg.value} · {Math.round((seg.value / pieTotal) * 100) || 0}%)
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Complaints Queue */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-800">Complaints Queue ({totalActive} Active)</h3>
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100"
                onClick={() => {
                  setFetching(true);
                  complaintAPI
                    .adminList()
                    .then(({ data }) => setComplaints(data.complaints || []))
                    .catch(() => toast.error('Unable to refresh'))
                    .finally(() => setFetching(false));
                }}
              >
                {fetching ? 'Refreshing...' : 'Refresh List'}
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {complaints.length === 0 && !fetching ? (
                <div className="p-6 text-center rounded-lg bg-slate-50 border border-dashed border-slate-300">
                    <p className="text-sm text-slate-500">The active queue is clear. Well done.</p>
                </div>
              ) : (
                complaints.map((complaint) => (
                  // Apply dynamic background (low opacity) and border (the 'light')
                  <ComplaintCard 
                    key={complaint._id} 
                    complaint={complaint} 
                    onUpdate={handleUpdate} 
                    className={`
                      shadow-md hover:shadow-lg transition-shadow duration-200 
                      ${getStatusColors(complaint.status).cardBg} 
                      ${getStatusColors(complaint.status).border}
                    `}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          
          {/* User Profile Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-base font-bold text-white shadow-lg">
                {user.name
                  .split(' ')
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-indigo-600">Administrator</p>
                <h4 className="text-base font-bold text-slate-800">{user.name}</h4>
                <p className="text-xs text-slate-500">
                  {user.email}
                </p>
              </div>
            </div>
            
            <p className="mt-4 text-xs text-slate-600">
              "Review the queue, assign priorities, and close the loop with citizens."
            </p>
            <button
              type="button"
              className="mt-5 w-full rounded-lg bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-xl shadow-indigo-300/50 transition-all duration-200 hover:bg-indigo-700"
            >
              Write Citizen Announcement
            </button>
          </div>

          {/* KPI Highlights (Side Panel) - Stronger separators */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md">
            <h4 className="text-lg font-bold text-slate-800">Operational Highlights</h4>
            <div className="mt-5 space-y-4">
              {infoChips.map((chip) => (
                <div key={chip.label} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                  <div>
                    <p className="text-xs font-medium text-slate-500">{chip.label}</p>
                    <p className="text-xl font-bold text-slate-800">{chip.value}</p>
                  </div>
                  <span className={`rounded-md px-2.5 py-0.5 text-xs font-semibold ${chip.color}`}>Details</span>
                </div>
              ))}
            </div>
          </div>

          {/* Map Overview */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Live Map Overview</h3>
              {fetching && <p className="text-xs text-indigo-600">Refreshing...</p>}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Track all **{totalActive}** active complaints and spot hotspots.
            </p>
            <div className="mt-4 rounded-lg overflow-hidden border border-slate-200 shadow-inner">
              <MapView markers={complaints} height="260px" /> 
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;