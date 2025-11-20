import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { complaintAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MapView from '../components/MapView';

const ComplaintDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    complaintAPI
      .getById(id)
      .then(({ data }) => setComplaint(data.complaint))
      .catch(() => toast.error('Unable to load complaint'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (payload) => {
    try {
      const { data } = await complaintAPI.update(id, payload);
      setComplaint(data.complaint);
      toast.success('Complaint updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  if (loading || !complaint) {
    return <p className="text-sm text-slate-500">Loading complaint...</p>;
  }

  const statusColor =
    complaint.status === 'resolved'
      ? 'bg-emerald-100 text-emerald-700'
      : complaint.status === 'in-progress'
      ? 'bg-sky-100 text-sky-700'
      : 'bg-amber-100 text-amber-700';

  const priorityColor =
    complaint.priority === 'high'
      ? 'bg-rose-100 text-rose-700'
      : complaint.priority === 'medium'
      ? 'bg-indigo-100 text-indigo-700'
      : 'bg-slate-100 text-slate-700';

  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 p-6 text-white shadow-lg shadow-slate-300">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/70">Complaint details</p>
            <h2 className="text-3xl font-semibold">{complaint.issueTitle}</h2>
            <p className="text-sm text-white/70">Category: {complaint.category}</p>
          </div>
          <div className="flex gap-3">
            <span className={`rounded-full px-4 py-2 text-sm capitalize ${statusColor}`}>{complaint.status}</span>
            <span className={`rounded-full px-4 py-2 text-sm capitalize ${priorityColor}`}>
              {complaint.priority} priority
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-100">
        <p className="text-sm text-slate-700">{complaint.description}</p>

        {complaint.imageUrl && (
          <img
            src={complaint.imageUrl}
            alt={complaint.issueTitle}
            className="mt-6 max-h-96 w-full rounded-2xl object-cover"
          />
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 p-4 text-sm text-slate-600">
            <p>
              Reported by: <span className="font-semibold text-slate-900">{complaint.createdBy?.name}</span>
            </p>
            <p className="mt-2">
              Submitted on:{' '}
              <span className="font-medium text-slate-900">{new Date(complaint.createdAt).toLocaleString()}</span>
            </p>
            <p className="mt-2">
              Last updated:{' '}
              <span className="font-medium text-slate-900">{new Date(complaint.updatedAt).toLocaleString()}</span>
            </p>
          </div>
          <div>
            <MapView
              markers={[
                {
                  lat: complaint.latitude,
                  lng: complaint.longitude,
                  title: complaint.issueTitle,
                },
              ]}
              height="260px"
            />
          </div>
        </div>

        {user?.role === 'admin' && (
          <div className="mt-6 flex flex-wrap gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Update status</label>
              <select
                defaultValue={complaint.status}
                onChange={(event) => handleUpdate({ status: event.target.value })}
                className="mt-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Update priority</label>
              <select
                defaultValue={complaint.priority}
                onChange={(event) => handleUpdate({ priority: event.target.value })}
                className="mt-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ComplaintDetails;

