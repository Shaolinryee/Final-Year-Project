const { Attachment, User, Task, Project } = require('../models');
const { Op, fn, col } = require('sequelize');

// Helper function to determine file type
const getFileType = (fileName) => {
  const ext = fileName.toLowerCase().split('.').pop();
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
  const documentExts = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
  const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
  const audioExts = ['mp3', 'wav', 'ogg', 'flac', 'aac'];
  const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz'];
  const codeExts = ['js', 'html', 'css', 'json', 'xml', 'py', 'java', 'cpp', 'c'];

  if (imageExts.includes(ext)) return 'image';
  if (documentExts.includes(ext)) return 'document';
  if (videoExts.includes(ext)) return 'video';
  if (audioExts.includes(ext)) return 'audio';
  if (archiveExts.includes(ext)) return 'archive';
  if (codeExts.includes(ext)) return 'code';
  return 'other';
};

// Get storage analytics
const getStorageAnalytics = async (req, res) => {
  try {
    console.log('Getting storage analytics...');
    
    // Get basic stats
    const totalFiles = await Attachment.count();
    const totalStorage = await Attachment.sum('fileSize') || 0;
    
    console.log(`Found ${totalFiles} files, total size: ${totalStorage}`);
    
    // Get file type distribution
    const allFiles = await Attachment.findAll({
      attributes: ['fileName', 'fileSize']
    });

    // Process file types in application code
    const fileTypeStats = {};
    allFiles.forEach(file => {
      const fileType = getFileType(file.fileName);
      if (!fileTypeStats[fileType]) {
        fileTypeStats[fileType] = { count: 0, size: 0 };
      }
      fileTypeStats[fileType].count++;
      fileTypeStats[fileType].size += file.fileSize || 0;
    });

    const fileTypes = Object.entries(fileTypeStats).map(([type, stats]) => ({
      type,
      count: stats.count,
      size: stats.size
    }));

    // Get top users by storage usage (simplified)
    const topUsers = await Attachment.findAll({
      attributes: ['userId', [fn('COUNT', col('Attachment.id')), 'files'], [fn('SUM', col('fileSize')), 'size']],
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }],
      group: ['userId', 'user.id'],
      order: [[fn('SUM', col('fileSize')), 'DESC']],
      limit: 5
    });

    // Mock storage capacity
    const totalCapacity = 5 * 1024 * 1024 * 1024; // 5GB
    const availableStorage = totalCapacity - totalStorage;
    
    // Simple growth trend (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentFiles = await Attachment.findAll({
      attributes: [[fn('DATE', col('createdAt')), 'date'], [fn('COUNT', col('id')), 'count'], [fn('SUM', col('fileSize')), 'size']],
      where: {
        createdAt: { [Op.gte]: thirtyDaysAgo }
      },
      group: [fn('DATE', col('createdAt'))],
      order: [[fn('DATE', col('createdAt')), 'ASC']]
    });

    const growthTrend = recentFiles.map(item => ({
      date: item.dataValues.date,
      size: parseInt(item.dataValues.size || 0)
    }));

    res.json({
      success: true,
      data: {
        totalStorage: totalCapacity,
        usedStorage: totalStorage,
        availableStorage,
        totalFiles,
        fileTypes,
        topUsers: topUsers.map(item => ({
          id: item.userId,
          name: item.user?.name || 'Unknown',
          email: item.user?.email || '',
          files: parseInt(item.dataValues.files || 0),
          size: parseInt(item.dataValues.size || 0)
        })),
        growthTrend,
        storageHealth: {
          status: totalStorage < totalCapacity * 0.8 ? 'healthy' : 'warning',
          warnings: totalStorage > totalCapacity * 0.8 ? ['Storage usage is above 80%'] : [],
          errors: totalStorage > totalCapacity * 0.95 ? ['Storage usage is critical'] : []
        }
      }
    });
  } catch (error) {
    console.error('Error getting storage analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get files with pagination and filtering
const getFiles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      searchTerm,
      fileType,
      userId,
      projectId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minSize,
      maxSize
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Build where clause
    if (searchTerm) {
      whereClause.fileName = {
        [Op.iLike]: `%${searchTerm}%`
      };
    }

    if (fileType) {
      // Simplified file type filtering
      const fileTypeExtensions = {
        image: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'],
        document: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
        video: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
        audio: ['mp3', 'wav', 'ogg', 'flac', 'aac'],
        archive: ['zip', 'rar', '7z', 'tar', 'gz'],
        code: ['js', 'html', 'css', 'json', 'xml', 'py', 'java', 'cpp', 'c']
      };
      
      const extensions = fileTypeExtensions[fileType];
      if (extensions && extensions.length > 0) {
        whereClause.fileName = {
          [Op.or]: extensions.map(ext => ({ [Op.like]: `%.${ext}` }))
        };
      } else {
        whereClause.fileName = { [Op.like]: `%${fileType}%` };
      }
    }

    if (userId) {
      whereClause.userId = userId;
    }

    if (minSize) {
      whereClause.fileSize = {
        ...whereClause.fileSize,
        [Op.gte]: parseInt(minSize)
      };
    }

    if (maxSize) {
      whereClause.fileSize = {
        ...whereClause.fileSize,
        [Op.lte]: parseInt(maxSize)
      };
    }

    // Get files with associations
    const { count, rows: files } = await Attachment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Task,
          as: 'task',
          attributes: ['id', 'title'],
          include: [
            {
              model: Project,
              as: 'project',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset
    });

    // Format response
    const formattedFiles = files.map(file => {
      const fileType = getFileType(file.fileName);
      return {
        id: file.id,
        fileName: file.fileName,
        fileType,
        fileSize: file.fileSize,
        fileUrl: file.fileUrl,
        userId: file.userId,
        userName: file.user?.name || 'Unknown',
        userEmail: file.user?.email || '',
        projectId: file.task?.project?.id || null,
        projectName: file.task?.project?.name || 'Unknown',
        taskId: file.taskId,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt
      };
    });

    res.json({
      success: true,
      data: {
        files: formattedFiles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting files:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get file details
const getFile = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await Attachment.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Task,
          as: 'task',
          attributes: ['id', 'title'],
          include: [
            {
              model: Project,
              as: 'project',
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: file.id,
        fileName: file.fileName,
        fileType: getFileType(file.fileName),
        fileSize: file.fileSize,
        fileUrl: file.fileUrl,
        userId: file.userId,
        userName: file.user?.name || 'Unknown',
        userEmail: file.user?.email || '',
        projectId: file.task?.project?.id || null,
        projectName: file.task?.project?.name || 'Unknown',
        taskId: file.taskId,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt
      }
    });
  } catch (error) {
    console.error('Error getting file:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Download file
const downloadFile = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await Attachment.findOne({ where: { id } });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Return file info for download
    res.json({
      success: true,
      data: {
        downloadUrl: file.fileUrl,
        fileName: file.fileName
      }
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete file
const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await Attachment.findOne({ where: { id } });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Delete the file from database
    await file.destroy();

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Bulk delete files
const bulkDeleteFiles = async (req, res) => {
  try {
    const { fileIds } = req.body;

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file IDs'
      });
    }

    const files = await Attachment.findAll({
      where: { id: { [Op.in]: fileIds } }
    });

    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No files found'
      });
    }

    // Delete files from database
    await Attachment.destroy({ where: { id: { [Op.in]: fileIds } } });

    res.json({
      success: true,
      message: `${files.length} files deleted successfully`
    });
  } catch (error) {
    console.error('Error bulk deleting files:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getStorageAnalytics,
  getFiles,
  getFile,
  downloadFile,
  deleteFile,
  bulkDeleteFiles
};
