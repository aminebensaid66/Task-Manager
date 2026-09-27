import { Link } from 'react-router-dom';

const Unauthorized = () => (
  <div className="min-h-screen grid place-items-center bg-slate-50 px-4">
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-widest text-red-600">403</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-950">Access denied</h1>
      <p className="mt-3 text-sm text-slate-500">Your account does not have permission to open this page.</p>
      <Link to="/dashboard" className="mt-6 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Return to dashboard</Link>
    </div>
  </div>
);

export default Unauthorized;
