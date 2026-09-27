import { useState } from 'react';

const UserList = ({ users, currentUserId, onCreate, onUpdate }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', role: 'EMPLOYEE' });
  const [submitting, setSubmitting] = useState(false);

  const create = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onCreate(form);
      setForm({ email: '', password: '', role: 'EMPLOYEE' });
      setShowCreate(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 p-4">
        <div>
          <h3 className="font-semibold text-slate-950">Team</h3>
          <p className="text-xs text-slate-500">{users.length} loaded accounts</p>
        </div>
        <button onClick={() => setShowCreate((value) => !value)} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700">
          {showCreate ? 'Cancel' : 'Add user'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={create} className="space-y-3 border-b border-slate-200 bg-slate-50 p-4">
          <input type="email" required placeholder="employee@example.com" value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />
          <input type="password" minLength={10} required placeholder="Temporary password" value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />
          <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
            <option value="EMPLOYEE">Employee</option>
            <option value="ADMIN">Administrator</option>
          </select>
          <button disabled={submitting} className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {submitting ? 'Creating…' : 'Create account'}
          </button>
        </form>
      )}

      <ul className="max-h-[560px] divide-y divide-slate-100 overflow-auto">
        {users.map((user) => {
          const self = user.id === currentUserId;
          return (
            <li key={user.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{user.email}</p>
                  <div className="mt-1 flex gap-2 text-xs">
                    <span className={user.isActive ? 'text-emerald-700' : 'text-slate-400'}>{user.isActive ? 'Active' : 'Inactive'}</span>
                    {self && <span className="text-blue-600">You</span>}
                  </div>
                </div>
                <select disabled={self} value={user.role}
                  onChange={(event) => onUpdate(user.id, { role: event.target.value })}
                  className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs disabled:opacity-50">
                  <option value="EMPLOYEE">Employee</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              {!self && (
                <button onClick={() => onUpdate(user.id, { isActive: !user.isActive })}
                  className={`mt-3 text-xs font-semibold ${user.isActive ? 'text-red-600' : 'text-emerald-700'}`}>
                  {user.isActive ? 'Deactivate account' : 'Reactivate account'}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default UserList;
