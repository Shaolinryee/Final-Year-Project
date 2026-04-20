import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Bell,
  Mail,
  Smartphone,
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { notificationsApi } from '../services/notificationsApi';

const NotificationAnalytics = ({ dateRange = '7days' }) => {
  const [stats, setStats] = useState(null);
  const [deliveryStats, setDeliveryStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const [statsResponse, deliveryResponse] = await Promise.all([
        notificationsApi.getStats(),
        notificationsApi.getDeliveryStats({ dateRange })
      ]);

      if (statsResponse.data?.data) {
        setStats(statsResponse.data.data);
      }
      
      if (deliveryResponse.data) {
        setDeliveryStats(deliveryResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for charts
  const preparePriorityData = () => {
    if (!stats?.priorityDistribution) return [];
    
    return stats.priorityDistribution.map(item => ({
      priority: item.priority,
      count: parseInt(item.count)
    }));
  };

  const prepareDeliveryData = () => {
    const deliveryData = {};
    
    deliveryStats.forEach(stat => {
      const method = stat.deliveryMethod;
      const status = stat.status;
      const count = parseInt(stat.count);
      
      if (!deliveryData[method]) {
        deliveryData[method] = { method, sent: 0, delivered: 0, failed: 0 };
      }
      
      deliveryData[method][status] = count;
    });
    
    return Object.values(deliveryData);
  };

  const COLORS = {
    CRITICAL: '#dc3545',
    HIGH: '#fd7e14', 
    MEDIUM: '#007bff',
    LOW: '#28a745'
  };

  const DELIVERY_COLORS = {
    sent: '#007bff',
    delivered: '#28a745',
    failed: '#dc3545'
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const priorityData = preparePriorityData();
  const deliveryData = prepareDeliveryData();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Notification Analytics</h2>
        <p className="text-gray-600 mt-1">Monitor notification performance and delivery metrics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Notifications</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.total || 0}</p>
              <div className="flex items-center mt-2 text-sm">
                {stats?.recentActivity > 0 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600">{stats?.recentActivity || 0} recent</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    <span className="text-red-600">No recent activity</span>
                  </>
                )}
              </div>
            </div>
            <Bell className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unread</p>
              <p className="text-3xl font-bold text-orange-600">{stats?.unread || 0}</p>
              {stats?.total > 0 && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{ width: `${stats?.total > 0 ? (stats.unread / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Delivery Rate</p>
              <p className="text-3xl font-bold text-green-600">
                {deliveryData.length > 0 
                  ? Math.round((deliveryData.reduce((acc, item) => acc + item.delivered, 0) / 
                      deliveryData.reduce((acc, item) => acc + item.sent, 0)) * 100)
                  : 0}%
              </p>
              {deliveryData.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  {deliveryData.reduce((acc, item) => acc + item.delivered, 0)} / {deliveryData.reduce((acc, item) => acc + item.sent, 0)} delivered
                </div>
              )}
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Failed Deliveries</p>
              <p className="text-3xl font-bold text-red-600">{deliveryData.reduce((acc, item) => acc + item.failed, 0)}</p>
              {deliveryData.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  {Math.round((deliveryData.reduce((acc, item) => acc + item.failed, 0) / 
                      deliveryData.reduce((acc, item) => acc + item.sent, 0)) * 100)}% failure rate
                </div>
              )}
            </div>
            <Activity className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Priority Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="priority" />
              <YAxis />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Bar dataKey="count" fill="#007bff">
                {priorityData.map((entry) => (
                  <Cell key={`cell-${entry.priority}`} fill={COLORS[entry.priority]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Delivery Methods */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Methods Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deliveryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="method" />
              <YAxis />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Bar dataKey="sent" fill="#007bff" name="Sent" />
              <Bar dataKey="delivered" fill="#28a745" name="Delivered" />
              <Bar dataKey="failed" fill="#dc3545" name="Failed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Delivery Stats Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Delivery Statistics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deliveryData.map((item) => (
                <React.Fragment key={item.method}>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        {item.method === 'in_app' && <Bell className="w-4 h-4 text-blue-500" />}
                        {item.method === 'email' && <Mail className="w-4 h-4 text-green-500" />}
                        {item.method === 'sms' && <Smartphone className="w-4 h-4 text-purple-500" />}
                        {item.method.replace('_', ' ').charAt(0).toUpperCase() + item.method.slice(1).replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        Sent
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.sent}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }} />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap"></td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Delivered
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.delivered}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${item.sent > 0 ? (item.delivered / item.sent) * 100 : 0}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap"></td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        Failed
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.failed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${item.sent > 0 ? (item.failed / item.sent) * 100 : 0}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NotificationAnalytics;
