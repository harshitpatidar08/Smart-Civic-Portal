const statusColors = {
  pending: 'bg-[#FFF2CE] text-[#C27A00]',
  'in-progress': 'bg-[#E1ECFF] text-[#1D4ED8]',
  resolved: 'bg-[#DCFCE7] text-[#15803D]',
};

const priorityColors = {
  low: 'bg-[#EEF2FF] text-[#3730A3]',
  medium: 'bg-[#FFEAD5] text-[#B45309]',
  high: 'bg-[#FFE4E6] text-[#BE123C]',
};

const ComplaintCard = ({ complaint, onUpdate }) => {
  const { issueTitle, description, category, status, priority, createdAt, imageUrl, createdBy } =
    complaint;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{issueTitle}</h3>
          <p className="text-sm text-slate-500">Category: {category}</p>
        </div>
        <div className="flex gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[status]}`}>
            {status}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityColors[priority]}`}
          >
            {priority} priority
          </span>
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-600 line-clamp-3">{description}</p>

      {imageUrl && (
        <img
          src={imageUrl}
          alt={issueTitle}
          className="mt-4 h-48 w-full rounded-xl object-cover"
          loading="lazy"
        />
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span>Submitted {new Date(createdAt).toLocaleDateString()}</span>
        {createdBy && <span>by {createdBy.name}</span>}
      </div>

      {onUpdate && (
        <div className="mt-4 flex flex-wrap gap-3">
          <select
            defaultValue={status}
            onChange={(e) => onUpdate(complaint._id, { status: e.target.value })}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            defaultValue={priority}
            onChange={(e) => onUpdate(complaint._id, { priority: e.target.value })}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="low">Low priority</option>
            <option value="medium">Medium priority</option>
            <option value="high">High priority</option>
          </select>
        </div>
      )}
    </article>
  );
};

export default ComplaintCard;

