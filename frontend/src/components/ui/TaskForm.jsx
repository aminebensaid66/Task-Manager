import { useEffect, useState } from 'react';

const initial = {
  title: '',
  description: '',
  deadline: '',
  priority: 'MEDIUM',
  status: 'PENDING',
  assignedToId: '',
};

const TaskForm = ({ task, onSubmit, onCancel, users }) => {
  const [formData, setFormData] = useState(initial);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!task) {
      setFormData(initial);
      return;
    }
    setFormData({
      title: task.title || '',
      description: task.description || '',
      deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 10) : '',
      priority: task.priority || 'MEDIUM',
      status: task.status || 'PENDING',
      assignedToId: task.assignedToId || '',
    });
  }, [task]);

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        description: formData.description.trim() || null,
        deadline: formData.deadline || null,
        assignedToId: formData.assignedToId || null,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const field = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

  return (
    <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{task ? 'Edit task' : 'Create task'}</h3>
          <p className="text-sm text-slate-500">Keep ownership, priority, status, and due date explicit.</p>
        </div>
        <button type="button" onClick={onCancel} className="text-sm font-medium text-slate-500 hover:text-slate-900">Close</button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="md:col-span-2 text-sm font-medium text-slate-700">
          Title
          <input className={field} name="title" maxLength={160} required value={formData.title}
            onChange={(event) => setFormData({ ...formData, title: event.target.value })} />
        </label>
        <label className="md:col-span-2 text-sm font-medium text-slate-700">
          Description
          <textarea className={field} name="description" rows={4} maxLength={5000} value={formData.description}
            onChange={(event) => setFormData({ ...formData, description: event.target.value })} />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Deadline
          <input className={field} type="date" value={formData.deadline}
            onChange={(event) => setFormData({ ...formData, deadline: event.target.value })} />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Assignee
          <select className={field} value={formData.assignedToId}
            onChange={(event) => setFormData({ ...formData, assignedToId: event.target.value })}>
            <option value="">Unassigned</option>
            {users.filter((user) => user.role === 'EMPLOYEE' && user.isActive).map((user) => (
              <option key={user.id} value={user.id}>{user.email}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Priority
          <select className={field} value={formData.priority}
            onChange={(event) => setFormData({ ...formData, priority: event.target.value })}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Status
          <select className={field} value={formData.status}
            onChange={(event) => setFormData({ ...formData, status: event.target.value })}>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </label>
      </div>

      <div className="mt-5 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
        <button disabled={submitting} type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {submitting ? 'Saving…' : task ? 'Save changes' : 'Create task'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
