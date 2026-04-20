const cron = require('node-cron');
const { 
  AdminNotificationPreferences, 
  SystemNotification, 
  User,
  NotificationDeliveryLog 
} = require('../models');
const { sendAdminNotification } = require('../utils/adminNotification');

class NotificationScheduler {
  constructor() {
    this.jobs = new Map();
    this.isRunning = false;
  }

  /**
   * Start all notification scheduler jobs
   */
  start() {
    if (this.isRunning) {
      console.log('Notification scheduler already running');
      return;
    }

    console.log('Starting notification scheduler...');
    
    // Daily batch notifications - runs every day at 9 AM
    this.jobs.set('dailyBatch', cron.schedule('0 9 * * *', async () => {
      await this.processBatchNotifications('daily');
    }, {
      scheduled: true,
      timezone: 'UTC'
    }));

    // Weekly batch notifications - runs every Monday at 9 AM
    this.jobs.set('weeklyBatch', cron.schedule('0 9 * * 1', async () => {
      await this.processBatchNotifications('weekly');
    }, {
      scheduled: true,
      timezone: 'UTC'
    }));

    // Cleanup old notifications - runs every day at 2 AM
    this.jobs.set('cleanup', cron.schedule('0 2 * * *', async () => {
      await this.cleanupOldNotifications();
    }, {
      scheduled: true,
      timezone: 'UTC'
    }));

    // System health checks - runs every 15 minutes
    this.jobs.set('healthCheck', cron.schedule('*/15 * * * *', async () => {
      await this.performHealthChecks();
    }, {
      scheduled: true,
      timezone: 'UTC'
    }));

    // Process scheduled notifications - runs every minute
    this.jobs.set('scheduledNotifications', cron.schedule('* * * * *', async () => {
      await this.processScheduledNotifications();
    }, {
      scheduled: true,
      timezone: 'UTC'
    }));

    this.isRunning = true;
    console.log('Notification scheduler started successfully');
  }

