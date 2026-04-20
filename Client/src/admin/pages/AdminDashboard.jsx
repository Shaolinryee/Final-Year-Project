import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FolderOpen, 
  CheckSquare, 
  Activity,
  TrendingUp,
  Server,
  AlertCircle,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon,
  RefreshCw,
  Calendar,
  Zap
} from 'lucide-react';
import { dashboardApi } from '../services/adminApi';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, healthResponse] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getHealth()
      ]);

      setStats(statsResponse.data.data);
      setHealth(healthResponse.data.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-sm text-gray-600">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
          <div className="flex items-center space-x-3">
            <AlertCircle className="text-red-600" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Dashboard Error</h3>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.stats?.totalUsers || 0,
      subtitle: `${stats?.stats?.activeUsers || 0} active`,
      icon: Users,
      color: 'blue',
      trend: '+12%',
      change: '+145'
    },
    {
      title: 'Total Projects',
      value: stats?.stats?.totalProjects || 0,
      subtitle: `${stats?.stats?.activeProjects || 0} active`,
      icon: FolderOpen,
      color: 'green',
      trend: '+8%',
      change: '+23'
    },
    {
      title: 'Total Tasks',
      value: stats?.stats?.totalTasks || 0,
      subtitle: `${stats?.stats?.taskCompletionRate || 0}% completed`,
      icon: CheckSquare,
      color: 'purple',
      trend: '+15%',
      change: '+89'
    },
    {
      title: 'System Health',
      value: health?.database?.status === 'connected' ? 'Healthy' : 'Warning',
      subtitle: `Uptime: ${Math.floor(health?.server?.uptime / 3600) || 0}h`,
      icon: Server,
      color: health?.database?.status === 'connected' ? 'green' : 'yellow',
      trend: 'Stable',
      change: null
    }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  const getStatCardColor = (color) => {
    const colorMap = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      yellow: 'bg-yellow-500'
    };
    return colorMap[color] || 'bg-gray-500';
  };

  const getStatCardBgColor = (color) => {
    const colorMap = {
      blue: 'bg-blue-50 border-blue-200',
      green: 'bg-green-50 border-green-200',
      purple: 'bg-purple-50 border-purple-200',
      yellow: 'bg-yellow-50 border-yellow-200'
    };
    return colorMap[color] || 'bg-gray-50 border-gray-200';
  };

  const getStatCardTextColor = (color) => {
    const colorMap = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      yellow: 'text-yellow-600'
    };
    return colorMap[color] || 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">System overview and analytics</p>
              </div>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div key={index} className={`border rounded-xl p-6 ${getStatCardBgColor(card.color)} hover:shadow-lg transition-shadow`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-600">{card.title}</p>
                        <div className={`p-2 rounded-lg ${getStatCardColor(card.color)} bg-opacity-10`}>
                          <Icon className={getStatCardTextColor(card.color)} size={16} />
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                        <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>
                      </div>
                      {card.change && (
                        <div className="flex items-center mt-3 text-sm">
                          <TrendingUpIcon className="text-green-600 mr-1" size={16} />
                          <span className="text-green-600 font-medium">{card.change}</span>
                          <span className="text-gray-500 ml-2">{card.trend} from last month</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

      {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* User Growth Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1" size={16} />
                  Last 30 days
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats?.charts?.userGrowth || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Project Growth Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Project Activity</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <BarChart3 className="mr-1" size={16} />
                  Last 30 days
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats?.charts?.projectGrowth || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill="#10B981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

      {/* Bottom Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Task Status Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Task Status</h3>
                <PieChartIcon className="text-gray-400" size={20} />
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats?.charts?.taskStats || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(stats?.charts?.taskStats || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 xl:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <Activity className="mr-1" size={16} />
                  Latest events
                </div>
              </div>
              <div className="space-y-3">
                {stats?.recentLogs?.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="p-2 rounded-lg bg-gray-100">
                      <Activity size={16} className="text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {log.action} on {log.resource}
                      </p>
                      <p className="text-xs text-gray-500">
                        {log.user?.name || 'System'} • {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {(!stats?.recentLogs || stats.recentLogs.length === 0) && (
                  <div className="text-center py-8">
                    <Activity className="mx-auto text-gray-400 mb-3" size={32} />
                    <p className="text-gray-500">No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* System Health */}
          {health && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
                <div className="flex items-center space-x-1">
                  <Zap className="text-green-600" size={16} />
                  <span className="text-sm text-green-600 font-medium">Operational</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200">
                  <Server size={20} className="text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Server</p>
                    <p className="text-sm text-gray-500">
                      Memory: {health.server?.memory?.used || 0}MB / {health.server?.memory?.total || 0}MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200">
                  <Activity size={20} className="text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Database</p>
                    <p className="text-sm text-gray-500">
                      Status: {health.database?.status || 'Unknown'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200">
                  <Clock size={20} className="text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Uptime</p>
                    <p className="text-sm text-gray-500">
                      {Math.floor(health.server?.uptime / 3600) || 0} hours
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
