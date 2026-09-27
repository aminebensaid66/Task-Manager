import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiErrorMessage } from '../api/client';
import { useAuth } from '../auth/AuthProvider';

const Signup = () => {
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signup, user, loading, publicSignupEnabled } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate('/dashboard', { replace: true });
  }, [loading, navigate, user]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await signup({ email: form.email, password: form.password });
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'Unable to create the account.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && !publicSignupEnabled) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 grid place-items-center">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
          <h1 className="text-2xl font-bold text-slate-950">Account creation is managed by an administrator</h1>
          <p className="mt-3 text-slate-500">Ask your team administrator to create an employee account for you.</p>
          <Link to="/login" className="mt-6 inline-block font-semibold text-blue-600">Back to sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 grid place-items-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Task Manager</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Create account</h1>
        <p className="mt-2 text-sm text-slate-500">New self-service accounts are created as employees.</p>
        {error && <div className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input type="email" autoComplete="email" required value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Password
            <input type="password" autoComplete="new-password" required minLength={10} value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" />
            <span className="mt-1 block text-xs text-slate-500">At least 10 characters with upper/lowercase letters and a number.</span>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Confirm password
            <input type="password" autoComplete="new-password" required value={form.confirmPassword}
              onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" />
          </label>
          <button type="submit" disabled={submitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account? <Link to="/login" className="font-semibold text-blue-600">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