  /**
   * Stop all scheduler jobs
   */
  stop() {
    console.log('Stopping notification scheduler...');
    
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`Stopped job: ${name}`);
    });
    
    this.jobs.clear();
    this.isRunning = false;
    console.log('Notification scheduler stopped');
  }

  /**
   * Process batch notifications for admins who prefer batched delivery
   */
  async processBatchNotifications(frequency) {
    try {
      console.log(`Processing ${frequency} batch notifications...`);
      
      // Get all admins who prefer batch notifications
      const admins = await User.findAll({
        where: { role: 'admin', isActive: true },
        include: [
          {
            model: AdminNotificationPreferences,
            as: 'notificationPreferences',
            where: { batchFrequency: frequency }
          }
        ]
      });

      for (const admin of admins) {
        const preferences = admin.notificationPreferences;
        await this.generateBatchSummary(admin, preferences, frequency);
      }

      console.log(`Completed ${frequency} batch notifications processing`);
    } catch (error) {
      console.error(`Error processing ${frequency} batch notifications:`, error);
    }
  }

  /**
   * Generate batch summary for an admin
   */
  async generateBatchSummary(admin, preferences, frequency) {
    try {
      const now = new Date();
      let startDate = new Date();

      // Calculate date range based on frequency
      if (frequency === 'daily') {
        startDate.setDate(now.getDate() - 1);
      } else if (frequency === 'weekly') {
        startDate.setDate(now.getDate() - 7);
      }

      // Get unread notifications for batch categories
      const batchCategories = preferences.batchCategories.length > 0 
        ? preferences.batchCategories 
        : ['system_alerts', 'user_management', 'system_health']; // Default categories for batching

      const notifications = await SystemNotification.findAll({
        where: {
          targetAllAdmins: true,
          category: batchCategories,
          priority: ['MEDIUM', 'LOW'], // Only batch medium and low priority
          createdAt: { [Op.gte]: startDate },
          [Op.not]: sequelize.literal(`"readBy" @> ARRAY['${admin.id}']`)
        },
        order: [['createdAt', 'DESC']]
      });

      if (notifications.length === 0) {
        return; // No notifications to batch
      }

      // Generate batch summary
      const summary = this.generateBatchSummaryContent(notifications, frequency);
      
      // Send batch notification
      await sendAdminNotification({
        type: 'batch_summary',
        category: 'global',
        priority: 'LOW',
        title: `${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Notification Summary`,
        message: summary.message,
        details: {
          frequency,
          notificationCount: notifications.length,
          categories: this.getNotificationCategories(notifications),
          notificationIds: notifications.map(n => n.id)
        },
        targetAdminIds: [admin.id],
        createdBy: null,
        source: 'notification_scheduler'
      });

      // Mark batched notifications as read
      await this.markNotificationsAsBatched(notifications.map(n => n.id), admin.id);

    } catch (error) {
      console.error(`Error generating batch summary for admin ${admin.id}:`, error);
    }
  }

  /**
   * Generate batch summary content
   */
  generateBatchSummaryContent(notifications, frequency) {
    const categories = this.getNotificationCategories(notifications);
    const priorityCount = this.getPriorityCount(notifications);
    
    let message = `You have ${notifications.length} notifications from the past ${frequency}:\n\n`;
    
    // Add category breakdown
    categories.forEach(category => {
      const count = notifications.filter(n => n.category === category).length;
      message += `  ${category}: ${count}\n`;
    });
    
    // Add priority breakdown
    message += `\nPriority levels:\n`;
    Object.entries(priorityCount).forEach(([priority, count]) => {
      message += `  ${priority}: ${count}\n`;
    });

    // Add recent notifications
    const recent = notifications.slice(0, 3);
    if (recent.length > 0) {
      message += `\nRecent notifications:\n`;
      recent.forEach(notification => {
        message += `  - ${notification.title}\n`;
      });
    }

    return { message };
  }

  /**
   * Get notification categories from array
   */
  getNotificationCategories(notifications) {
    const categories = [...new Set(notifications.map(n => n.category))];
    return categories;
  }

  /**
   * Get priority count from notifications
   */
  getPriorityCount(notifications) {
    return notifications.reduce((acc, notification) => {
      acc[notification.priority] = (acc[notification.priority] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Mark notifications as batched (processed in batch)
   */
  async markNotificationsAsBatched(notificationIds, adminId) {
    try {
      // Add to delivery log as batched
      for (const notificationId of notificationIds) {
        await NotificationDeliveryLog.create({
          notificationId,
          adminId,
          deliveryMethod: 'batch',
          status: 'delivered',
          sentAt: new Date(),
          deliveredAt: new Date(),
          metadata: { batched: true }
        });
      }
    } catch (error) {
      console.error('Error marking notifications as batched:', error);
    }
  }

  /**
   * Clean up old notifications and delivery logs
   */
  async cleanupOldNotifications() {
    try {
      console.log('Cleaning up old notifications...');
      
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

      // Delete expired notifications
      const expiredNotifications = await SystemNotification.destroy({
        where: {
          expiresAt: { [Op.lt]: new Date() }
        }
      });

      // Delete old delivery logs (older than 90 days)
      const oldDeliveryLogs = await NotificationDeliveryLog.destroy({
        where: {
          createdAt: { [Op.lt]: ninetyDaysAgo }
        }
      });

      // Archive old read notifications (older than 30 days)
      const oldNotifications = await SystemNotification.destroy({
        where: {
          createdAt: { [Op.lt]: thirtyDaysAgo },
          [Op.or]: [
            { readBy: { [Op.ne]: null } },
            { readBy: { [Op.ne]: [] } }
          ]
        }
      });

      console.log(`Cleanup completed: ${expiredNotifications} expired, ${oldNotifications} old notifications, ${oldDeliveryLogs} delivery logs deleted`);
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  /**
   * Perform system health checks and send notifications if needed
   */
  async performHealthChecks() {
    try {
      // Check database connection
      await this.checkDatabaseHealth();
      
      // Check storage space
      await this.checkStorageHealth();
      
      // Check memory usage
      await this.checkMemoryHealth();
      
      // Check CPU usage
      await this.checkCpuHealth();
      
    } catch (error) {
      console.error('Error during health checks:', error);
    }
  }

  /**
   * Check database health
   */
  async checkDatabaseHealth() {
    try {
      const startTime = Date.now();
      await User.findOne({ limit: 1 });
      const responseTime = Date.now() - startTime;

      // Alert if response time is > 5 seconds
      if (responseTime > 5000) {
        await sendAdminNotification({
          type: 'database_performance',
          category: 'system_health',
          priority: 'HIGH',
          title: 'Database Performance Issue',
          message: `Database response time is ${responseTime}ms (threshold: 5000ms)`,
          details: { responseTime, threshold: 5000 },
          targetAdminIds: null,
          source: 'health_monitor'
        });
      }
    } catch (error) {
      await sendAdminNotification({
        type: 'database_error',
        category: 'system_alerts',
        priority: 'CRITICAL',
        title: 'Database Connection Error',
        message: `Database connection failed: ${error.message}`,
        details: { error: error.message },
        targetAdminIds: null,
        source: 'health_monitor'
      });
    }
  }

  /**
   * Check storage health
   */
  async checkStorageHealth() {
    try {
      const { Attachment } = require('../models');
      const totalStorage = await Attachment.sum('fileSize') || 0;
      const totalCapacity = 5 * 1024 * 1024 * 1024; // 5GB
      const usagePercentage = (totalStorage / totalCapacity) * 100;

      if (usagePercentage > 80) {
        await sendAdminNotification({
          type: 'storage_warning',
          category: 'system_alerts',
          priority: usagePercentage > 95 ? 'CRITICAL' : 'HIGH',
          title: 'Storage Space Warning',
          message: `Storage usage is ${usagePercentage.toFixed(2)}%`,
          details: { 
            usagePercentage, 
            usedStorage: totalStorage, 
            totalCapacity,
            availableStorage: totalCapacity - totalStorage
          },
          targetAdminIds: null,
          source: 'health_monitor'
        });
      }
    } catch (error) {
      console.error('Error checking storage health:', error);
    }
  }

  /**
   * Check memory health
   */
  async checkMemoryHealth() {
    try {
      const memoryUsage = process.memoryUsage();
      const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
      const heapTotalMB = memoryUsage.heapTotal / 1024 / 1024;
      const usagePercentage = (heapUsedMB / heapTotalMB) * 100;

      if (usagePercentage > 85) {
        await sendAdminNotification({
          type: 'server_high_memory',
          category: 'system_alerts',
          priority: usagePercentage > 95 ? 'CRITICAL' : 'HIGH',
          title: 'High Memory Usage',
          message: `Memory usage is ${usagePercentage.toFixed(2)}%`,
          details: { 
            heapUsedMB, 
            heapTotalMB, 
            usagePercentage,
            serverName: process.env.HOSTNAME || 'unknown'
          },
          targetAdminIds: null,
          source: 'health_monitor'
        });
      }
    } catch (error) {
      console.error('Error checking memory health:', error);
    }
  }

  /**
   * Check CPU health (simplified)
   */
  async checkCpuHealth() {
    try {
      const cpuUsage = process.cpuUsage();
      const userCPU = cpuUsage.user / 1000000; // Convert to seconds
      const systemCPU = cpuUsage.system / 1000000;
      
      // This is a simplified check - in production you'd want more sophisticated CPU monitoring
      const loadAverage = require('os').loadavg()[0];
      
      if (loadAverage > 2.0) { // Alert if load average > 2.0
        await sendAdminNotification({
          type: 'server_high_cpu',
          category: 'system_alerts',
          priority: loadAverage > 4.0 ? 'CRITICAL' : 'HIGH',
          title: 'High CPU Usage',
          message: `System load average is ${loadAverage.toFixed(2)}`,
          details: { 
            loadAverage, 
            userCPU, 
            systemCPU,
            serverName: process.env.HOSTNAME || 'unknown'
          },
          targetAdminIds: null,
          source: 'health_monitor'
        });
      }
    } catch (error) {
      console.error('Error checking CPU health:', error);
    }
  }

  /**
   * Process scheduled notifications
   */
  async processScheduledNotifications() {
    try {
      const now = new Date();
      
      // Find notifications scheduled for now or earlier
      const scheduledNotifications = await SystemNotification.findAll({
        where: {
          scheduledFor: { [Op.lte]: now },
          createdAt: { [Op.lt]: now } // Don't process newly created ones
        },
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      for (const notification of scheduledNotifications) {
        // Send the notification
        await sendAdminNotification({
          type: notification.type,
          category: notification.category,
          priority: notification.priority,
          title: notification.title,
          message: notification.message,
          details: notification.details,
          targetAdminIds: notification.targetAdminIds,
          actionLink: notification.actionLink,
          createdBy: notification.createdBy,
          source: notification.source
        });

        // Mark as processed by clearing scheduledFor
        await notification.update({ scheduledFor: null });
      }

      if (scheduledNotifications.length > 0) {
        console.log(`Processed ${scheduledNotifications.length} scheduled notifications`);
      }
    } catch (error) {
      console.error('Error processing scheduled notifications:', error);
    }
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeJobs: Array.from(this.jobs.keys()),
      lastCheck: new Date()
    };
  }
}

// Create singleton instance
const notificationScheduler = new NotificationScheduler();

module.exports = notificationScheduler;
