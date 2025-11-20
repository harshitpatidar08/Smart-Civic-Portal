import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { complaintAPI } from '../services/api';
import ComplaintCard from '../components/ComplaintCard';
import MapView from '../components/MapView';

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
      toast.success('Complaint updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update complaint');
    }
  };

  if (loading) {
    return <p className="text-center text-sm text-slate-500">Loading...</p>;
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const totalActive = stats.pending + stats.inProgress;

  const statusCards = [
    {
      title: 'Total Complaints',
      value: stats.total,
      sub: '+18% since last week',
    },
    {
      title: 'Active Queue',
      value: totalActive,
      sub: `${stats.pending} pending / ${stats.inProgress} in progress`,
    },
    {
      title: 'Resolved',
      value: stats.resolved,
      sub: 'Closed this month',
    },
    {
      title: 'Average Resolution',
      value: `${stats.total ? Math.max(1, Math.round((stats.resolved / (stats.total || 1)) * 7)) : 0} d`,
      sub: 'Across departments',
    },
  ];

  const infoChips = [
    { label: 'Total Profit', value: '₹1,012', color: 'bg-emerald-100 text-emerald-700' },
    { label: 'New Citizens', value: '961', color: 'bg-sky-100 text-sky-700' },
    { label: 'Active Projects', value: '770', color: 'bg-orange-100 text-orange-700' },
  ];

  const pieSegments = [
    { label: 'Pending', value: stats.pending, color: '#FFC93C' },
    { label: 'In Progress', value: stats.inProgress, color: '#3B82F6' },
    { label: 'Resolved', value: stats.resolved, color: '#16A34A' },
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
    <section className="space-y-8 text-[#0F172A]">
      <div className="rounded-2xl border border-[#DDE5F2] bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#2F6FED]">Dashboard</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Operations overview</h2>
            <p className="mt-1 text-sm text-slate-600">
              {user.name}, {stats.pending} complaints are waiting for triage. Let’s keep the city running smoothly.
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg border border-[#DDE5F2] px-5 py-2 text-sm font-semibold text-[#2F6FED] hover:bg-[#F6F9FF]"
          >
            View Reports
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statusCards.map((card) => (
          <div key={card.title} className="rounded-2xl border border-[#DDE5F2] bg-white p-5 shadow-sm">
            <p className="text-sm uppercase tracking-widest text-slate-500">{card.title}</p>
            <p className="mt-3 text-3xl font-bold text-[#2F6FED]">{card.value}</p>
            <p className="mt-2 text-sm text-slate-600">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#DDE5F2] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Complaint distribution</h3>
              <span className="text-xs text-slate-500">Live data</span>
            </div>
            <div className="mt-6 flex flex-wrap gap-6">
              <div
                className="h-40 w-40 rounded-full border border-[#DDE5F2]"
                style={{ backgroundImage: `conic-gradient(${pieGradient})` }}
              />
              <div className="space-y-3 text-sm">
                {pieSegments.map((seg) => (
                  <div key={seg.label} className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: seg.color }} />
                    <p className="font-medium text-[#0F172A]">
                      {seg.label}{' '}
                      <span className="text-slate-500">
                        ({seg.value} · {Math.round((seg.value / pieTotal) * 100) || 0}%)
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#DDE5F2] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Complaints queue</h3>
              <button
                type="button"
                className="rounded-lg border border-[#DDE5F2] px-3 py-1 text-xs font-semibold text-slate-500"
                onClick={() => {
                  setFetching(true);
                  complaintAPI
                    .adminList()
                    .then(({ data }) => setComplaints(data.complaints || []))
                    .catch(() => toast.error('Unable to refresh'))
                    .finally(() => setFetching(false));
                }}
              >
                Refresh
              </button>
            </div>
            <div className="mt-6 space-y-4">
              {complaints.length === 0 ? (
                <p className="text-sm text-slate-500">No complaints available.</p>
              ) : (
                complaints.map((complaint) => (
                  <ComplaintCard key={complaint._id} complaint={complaint} onUpdate={handleUpdate} />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-[#DDE5F2] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2F6FED] text-2xl font-semibold text-white">
                {user.name
                  .split(' ')
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Logged in</p>
                <h4 className="text-xl font-semibold text-slate-900">{user.name}</h4>
                <p className="text-sm text-slate-500">
                  {user.email} · <span className="capitalize">{user.role}</span>
                </p>
              </div>
            </div>
            <p className="mt-5 text-sm text-slate-500">
              “Thank you for keeping the city smart. Review the queue, assign priorities, and close the loop with
              citizens.”
            </p>
            <button
              type="button"
              className="mt-6 w-full rounded-lg bg-[#2F6FED] py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1f58c6]"
            >
              Write Announcement
            </button>
          </div>

          <div className="rounded-2xl border border-[#DDE5F2] bg-white p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-slate-900">KPI Highlights</h4>
            <div className="mt-5 space-y-4">
              {infoChips.map((chip) => (
                <div key={chip.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{chip.label}</p>
                    <p className="text-xl font-semibold text-slate-900">{chip.value}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${chip.color}`}>Today</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#DDE5F2] bg-white p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-slate-900">Heatmap overview</h4>
            <p className="mt-2 text-sm text-slate-500">42 wards connected · 7 new geotagged clusters this month.</p>
            <div className="mt-4 h-48 rounded-lg border border-dashed border-[#DDE5F2] bg-[#F6F9FF] text-center text-sm text-slate-400">
              <div className="flex h-full items-center justify-center">Heatmap visualization placeholder</div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#DDE5F2] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">City map overview</h3>
              {fetching && <p className="text-xs text-slate-500">Refreshing...</p>}
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Track all complaints on the live map and jump directly to hotspots.
            </p>
            <div className="mt-4">
              <MapView markers={complaints} height="320px" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;

