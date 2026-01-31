import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-brand-dark py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-brand-light rounded-3xl shadow-2xl border border-brand-border p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">Dashboard</h1>
              <p className="text-text-secondary">
                Welcome back, {session?.user?.user_metadata?.full_name || session?.user?.email || 'User'}!
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all"
            >
              Sign Out
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-brand-dark/50 p-6 rounded-xl border border-brand-border">
              <h2 className="text-xl font-bold text-text-primary mb-2">User Info</h2>
              <p className="text-text-secondary text-sm mb-1">
                <span className="font-bold">Email:</span> {session?.user?.email}
              </p>
              <p className="text-text-secondary text-sm">
                <span className="font-bold">Name:</span> {session?.user?.user_metadata?.full_name || 'Not set'}
              </p>
            </div>

            <div className="bg-brand-dark/50 p-6 rounded-xl border border-brand-border">
              <h2 className="text-xl font-bold text-text-primary mb-2">Account Status</h2>
              <p className="text-text-secondary text-sm mb-1">
                <span className="font-bold">Status:</span> {session?.user?.email_confirmed_at ? 'Verified' : 'Pending'}
              </p>
              <p className="text-text-secondary text-sm">
                <span className="font-bold">Created:</span> {session?.user?.created_at ? new Date(session.user.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            <div className="bg-brand-dark/50 p-6 rounded-xl border border-brand-border">
              <h2 className="text-xl font-bold text-text-primary mb-2">Quick Actions</h2>
              <div className="flex flex-col gap-2 mt-4">
                <button className="px-4 py-2 bg-brand hover:opacity-90 text-white font-bold rounded-lg transition-all text-sm">
                  Create Task
                </button>
                <button className="px-4 py-2 bg-brand-dark border border-brand-border hover:bg-brand-dark/80 text-text-primary font-bold rounded-lg transition-all text-sm">
                  View Tasks
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
