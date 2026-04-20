import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
  Search, 
  Calendar, 
  Filter, 
  Download, 
  RefreshCw, 
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  User,
  Clock,
  Globe,
  Monitor,
  ChevronDown,
  ChevronUp,
  Eye,
  Archive,
  Trash2,
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  Shield,
  Settings,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import logsApi from '../services/logsApi';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Filters
  const [filters, setFilters] = useState({
    dateRange: '7days', // today, 7days, 30days, 90days, custom
    customStartDate: '',
    customEndDate: '',
    users: [],
    actions: [],
    resources: [],
    severities: [],
    categories: [],
    searchTerm: ''
  });

  // Available filter options
  const [filterOptions, setFilterOptions] = useState({
    users: [],
    actions: [],
    resources: [],
    severities: ['info', 'warning', 'error', 'critical'],
    categories: []
  });

  // Severity colors and icons
  const severityConfig = {
    info: { color: 'blue', icon: Info, label: 'Info' },
    warning: { color: 'yellow', icon: AlertTriangle, label: 'Warning' },
    error: { color: 'red', icon: XCircle, label: 'Error' },
    critical: { color: 'purple', icon: AlertTriangle, label: 'Critical' }
  };

  // Action type colors
  const actionColors = {
    create: 'green',
    update: 'blue',
    delete: 'red',
    login: 'purple',
    logout: 'gray',
    view: 'blue',
    export: 'green',
    import: 'orange',
    reset: 'red',
    suspend: 'orange',
    unsuspend: 'green'
  };

  // Resource icons
  const resourceIcons = {
    user: User,
    project: BarChart3,
    system: Settings,
    admin: Shield,
    task: Activity,
    permission: Shield
  };

  useEffect(() => {
    fetchLogs();
    fetchFilterOptions();
    fetchAnalytics();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [filters.dateRange, filters.customStartDate, filters.customEndDate, JSON.stringify(filters.users), JSON.stringify(filters.actions), JSON.stringify(filters.resources), JSON.stringify(filters.severities), JSON.stringify(filters.categories), filters.searchTerm, pagination.page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (Array.isArray(params[key]) && params[key].length === 0) {
          delete params[key];
        } else if (params[key] === '') {
          delete params[key];
        }
      });

      const response = await logsApi.getLogs(params);
      if (response.success) {
        setLogs(response.data.logs);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages
        }));
      } else {
        toast.error('Failed to load activity logs');
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Error loading activity logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const [usersRes, actionsRes, resourcesRes, categoriesRes] = await Promise.all([
        logsApi.getLogUsers(),
        logsApi.getLogActions(),
        logsApi.getLogResources(),
        logsApi.getLogCategories()
      ]);

      setFilterOptions({
        users: usersRes.success ? usersRes.data : [],
        actions: actionsRes.success ? actionsRes.data : [],
        resources: resourcesRes.success ? resourcesRes.data : [],
        severities: ['info', 'warning', 'error', 'critical'],
        categories: categoriesRes.success ? categoriesRes.data : []
      });
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      console.log('Fetching analytics...');
      const response = await logsApi.getAnalytics();
      console.log('Analytics response:', response);
      if (response.success) {
        console.log('Analytics data:', response.data);
        setAnalytics(response.data);
      } else {
        console.error('Analytics API failed:', response.message);
        // Set fallback data
        setAnalytics({
          totalLogs: 0,
          activeUsers: 0,
          criticalEvents: 0,
          errorRate: 0,
          actionDistribution: [],
          severityDistribution: [],
          topUsers: []
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Set fallback data
      setAnalytics({
        totalLogs: 0,
        activeUsers: 0,
        criticalEvents: 0,
        errorRate: 0,
        actionDistribution: [],
        severityDistribution: [],
        topUsers: []
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLogs();
    await fetchAnalytics();
    setRefreshing(false);
    toast.success('Activity logs refreshed');
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleLogClick = (log) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  const handleExport = async (format) => {
    try {
      const params = { ...filters, format };
      const response = await logsApi.exportLogs(params);
      if (response.success) {
        // Create download link
        const blob = new Blob([response.data], { 
          type: format === 'csv' ? 'text/csv' : 'application/json' 
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity-logs.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success(`Logs exported as ${format.toUpperCase()}`);
      }
    } catch (error) {
      console.error('Error exporting logs:', error);
      toast.error('Error exporting logs');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDuration = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const renderLogCard = (log, index) => {
    // Handle if log is a string or in unexpected format
    if (typeof log === 'string') {
      try {
        log = JSON.parse(log);
      } catch (e) {
        return (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-sm text-gray-600">
              <strong>Raw Log Data:</strong>
              <pre className="mt-2 text-xs bg-gray-50 p-3 rounded-lg overflow-x-auto">
                {log}
              </pre>
            </div>
          </div>
        );
      }
    }

    // Ensure log has required properties
    if (!log || typeof log !== 'object') {
      return (
        <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-sm text-gray-600">
            <strong>Invalid Log Format:</strong>
            <pre className="mt-2 text-xs bg-gray-50 p-3 rounded-lg overflow-x-auto">
              {JSON.stringify(log, null, 2)}
            </pre>
          </div>
        </div>
      );
    }

    const SeverityIcon = severityConfig[log.severity]?.icon || Info;
    const ResourceIcon = resourceIcons[log.resource] || FileText;
    const actionColor = actionColors[log.action] || 'gray';
    const severityColor = severityConfig[log.severity]?.color || 'gray';

    return (
      <div
        key={log.id || index}
        onClick={() => handleLogClick(log)}
        className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group"
      >
        <div className="flex items-start space-x-4">
          {/* Severity Icon */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-${severityColor}-50 border border-${severityColor}-200 flex items-center justify-center group-hover:scale-105 transition-transform`}>
            <SeverityIcon className={`w-5 h-5 text-${severityColor}-600`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-${actionColor}-50 text-${actionColor}-700 border border-${actionColor}-200`}>
                  {log.action || 'Unknown'}
                </span>
                <div className="flex items-center space-x-2">
                  <ResourceIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-semibold text-gray-900">{log.resource || 'Unknown'}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{formatDuration(log.createdAt)}</span>
              </div>
            </div>

            {/* User and Details */}
            <div className="mb-3">
              <div className="flex items-center space-x-3 text-sm mb-2">
                {log.user && (
                  <>
                    <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{log.user.name}</span>
                      <span className="text-gray-500">({log.user.email})</span>
                    </div>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {log.details?.description || `${log.action || 'Unknown'} ${log.resource || 'Unknown'}`}
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-4">
                <span className="font-medium">{formatDate(log.createdAt)}</span>
                {log.ipAddress && (
                  <div className="flex items-center space-x-1">
                    <Globe className="w-3 h-3" />
                    <span>{log.ipAddress}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 text-blue-600 group-hover:text-blue-700 transition-colors">
                <Eye className="w-3 h-3" />
                <span className="font-medium">View Details</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAnalytics = () => {
    if (!analytics) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Logs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Logs</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalLogs?.toLocaleString() || 0}</p>
              <p className="text-xs text-gray-500 mt-1">All time records</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Active Users</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.activeUsers || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Critical Events */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Critical Events</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.criticalEvents || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Requires attention</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Error Rate */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Error Rate</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.errorRate || 0}%</p>
              <p className="text-xs text-gray-500 mt-1">System health</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading && logs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-sm text-gray-600">Loading activity logs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Activity Logs</h1>
                <p className="text-sm text-gray-500">System-wide audit trail and activity monitoring</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>

              {/* Analytics Toggle */}
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`inline-flex items-center px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  showAnalytics 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </button>

              {/* Filters */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  showFilters 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {Object.values(filters).filter(v => 
                  (Array.isArray(v) ? v.length > 0 : v !== '') && v !== '7days'
                ).length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs">
                    {Object.values(filters).filter(v => 
                      (Array.isArray(v) ? v.length > 0 : v !== '') && v !== '7days'
                    ).length}
                  </span>
                )}
              </button>

              {/* Export */}
              <button
                onClick={() => setShowExportModal(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>

              {/* Refresh */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Analytics Overview</h2>
              <p className="text-sm text-gray-500">System activity metrics and trends</p>
            </div>
            {analyticsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              renderAnalytics()
            )}
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Filter Logs</h2>
              <p className="text-sm text-gray-500">Refine your log search with specific criteria</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Date Range */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="today">Today</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* Users */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Users</label>
                <select
                  value={filters.users[0] || ''}
                  onChange={(e) => handleFilterChange('users', e.target.value ? [e.target.value] : [])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">All Users</option>
                  {filterOptions.users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
                <select
                  value={filters.actions[0] || ''}
                  onChange={(e) => handleFilterChange('actions', e.target.value ? [e.target.value] : [])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">All Actions</option>
                  {filterOptions.actions.map(action => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>
              </div>

              {/* Resources */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Resources</label>
                <select
                  value={filters.resources[0] || ''}
                  onChange={(e) => handleFilterChange('resources', e.target.value ? [e.target.value] : [])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">All Resources</option>
                  {filterOptions.resources.map(resource => (
                    <option key={resource} value={resource}>
                      {resource}
                    </option>
                  ))}
                </select>
              </div>

              {/* Severities */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                <select
                  value={filters.severities[0] || ''}
                  onChange={(e) => handleFilterChange('severities', e.target.value ? [e.target.value] : [])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">All Severities</option>
                  {filterOptions.severities.map(severity => (
                    <option key={severity} value={severity}>
                      {severityConfig[severity]?.label || severity}
                    </option>
                  ))}
                </select>
              </div>

              {/* Categories */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                <select
                  value={filters.categories[0] || ''}
                  onChange={(e) => handleFilterChange('categories', e.target.value ? [e.target.value] : [])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">All Categories</option>
                  {filterOptions.categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setFilters({
                  dateRange: '7days',
                  customStartDate: '',
                  customEndDate: '',
                  users: [],
                  actions: [],
                  resources: [],
                  severities: [],
                  categories: [],
                  searchTerm: ''
                })}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">{logs.length}</span> of <span className="font-medium text-gray-900">{pagination.total}</span> logs
            </div>
            <div className="text-sm text-gray-500">
              Page <span className="font-medium text-gray-900">{pagination.page}</span> of <span className="font-medium text-gray-900">{pagination.totalPages}</span>
            </div>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Logs List */}
        {logs.length > 0 ? (
          <div className="space-y-4">
            {logs.map((log, index) => renderLogCard(log, index))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activity logs found</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              {Object.values(filters).some(v => (Array.isArray(v) ? v.length > 0 : v !== '')) 
                ? 'Try adjusting your filters or search terms to find the logs you\'re looking for.' 
                : 'No activity has been logged yet. Check back later for system activity.'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
              
              {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
                const pageNum = index + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 border text-sm font-medium transition-colors ${
                      pagination.page === pageNum
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {showDetailsModal && selectedLog && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-3xl border border-gray-200 max-w-4xl w-full max-h-[90vh] overflow-hidden backdrop-blur-sm">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Log Details</h2>
                    <p className="text-sm text-gray-500">Complete information about this activity event</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic Info */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      Event Information
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-${actionColors[selectedLog.action] || 'gray'}-50 text-${actionColors[selectedLog.action] || 'gray'}-700 border border-${actionColors[selectedLog.action] || 'gray'}-200`}>
                            {selectedLog.action}
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Resource</label>
                        <div className="flex items-center space-x-3">
                          {(() => {
                            const Icon = resourceIcons[selectedLog.resource] || FileText;
                            return <Icon className="w-5 h-5 text-gray-500" />;
                          })()}
                          <span className="text-gray-900 font-medium">{selectedLog.resource}</span>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                        <div className="flex items-center space-x-3">
                          {(() => {
                            const SeverityIcon = severityConfig[selectedLog.severity]?.icon || Info;
                            return <SeverityIcon className={`w-5 h-5 text-${severityConfig[selectedLog.severity]?.color || 'gray'}-600`} />;
                          })()}
                          <span className="text-gray-900 font-medium">{severityConfig[selectedLog.severity]?.label || selectedLog.severity}</span>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <span className="text-gray-900 font-medium">{selectedLog.category}</span>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Timestamp</label>
                        <span className="text-gray-900 font-medium">{formatDate(selectedLog.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User & Context */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      User & Context
                    </h3>
                    <div className="space-y-4">
                      {selectedLog.user && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">User</label>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <span className="text-gray-900 font-medium">{selectedLog.user.name}</span>
                              <span className="text-gray-500 block text-sm">({selectedLog.user.email})</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedLog.ipAddress && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">IP Address</label>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <Globe className="w-4 h-4 text-gray-600" />
                            </div>
                            <span className="text-gray-900 font-medium">{selectedLog.ipAddress}</span>
                          </div>
                        </div>
                      )}

                      {selectedLog.userAgent && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">User Agent</label>
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Monitor className="w-4 h-4 text-gray-600" />
                            </div>
                            <span className="text-gray-900 text-sm break-all">{selectedLog.userAgent}</span>
                          </div>
                        </div>
                      )}

                      {selectedLog.resourceId && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Resource ID</label>
                          <span className="text-gray-900 font-mono text-sm">{selectedLog.resourceId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Details JSON */}
              {selectedLog.details && (
                <div className="mt-8">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    Additional Details
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <pre className="text-sm text-gray-700 overflow-x-auto font-mono">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-3xl border border-gray-200 max-w-md w-full backdrop-blur-sm">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                    <Download className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Export Logs</h2>
                    <p className="text-sm text-gray-500">Choose your preferred export format</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-3">
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl text-left hover:bg-gray-50 hover:border-gray-300 transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                      <Download className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">CSV</div>
                      <div className="text-sm text-gray-500">Comma-separated values for spreadsheet applications</div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleExport('json')}
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl text-left hover:bg-gray-50 hover:border-gray-300 transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <Download className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">JSON</div>
                      <div className="text-sm text-gray-500">Structured data format for developers</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;
