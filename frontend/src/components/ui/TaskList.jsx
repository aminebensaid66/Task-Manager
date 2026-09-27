import { useState } from 'react';
import { format } from 'date-fns';

const statusLabel = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
};

const priorityClass = {
  HIGH: 'bg-red-50 text-red-700 ring-red-200',
  MEDIUM: 'bg-amber-50 text-amber-700 ring-amber-200',
  LOW: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

const statusClass = {
  PENDING: 'bg-slate-100 text-slate-700 ring-slate-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 ring-blue-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

const TaskList = ({
  tasks,
  users,
  isAdmin,
  onEdit,
  onDelete,
  onAssign,
  onStatusChange,
  onAddComment,
  onLoadDetails,
}) => {
  const [expandedId, setExpandedId] = useState(null);
  const [comments, setComments] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(null);

  const expand = async (task) => {
    if (expandedId === task.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(task.id);
    if (!task.comments) {
      setLoadingDetails(task.id);
      try {
        await onLoadDetails(task.id);
      } finally {
        setLoadingDetails(null);
      }
    }
  };

  const sendComment = async (taskId) => {
    const text = comments[taskId]?.trim();
    if (!text) return;
    await onAddComment(taskId, text);
    setComments((current) => ({ ...current, [taskId]: '' }));
  };

  if (!tasks.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <h3 className="font-semibold text-slate-900">No tasks match these filters</h3>
        <p className="mt-1 text-sm text-slate-500">Change the filters or create a new task.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const overdue = task.deadline && task.status !== 'COMPLETED' && new Date(task.deadline) < new Date();
        const expanded = expandedId === task.id;
        return (
          <article key={task.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => expand(task)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      expand(task);
                    }
                  }}
                  className="min-w-0 flex-1 cursor-pointer rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-expanded={expanded}
                >
                  <div className="mb-2 flex flex-wrap gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${priorityClass[task.priority]}`}>{task.priority}</span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClass[task.status]}`}>{statusLabel[task.status]}</span>
                    {overdue && <span className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white">Overdue</span>}
                  </div>
                  <h3 className="truncate text-lg font-semibold text-slate-950">{task.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
                    <span>Due: {task.deadline ? format(new Date(task.deadline), 'MMM d, yyyy') : 'No deadline'}</span>
                    <span>Assignee: {task.assignedTo?.email || 'Unassigned'}</span>
                    <span>{task._count?.comments ?? task.comments?.length ?? 0} comments</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isAdmin ? (
                    <>
                      <button onClick={() => onEdit(task)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Edit</button>
                      <button onClick={() => onDelete(task)} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">Delete</button>
                    </>
                  ) : (
                    <select value={task.status} onChange={(event) => onStatusChange(task.id, event.target.value)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  )}
                </div>
              </div>
            </div>

            {expanded && (
              <div className="border-t border-slate-200 bg-slate-50 p-4 sm:p-5">
                {loadingDetails === task.id ? (
                  <p className="text-sm text-slate-500">Loading task details…</p>
                ) : (
                  <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Description</h4>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{task.description || 'No description provided.'}</p>

                      <h4 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">Comments</h4>
                      <div className="mt-2 space-y-2">
                        {task.comments?.length ? task.comments.map((comment) => (
                          <div key={comment.id} className="rounded-lg border border-slate-200 bg-white p-3">
                            <div className="flex justify-between gap-3 text-xs text-slate-500">
                              <span className="font-semibold text-slate-700">{comment.author.email}</span>
                              <span>{format(new Date(comment.createdAt), 'MMM d, HH:mm')}</span>
                            </div>
                            <p className="mt-1 text-sm text-slate-700">{comment.text}</p>
                          </div>
                        )) : <p className="text-sm text-slate-500">No comments yet.</p>}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <input value={comments[task.id] || ''} maxLength={2000}
                          onChange={(event) => setComments((current) => ({ ...current, [task.id]: event.target.value }))}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' && !event.shiftKey) {
                              event.preventDefault();
                              sendComment(task.id);
                            }
                          }}
                          placeholder="Add a comment…"
                          className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" />
                        <button onClick={() => sendComment(task.id)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Send</button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {isAdmin && (
                        <label className="block text-sm font-medium text-slate-700">
                          Assignment
                          <select value={task.assignedToId || ''} onChange={(event) => onAssign(task.id, event.target.value || null)}
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                            <option value="">Unassigned</option>
                            {users.filter((user) => user.role === 'EMPLOYEE' && user.isActive).map((user) => (
                              <option key={user.id} value={user.id}>{user.email}</option>
                            ))}
                          </select>
                        </label>
                      )}
                      <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Recent activity</h4>
                        <div className="mt-2 space-y-2">
                          {task.activities?.length ? task.activities.slice(0, 8).map((activity) => (
                            <div key={activity.id} className="text-xs text-slate-600">
                              <span className="font-semibold">{activity.actor?.email || 'System'}</span>{' '}
                              {activity.type.toLowerCase().replaceAll('_', ' ')} · {format(new Date(activity.createdAt), 'MMM d, HH:mm')}
                            </div>
                          )) : <p className="text-sm text-slate-500">No activity available.</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
};

export default TaskList;
