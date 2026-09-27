import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiErrorMessage } from '../api/client';
import { useAuth } from '../auth/AuthProvider';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, user, loading, publicSignupEnabled } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate('/dashboard', { replace: true });
  }, [loading, navigate, user]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'Unable to sign in.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 grid place-items-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-7">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Task Manager</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Sign in</h1>
          <p className="mt-2 text-sm text-slate-500">Access your assigned work and team dashboard.</p>
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {publicSignupEnabled && (
          <p className="mt-6 text-center text-sm text-slate-500">
            Need an account?{' '}
            <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-700">Create one</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
