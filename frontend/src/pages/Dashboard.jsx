import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, apiErrorMessage } from '../api/client';
import { useAuth } from '../auth/AuthProvider';
import TaskForm from '../components/ui/TaskForm';
import TaskList from '../components/ui/TaskList';
import UserList from '../components/ui/UserList';

const emptyResult = { items: [], total: 0, page: 1, limit: 20, totalPages: 1 };

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';
  const [result, setResult] = useState(emptyResult);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 });
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', overdue: '' });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasks = useCallback(async () => {
    const params = Object.fromEntries(
      Object.entries({ ...filters, page, limit: 20 }).filter(([, value]) => value !== ''),
    );
    const endpoint = isAdmin ? '/tasks' : '/tasks/my-tasks';
    const { data } = await api.get(endpoint, { params });
    setResult(data);
  }, [filters, isAdmin, page]);

  const fetchStats = useCallback(async () => {
    const { data } = await api.get('/tasks/stats');
    setStats(data);
  }, []);

  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;
    const { data } = await api.get('/users', { params: { limit: 100 } });
    setUsers(data.items);
  }, [isAdmin]);

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([fetchTasks(), fetchStats(), fetchUsers()]);
    } catch (requestError) {
      if (requestError?.response?.status === 401) {
        await logout();
        navigate('/login', { replace: true });
        return;
      }
      setError(apiErrorMessage(requestError, 'Unable to load the workspace.'));
    } finally {
      setLoading(false);
    }
  }, [fetchStats, fetchTasks, fetchUsers, logout, navigate]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const run = async (operation, fallbackMessage) => {
    setError('');
    try {
      return await operation();
    } catch (requestError) {
      setError(apiErrorMessage(requestError, fallbackMessage));
      throw requestError;
    }
  };

  const createTask = async (payload) => {
    await run(() => api.post('/tasks', payload), 'Unable to create the task.');
    setShowTaskForm(false);
    await reload();
  };

  const updateTask = async (payload) => {
    await run(() => api.patch(`/tasks/${selectedTask.id}`, payload), 'Unable to update the task.');
    setSelectedTask(null);
    await reload();
  };

  const deleteTask = async (task) => {
    if (!window.confirm(`Delete “${task.title}”? This action cannot be undone.`)) return;
    await run(() => api.delete(`/tasks/${task.id}`), 'Unable to delete the task.');
    await reload();
  };

  const assignTask = async (taskId, userId) => {
    const { data } = await run(
      () => api.patch(`/tasks/${taskId}/assign`, { userId }),
      'Unable to update task assignment.',
    );
    patchTask(data);
    await fetchStats();
  };

  const changeStatus = async (taskId, status) => {
    const { data } = await run(
      () => api.patch(`/tasks/${taskId}/status`, { status }),
      'Unable to update task status.',
    );
    patchTask(data);
    await fetchStats();
  };

  const addComment = async (taskId, text) => {
    await run(() => api.post(`/tasks/${taskId}/comments`, { text }), 'Unable to add comment.');
    await loadDetails(taskId);
  };

  const loadDetails = async (taskId) => {
    const { data } = await run(() => api.get(`/tasks/${taskId}`), 'Unable to load task details.');
    patchTask(data);
  };

  const patchTask = (updated) => {
    setResult((current) => ({
      ...current,
      items: current.items.map((task) => (task.id === updated.id ? updated : task)),
    }));
  };

  const createUser = async (payload) => {
    await run(() => api.post('/users', payload), 'Unable to create the user.');
    await fetchUsers();
  };

  const updateUser = async (id, payload) => {
    await run(() => api.patch(`/users/${id}`, payload), 'Unable to update the user.');
    await fetchUsers();
  };

  const signOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const cards = useMemo(
    () => [
      ['Total', stats.total],
      ['Pending', stats.pending],
      ['In progress', stats.inProgress],
      ['Completed', stats.completed],
      ['Overdue', stats.overdue],
    ],
    [stats],
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Task Manager</p>
            <h1 className="text-xl font-bold">{isAdmin ? 'Operations dashboard' : 'My work'}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{user.email}</p>
              <p className="text-xs text-slate-500">{isAdmin ? 'Administrator' : 'Employee'}</p>
            </div>
            <button onClick={signOut} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50">Sign out</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <span>{error}</span>
            <button onClick={() => setError('')} className="font-bold">×</button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {cards.map(([label, value]) => (
            <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <input placeholder="Search tasks…" value={filters.search}
              onChange={(event) => setFilters({ ...filters, search: event.target.value })}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />
            <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <select value={filters.priority} onChange={(event) => setFilters({ ...filters, priority: event.target.value })}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
              <option value="">All priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
            <select value={filters.overdue} onChange={(event) => setFilters({ ...filters, overdue: event.target.value })}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
              <option value="">All due dates</option>
              <option value="true">Overdue only</option>
            </select>
          </div>
          {isAdmin && (
            <button onClick={() => { setSelectedTask(null); setShowTaskForm(true); }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Create task
            </button>
          )}
        </div>

        {(showTaskForm || selectedTask) && isAdmin && (
          <div className="mt-5">
            <TaskForm task={selectedTask} users={users}
              onSubmit={selectedTask ? updateTask : createTask}
              onCancel={() => { setSelectedTask(null); setShowTaskForm(false); }} />
          </div>
        )}

        <div className={`mt-6 grid gap-6 ${isAdmin ? 'xl:grid-cols-[minmax(0,1fr)_320px]' : ''}`}>
          <section>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-slate-500">{result.total} task{result.total === 1 ? '' : 's'}</p>
              {loading && <p className="text-sm text-slate-500">Refreshing…</p>}
            </div>
            <TaskList tasks={result.items} users={users} isAdmin={isAdmin}
              onEdit={(task) => { setShowTaskForm(false); setSelectedTask(task); }}
              onDelete={deleteTask} onAssign={assignTask} onStatusChange={changeStatus}
              onAddComment={addComment} onLoadDetails={loadDetails} />

            {result.totalPages > 1 && (
              <div className="mt-5 flex items-center justify-center gap-3">
                <button disabled={page <= 1} onClick={() => setPage((value) => value - 1)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40">Previous</button>
                <span className="text-sm text-slate-500">Page {result.page} of {result.totalPages}</span>
                <button disabled={page >= result.totalPages} onClick={() => setPage((value) => value + 1)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40">Next</button>
              </div>
            )}
          </section>

          {isAdmin && (
            <UserList users={users} currentUserId={user.id} onCreate={createUser} onUpdate={updateUser} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
