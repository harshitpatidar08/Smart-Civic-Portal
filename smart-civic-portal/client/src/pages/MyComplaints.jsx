import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { complaintAPI } from '../services/api';
import ComplaintCard from '../components/ComplaintCard';

const MyComplaints = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFetching(true);
    complaintAPI
      .listByUser(user.id || user._id)
      .then(({ data }) => setComplaints(data.complaints || []))
      .catch(() => toast.error('Unable to load complaints'))
      .finally(() => setFetching(false));
  }, [user]);

  if (loading) {
    return <p className="text-center text-sm text-slate-500">Loading...</p>;
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-[#DDE5F2] bg-white p-8 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-[#0F172A]">Login required</h2>
        <p className="mt-2 text-sm text-slate-500">Please login to view complaint history.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/login"
            className="rounded-lg bg-[#2F6FED] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#1f58c6]"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-lg border border-[#2F6FED] px-5 py-2 text-sm font-semibold text-[#2F6FED]"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  const resolved = complaints.filter((c) => c.status === 'resolved').length;
  const pending = complaints.length - resolved;

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-[#DDE5F2] bg-[#E8F0FF]/70 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Your civic journal</p>
            <h2 className="text-3xl font-semibold text-[#0F172A]">My Complaints</h2>
            <p className="text-sm text-slate-600">Track every issue you&apos;ve raised with the municipality.</p>
          </div>
          <Link
            to="/report"
            className="rounded-lg bg-[#2F6FED] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1f58c6]"
          >
            Report new issue
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Total raised</p>
            <p className="text-2xl font-semibold text-[#2F6FED]">{complaints.length}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Resolved</p>
            <p className="text-2xl font-semibold text-[#16A34A]">{resolved}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Active queue</p>
            <p className="text-2xl font-semibold text-[#3B82F6]">{pending}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#DDE5F2] bg-white p-8 shadow-sm">
        {fetching ? (
          <p className="text-sm text-slate-500">Fetching complaints...</p>
        ) : complaints.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#DDE5F2] p-6 text-center text-sm text-slate-500">
            No complaints yet. Report your first issue!
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <ComplaintCard key={complaint._id} complaint={complaint} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MyComplaints;

