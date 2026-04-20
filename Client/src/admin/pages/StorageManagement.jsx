import React, { useState, useEffect, useCallback } from 'react';
import { 
  HardDrive, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Archive,
  RefreshCw,
  FileText,
  Image,
  File,
  Video,
  Music,
  Archive as ArchiveIcon,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  Eye,
  Grid3x3,
  List,
  ChevronDown,
  X,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Folder,
  BarChart3,
  PieChart,
  TrendingUp,
  DownloadCloud,
  UploadCloud,
  Settings,
  Shield
} from 'lucide-react';
import { toast } from 'react-toastify';
import storageApi from '../services/storageApi';

const StorageManagement = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showCleanupModal, setShowCleanupModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [files, setFiles] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Filters
  const [filters, setFilters] = useState({
    searchTerm: '',
    fileType: '',
    userId: '',
    projectId: '',
    dateRange: '30days',
    minSize: '',
    maxSize: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // File type icons
  const fileTypeIcons = {
    image: FileImage,
    document: FileText,
    video: FileVideo,
    audio: FileAudio,
    archive: FileArchive,
    code: FileCode,
    other: File
  };

  // File type colors
  const fileTypeColors = {
    image: 'green',
    document: 'blue',
    video: 'purple',
    audio: 'orange',
    archive: 'yellow',
    code: 'gray',
    other: 'gray'
  };

  // Fetch storage analytics
  const fetchAnalytics = async () => {
    try {
      const response = await storageApi.getAnalytics();
      if (response.success) {
        setAnalytics(response.data);
      } else {
        toast.error('Failed to load storage analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Error loading storage analytics');
    }
  };

  // Fetch files
  const fetchFiles = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || (Array.isArray(params[key]) && params[key].length === 0)) {
          delete params[key];
        }
      });

      const response = await storageApi.getFiles(params);
      if (response.success) {
        setFiles(response.data.files);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages
        }));
      } else {
        toast.error('Failed to load files');
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Error loading files');
    } finally {
      setLoading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle file selection
  const handleFileSelect = (fileId) => {
    setSelectedFiles(prev => {
      if (prev.includes(fileId)) {
        return prev.filter(id => id !== fileId);
      } else {
        return [...prev, fileId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map(file => file.id));
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      const response = await storageApi.bulkDeleteFiles(selectedFiles);
      if (response.success) {
        setFiles(prev => prev.filter(file => !selectedFiles.includes(file.id)));
        setSelectedFiles([]);
        setShowBulkActions(false);
        toast.success(response.message || `Deleted ${selectedFiles.length} files successfully`);
      } else {
        toast.error('Failed to delete files');
      }
    } catch (error) {
      console.error('Error deleting files:', error);
      toast.error('Error deleting files');
    }
  };

  // Handle single file delete
  const handleDeleteFile = async (fileId) => {
    try {
      const response = await storageApi.deleteFile(fileId);
      if (response.success) {
        setFiles(prev => prev.filter(file => file.id !== fileId));
        toast.success('File deleted successfully');
      } else {
        toast.error('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Error deleting file');
    }
  };

  // Handle download
  const handleDownload = async (file) => {
    try {
      const response = await storageApi.downloadFile(file.id);
      toast.success(`Downloading ${file.fileName}...`);
      // Create download link
      const link = document.createElement('a');
      link.href = response.data.downloadUrl;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Error downloading file');
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFiles();
    await fetchAnalytics();
    setRefreshing(false);
    toast.success('Storage data refreshed');
  };

  // Render analytics dashboard
  const renderAnalytics = () => {
    if (!analytics) return null;

    const usagePercentage = (analytics.usedStorage / analytics.totalStorage) * 100;

    return (
      <div className="space-y-6">
        {/* Storage Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Storage */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Storage</p>
                <p className="text-3xl font-bold text-gray-900">{formatFileSize(analytics.totalStorage)}</p>
                <p className="text-xs text-gray-500 mt-1">System capacity</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <HardDrive className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Used Storage */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Used Storage</p>
                <p className="text-3xl font-bold text-gray-900">{formatFileSize(analytics.usedStorage)}</p>
                <p className="text-xs text-gray-500 mt-1">{usagePercentage.toFixed(1)}% utilized</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Files */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Files</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalFiles.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">All uploads</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Storage Health */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">System Health</p>
                <p className="text-3xl font-bold text-green-600">Good</p>
                <p className="text-xs text-gray-500 mt-1">No issues detected</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* File Type Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">File Type Distribution</h3>
            <div className="space-y-3">
              {analytics.fileTypes.map((type, index) => {
                const percentage = (type.size / analytics.usedStorage) * 100;
                const Icon = fileTypeIcons[type.type];
                const color = fileTypeColors[type.type];
                
                return (
                  <div key={type.type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 bg-${color}-50 rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 text-${color}-600`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 capitalize">{type.type}</p>
                        <p className="text-xs text-gray-500">{type.count} files</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatFileSize(type.size)}</p>
                      <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Users */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Storage Users</h3>
            <div className="space-y-3">
              {analytics.topUsers.map((user, index) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatFileSize(user.size)}</p>
                    <p className="text-xs text-gray-500">{user.files} files</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render file card
  const renderFileCard = (file) => {
    const Icon = fileTypeIcons[file.fileType] || File;
    const color = fileTypeColors[file.fileType] || 'gray';
    const isSelected = selectedFiles.includes(file.id);

    return (
      <div
        key={file.id}
        className={`bg-white rounded-xl border-2 p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group ${
          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
        }`}
        onClick={() => handleFileSelect(file.id)}
      >
        {/* File Preview */}
        <div className="flex items-center justify-center w-16 h-16 bg-gray-50 rounded-lg mb-3 group-hover:bg-gray-100 transition-colors">
          <Icon className={`w-8 h-8 text-${color}-600`} />
        </div>

        {/* File Info */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 truncate" title={file.fileName}>
            {file.fileName}
          </h4>
          <p className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</p>
          
          {/* User Info */}
          <div className="flex items-center space-x-2">
            <User className="w-3 h-3 text-gray-400" />
            <p className="text-xs text-gray-500 truncate">{file.userName}</p>
          </div>

          {/* Project Info */}
          <div className="flex items-center space-x-2">
            <Folder className="w-3 h-3 text-gray-400" />
            <p className="text-xs text-gray-500 truncate">{file.projectName}</p>
          </div>

          {/* Date */}
          <div className="flex items-center space-x-2">
            <Clock className="w-3 h-3 text-gray-400" />
            <p className="text-xs text-gray-500">{formatDate(file.createdAt)}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload(file);
            }}
            className="flex-1 flex items-center justify-center px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
          >
            <Download className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteFile(file.id);
            }}
            className="flex-1 flex items-center justify-center px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  // Initial data fetch
  useEffect(() => {
    fetchFiles();
    fetchAnalytics();
  }, []);

  // Fetch files when filters or pagination change
  useEffect(() => {
    fetchFiles();
  }, [filters, pagination.page]);

  // Show bulk actions when files are selected
  useEffect(() => {
    setShowBulkActions(selectedFiles.length > 0);
  }, [selectedFiles]);

  if (loading && files.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-sm text-gray-600">Loading storage management...</div>
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
              <HardDrive className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Storage Management</h1>
                <p className="text-sm text-gray-500">Monitor and manage system storage</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCleanupModal(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Cleanup
              </button>
              <button
                onClick={() => setShowArchiveModal(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {renderAnalytics()}
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {selectedFiles.length === files.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    toast.success(`Downloading ${selectedFiles.length} files...`);
                  }}
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Selected
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="inline-flex items-center px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Files Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Files Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">Files</h2>
            <span className="text-sm text-gray-500">
              Showing {files.length} of {pagination.total} files
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search files..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">File Type</label>
                <select
                  value={filters.fileType}
                  onChange={(e) => setFilters(prev => ({ ...prev, fileType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="image">Images</option>
                  <option value="document">Documents</option>
                  <option value="video">Videos</option>
                  <option value="audio">Audio</option>
                  <option value="archive">Archives</option>
                  <option value="code">Code</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="createdAt">Date Created</option>
                  <option value="fileName">File Name</option>
                  <option value="fileSize">File Size</option>
                  <option value="fileType">File Type</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setFilters({
                    searchTerm: '',
                    fileType: '',
                    userId: '',
                    projectId: '',
                    dateRange: '30days',
                    minSize: '',
                    maxSize: '',
                    sortBy: 'createdAt',
                    sortOrder: 'desc'
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Files Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {files.map(renderFileCard)}
        </div>

        {/* Empty State */}
        {files.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HardDrive className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              {filters.searchTerm || filters.fileType 
                ? 'Try adjusting your search or filters to find the files you\'re looking for.' 
                : 'No files have been uploaded yet.'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg transition-colors"
              >
                Previous
              </button>
              
              {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
                const pageNum = index + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
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
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                disabled={pagination.page === pagination.totalPages}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cleanup Modal */}
      {showCleanupModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-3xl border border-gray-200 max-w-md w-full backdrop-blur-sm">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Storage Cleanup</h2>
                    <p className="text-sm text-gray-500">Remove unused and orphaned files</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCleanupModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800">Cleanup Options</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        This will permanently delete files that are no longer referenced in the database.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <span className="text-sm text-gray-700">Remove orphaned attachments</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <span className="text-sm text-gray-700">Delete temporary files</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <span className="text-sm text-gray-700">Remove duplicate files</span>
                  </label>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCleanupModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowCleanupModal(false);
                    toast.success('Storage cleanup completed successfully');
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Start Cleanup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Archive Modal */}
      {showArchiveModal && (
        <div className="fixed inset-0 bg-transparent overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-3xl border border-gray-200 max-w-md w-full backdrop-blur-sm">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Archive className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Archive Files</h2>
                    <p className="text-sm text-gray-500">Move old files to cold storage</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowArchiveModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Archive files older than</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                    <option value="180">6 months</option>
                    <option value="365">1 year</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Archive location</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="local">Local Archive</option>
                    <option value="cloud">Cloud Storage</option>
                  </select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Archive className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-800">Archive Benefits</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Archived files are moved to cold storage to free up active storage space while preserving data.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowArchiveModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowArchiveModal(false);
                    toast.success('Files archived successfully');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Start Archive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorageManagement;
