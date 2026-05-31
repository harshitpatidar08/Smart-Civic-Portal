import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Activity, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  in_progress: { label: 'In Progress', icon: Activity, bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  resolved: { label: 'Resolved', icon: CheckCircle, bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  escalated: { label: 'Escalated', icon: AlertTriangle, bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
};

const ComplaintCard = ({ complaint }) => {
  const cfg = statusConfig[complaint.status] || statusConfig.pending;
  const Icon = cfg.icon;

  return (
    <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 group flex flex-col">
      <div className="flex justify-between items-start mb-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
          <Icon className="w-3.5 h-3.5" /> {cfg.label}
        </span>
        <span className="text-xs font-semibold text-slate-400 capitalize bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
          {(complaint.category || '').replace('_', ' ')}
        </span>
      </div>

      <h3 className="text-base font-bold text-slate-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
        {complaint.title}
      </h3>
      <p className="text-slate-400 text-xs mb-4">
        {complaint.district} · {new Date(complaint.created_at).toLocaleDateString()}
      </p>

      <div className="mt-auto">
        <Link
          to={`/dashboard/track?id=${complaint.id}`}
          className="flex items-center justify-center gap-1.5 w-full px-4 py-2 text-sm font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors border border-primary-100"
        >
          View Details <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default ComplaintCard;
