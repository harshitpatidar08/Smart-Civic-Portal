import React from 'react';
import { Eye, CheckCircle, ShieldAlert } from 'lucide-react';
import { updateComplaintStatus } from '../services/api';

const ComplaintTable = ({ complaints, isAdmin = false }) => {

  const handleStatusUpdate = async (id, status) => {
    let payload = { status };

    if (status === 'resolved') {
      const imgUrl = prompt("Enter resolution image URL (simulating Supabase Storage upload)", "https://example.com/resolved.jpg");
      if (!imgUrl) return; // Cancelled
      payload.resolved_image_url = imgUrl;

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            payload.resolution_lat = pos.coords.latitude;
            payload.resolution_lng = pos.coords.longitude;
            try {
              const res = await updateComplaintStatus(id, payload);
              if (res.success) {
                alert(`Complaint ${id} successfully resolved and geo-verified.`);
                window.location.reload();
              }
            } catch (err) {
              alert(err.response?.data?.error || "Failed to resolve complaint.");
            }
          },
          () => alert("Geolocation strictly required to resolve complaints.")
        );
      } else {
        alert("Geolocation not supported by your browser.");
      }
    } else {
      try {
        const res = await updateComplaintStatus(id, payload);
        if (res.success) {
          alert(`Status updated to ${status}`);
          window.location.reload();
        }
      } catch (err) {
        alert(err.response?.data?.error || "Failed to update status.");
      }
    }
  };

  return (
    <div className="overflow-x-auto w-full glass-panel rounded-2xl shadow-xl">
      <table className="w-full text-left border-collapse text-sm">
        <thead className="bg-slate-900/5 text-slate-700 border-b border-slate-200/50 backdrop-blur-md">
          <tr>
            <th className="px-6 py-4 font-semibold">ID</th>
            <th className="px-6 py-4 font-semibold">Issue</th>
            <th className="px-6 py-4 font-semibold">Date</th>
            <th className="px-6 py-4 font-semibold text-center">Days Open</th>
            {isAdmin && <th className="px-6 py-4 font-semibold text-center">Priority</th>}
            <th className="px-6 py-4 font-semibold">Status</th>
            <th className="px-6 py-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {complaints.map((item) => {
            const daysOpen = Math.max(0, Math.floor((new Date() - new Date(item.created_at)) / (1000 * 60 * 60 * 24)));
            return (
            <tr key={item.id} className="hover:bg-white/40 transition-colors">
              <td className="px-6 py-4">
                <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                  #{String(item.id).substring(0, 6)}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="font-medium text-slate-900">{item.title}</div>
                <div className="text-slate-500 text-xs mt-1 capitalize">{item.category.replace('_', ' ')}</div>
              </td>
              <td className="px-6 py-4 text-slate-600 font-medium">
                {new Date(item.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-center">
                <span className={`font-bold ${daysOpen > 5 ? 'text-red-600' : daysOpen > 2 ? 'text-orange-600' : 'text-slate-600'}`}>
                  {daysOpen} {daysOpen === 1 ? 'day' : 'days'}
                </span>
              </td>
              {isAdmin && (
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    item.priority_score >= 8 || item.priority_score >= 30 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {item.priority_score}
                  </span>
                </td>
              )}
              <td className="px-6 py-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize border ${
                  item.status === 'resolved' ? 'bg-green-100 text-green-700 border-green-200' :
                  item.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                  item.status === 'escalated' ? 'bg-red-100 text-red-700 border-red-200' :
                  'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {item.status.replace('_', ' ')}
                </span>
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                {isAdmin ? (
                  <select 
                    onChange={(e) => handleStatusUpdate(item.id, e.target.value)}
                    className="text-xs bg-white border border-slate-300 rounded px-2 py-1 cursor-pointer focus:ring-primary-500 focus:border-primary-500"
                    defaultValue={item.status}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="escalated">Escalate</option>
                  </select>
                ) : (
                  <button className="p-1.5 text-slate-400 hover:text-primary-600 rounded-md hover:bg-primary-50 transition-colors">
                    <Eye className="w-5 h-5" />
                  </button>
                )}
              </td>
            </tr>
          );})}
          {complaints.length === 0 && (
            <tr>
              <td colSpan={isAdmin ? 7 : 6} className="px-6 py-12 text-center text-slate-500">
                No complaints found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ComplaintTable;
