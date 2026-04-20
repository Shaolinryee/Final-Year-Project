const { NotificationTemplate } = require('../models');

const defaultTemplates = [
  // System Alerts
  {
    type: 'server_high_cpu',
    category: 'system_alerts',
    name: 'High CPU Usage Alert',
    subject: 'Server High CPU Usage Warning',
    inAppTemplate: 'Server CPU usage is {{cpuUsage}}%. Threshold exceeded.',
    emailTemplate: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc3545; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">Server High CPU Usage Alert</h2>
        </div>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
          <p style="margin: 0 0 16px 0;">Server CPU usage has exceeded the threshold:</p>
          <div style="background: white; padding: 16px; border-radius: 6px; border-left: 4px solid #dc3545;">
            <p style="margin: 0;"><strong>Current Usage:</strong> {{cpuUsage}}%</p>
            <p style="margin: 8px 0 0 0;"><strong>Threshold:</strong> 80%</p>
            <p style="margin: 8px 0 0 0;"><strong>Server:</strong> {{serverName}}</p>
            <p style="margin: 8px 0 0 0;"><strong>Time:</strong> {{timestamp}}</p>
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <a href="{{actionLink}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Server Status
            </a>
          </div>
        </div>
      </div>
    `,
    smsTemplate: 'ALERT: Server CPU usage is {{cpuUsage}}% - {{serverName}}',
    variables: ['cpuUsage', 'serverName', 'timestamp', 'actionLink'],
    description: 'Alert when server CPU usage exceeds threshold'
  },
  {
    type: 'server_high_memory',
    category: 'system_alerts',
    name: 'High Memory Usage Alert',
    subject: 'Server High Memory Usage Warning',
    inAppTemplate: 'Server memory usage is {{memoryUsage}}%. Threshold exceeded.',
    emailTemplate: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #ffc107; color: black; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">Server High Memory Usage Alert</h2>
        </div>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
          <p style="margin: 0 0 16px 0;">Server memory usage has exceeded the threshold:</p>
          <div style="background: white; padding: 16px; border-radius: 6px; border-left: 4px solid #ffc107;">
            <p style="margin: 0;"><strong>Current Usage:</strong> {{memoryUsage}}%</p>
            <p style="margin: 8px 0 0 0;"><strong>Threshold:</strong> 85%</p>
            <p style="margin: 8px 0 0 0;"><strong>Server:</strong> {{serverName}}</p>
            <p style="margin: 8px 0 0 0;"><strong>Time:</strong> {{timestamp}}</p>
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <a href="{{actionLink}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Server Status
            </a>
          </div>
        </div>
      </div>
    `,
    smsTemplate: 'ALERT: Server memory usage is {{memoryUsage}}% - {{serverName}}',
    variables: ['memoryUsage', 'serverName', 'timestamp', 'actionLink'],
    description: 'Alert when server memory usage exceeds threshold'
  },
  {
    type: 'storage_warning',
    category: 'system_alerts',
    name: 'Storage Warning',
    subject: 'Storage Space Warning',
    inAppTemplate: 'Storage usage is {{storageUsage}}%. Only {{availableSpace}} remaining.',
    emailTemplate: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #fd7e14; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">Storage Space Warning</h2>
        </div>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
          <p style="margin: 0 0 16px 0;">Storage space is running low:</p>
          <div style="background: white; padding: 16px; border-radius: 6px; border-left: 4px solid #fd7e14;">
            <p style="margin: 0;"><strong>Current Usage:</strong> {{storageUsage}}%</p>
            <p style="margin: 8px 0 0 0;"><strong>Available Space:</strong> {{availableSpace}}</p>
            <p style="margin: 8px 0 0 0;"><strong>Total Capacity:</strong> {{totalCapacity}}</p>
            <p style="margin: 8px 0 0 0;"><strong>Time:</strong> {{timestamp}}</p>
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <a href="{{actionLink}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Manage Storage
            </a>
          </div>
        </div>
      </div>
    `,
    smsTemplate: 'WARNING: Storage usage {{storageUsage}}% - {{availableSpace}} remaining',
    variables: ['storageUsage', 'availableSpace', 'totalCapacity', 'timestamp', 'actionLink'],
    description: 'Alert when storage space is running low'
  },
  
  // User Management
  {
    type: 'user_registration',
    category: 'user_management',
    name: 'New User Registration',
    subject: 'New User Registered',
    inAppTemplate: 'New user {{userName}} ({{userEmail}}) has registered.',
    emailTemplate: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #28a745; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">New User Registration</h2>
        </div>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
          <p style="margin: 0 0 16px 0;">A new user has registered on the platform:</p>
          <div style="background: white; padding: 16px; border-radius: 6px; border-left: 4px solid #28a745;">
            <p style="margin: 0;"><strong>Name:</strong> {{userName}}</p>
            <p style="margin: 8px 0 0 0;"><strong>Email:</strong> {{userEmail}}</p>
            <p style="margin: 8px 0 0 0;"><strong>Registration Time:</strong> {{timestamp}}</p>
            <p style="margin: 8px 0 0 0;"><strong>IP Address:</strong> {{ipAddress}}</p>
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <a href="{{actionLink}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View User Details
            </a>
          </div>
        </div>
      </div>
    `,
    smsTemplate: 'New user: {{userName}} ({{userEmail}}) registered',
    variables: ['userName', 'userEmail', 'timestamp', 'ipAddress', 'actionLink'],
    description: 'Notification when a new user registers'
  },
  {
    type: 'user_suspension',
    category: 'user_management',
    name: 'User Suspension',
    subject: 'User Account Suspended',
    inAppTemplate: 'User {{userName}} has been {{action}} by {{adminName}}.',
    emailTemplate: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: {{#if isSuspension}}#dc3545{{else}}#28a745{{/if}}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">User Account {{#if isSuspension}}Suspended{{else}}Unsuspended{{/if}}</h2>
        </div>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
          <p style="margin: 0 0 16px 0;">User account has been {{action}}:</p>
          <div style="background: white; padding: 16px; border-radius: 6px; border-left: 4px solid {{#if isSuspension}}#dc3545{{else}}#28a745{{/if}};">
            <p style="margin: 0;"><strong>User:</strong> {{userName}} ({{userEmail}})</p>
            <p style="margin: 8px 0 0 0;"><strong>Action:</strong> {{action}}</p>
            <p style="margin: 8px 0 0 0;"><strong>By Admin:</strong> {{adminName}}</p>
            {{#if reason}}
            <p style="margin: 8px 0 0 0;"><strong>Reason:</strong> {{reason}}</p>
            {{/if}}
            <p style="margin: 8px 0 0 0;"><strong>Time:</strong> {{timestamp}}</p>
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <a href="{{actionLink}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View User Details
            </a>
          </div>
        </div>
      </div>
    `,
    smsTemplate: 'User {{userName}} {{action}} by {{adminName}}',
    variables: ['userName', 'userEmail', 'action', 'adminName', 'reason', 'timestamp', 'actionLink', 'isSuspension'],
    description: 'Notification when a user is suspended or unsuspended'
  },
  
  // Security Events
  {
    type: 'failed_login_attempt',
    category: 'security_events',
    name: 'Failed Login Attempt',
    subject: 'Security Alert: Failed Login Attempt',
    inAppTemplate: 'Multiple failed login attempts detected for {{userEmail}} from {{ipAddress}}.',
    emailTemplate: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc3545; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">Security Alert: Failed Login Attempt</h2>
        </div>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
          <p style="margin: 0 0 16px 0;">Multiple failed login attempts have been detected:</p>
          <div style="background: white; padding: 16px; border-radius: 6px; border-left: 4px solid #dc3545;">
            <p style="margin: 0;"><strong>Email:</strong> {{userEmail}}</p>
            <p style="margin: 8px 0 0 0;"><strong>IP Address:</strong> {{ipAddress}}</p>
            <p style="margin: 8px 0 0 0;"><strong>Attempts:</strong> {{attemptCount}}</p>
            <p style="margin: 8px 0 0 0;"><strong>Time:</strong> {{timestamp}}</p>
            <p style="margin: 8px 0 0 0;"><strong>User Agent:</strong> {{userAgent}}</p>
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <a href="{{actionLink}}" style="background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Review Security Logs
            </a>
          </div>
        </div>
      </div>
    `,
    smsTemplate: 'SECURITY: {{attemptCount}} failed logins for {{userEmail}} from {{ipAddress}}',
    variables: ['userEmail', 'ipAddress', 'attemptCount', 'timestamp', 'userAgent', 'actionLink'],
    description: 'Alert for multiple failed login attempts'
  },
  {
    type: 'permission_change',
    category: 'security_events',
    name: 'Permission Change',
    subject: 'Security Alert: Permission Changed',
    inAppTemplate: 'Permissions changed for {{userName}} by {{adminName}}.',
    emailTemplate: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #ffc107; color: black; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">Security Alert: Permission Changed</h2>
        </div>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
          <p style="margin: 0 0 16px 0;">User permissions have been modified:</p>
          <div style="background: white; padding: 16px; border-radius: 6px; border-left: 4px solid #ffc107;">
            <p style="margin: 0;"><strong>User:</strong> {{userName}} ({{userEmail}})</p>
            <p style="margin: 8px 0 0 0;"><strong>Changed By:</strong> {{adminName}}</p>
            <p style="margin: 8px 0 0 0;"><strong>Changes:</strong> {{changes}}</p>
            <p style="margin: 8px 0 0 0;"><strong>Time:</strong> {{timestamp}}</p>
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <a href="{{actionLink}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Review Permission Changes
            </a>
          </div>
        </div>
      </div>
    `,
    smsTemplate: 'SECURITY: Permissions changed for {{userName}} by {{adminName}}',
    variables: ['userName', 'userEmail', 'adminName', 'changes', 'timestamp', 'actionLink'],
    description: 'Alert when user permissions are changed'
  },
  
  // Admin Actions
  {
    type: 'system_setting_change',
    category: 'admin_actions',
    name: 'System Setting Changed',
    subject: 'System Setting Modified',
    inAppTemplate: 'System setting "{{settingName}}" changed by {{adminName}}.',
    emailTemplate: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #17a2b8; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">System Setting Modified</h2>
        </div>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
          <p style="margin: 0 0 16px 0;">A critical system setting has been modified:</p>
          <div style="background: white; padding: 16px; border-radius: 6px; border-left: 4px solid #17a2b8;">
            <p style="margin: 0;"><strong>Setting:</strong> {{settingName}}</p>
            <p style="margin: 8px 0 0 0;"><strong>Old Value:</strong> {{oldValue}}</p>
            <p style="margin: 8px 0 0 0;"><strong>New Value:</strong> {{newValue}}</p>
            <p style="margin: 8px 0 0 0;"><strong>Changed By:</strong> {{adminName}}</p>
            <p style="margin: 8px 0 0 0;"><strong>Time:</strong> {{timestamp}}</p>
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <a href="{{actionLink}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Review System Settings
            </a>
          </div>
        </div>
      </div>
    `,
    smsTemplate: 'Setting "{{settingName}}" changed by {{adminName}}',
    variables: ['settingName', 'oldValue', 'newValue', 'adminName', 'timestamp', 'actionLink'],
    description: 'Alert when critical system settings are changed'
  },
  {
    type: 'user_deletion',
    category: 'admin_actions',
    name: 'User Account Deleted',
    subject: 'User Account Deleted',
    inAppTemplate: 'User account for {{userName}} has been deleted by {{adminName}}.',
    emailTemplate: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc3545; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">User Account Deleted</h2>
        </div>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
          <p style="margin: 0 0 16px 0;">A user account has been permanently deleted:</p>
          <div style="background: white; padding: 16px; border-radius: 6px; border-left: 4px solid #dc3545;">
            <p style="margin: 0;"><strong>Deleted User:</strong> {{userName}} ({{userEmail}})</p>
            <p style="margin: 8px 0 0 0;"><strong>Deleted By:</strong> {{adminName}}</p>
            <p style="margin: 8px 0 0 0;"><strong>Reason:</strong> {{reason}}</p>
            <p style="margin: 8px 0 0 0;"><strong>Time:</strong> {{timestamp}}</p>
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <a href="{{actionLink}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Review User Management
            </a>
          </div>
        </div>
      </div>
    `,
    smsTemplate: 'User {{userName}} deleted by {{adminName}}',
    variables: ['userName', 'userEmail', 'adminName', 'reason', 'timestamp', 'actionLink'],
    description: 'Alert when a user account is deleted'
  },
  
  // System Health
  {
    type: 'backup_failure',
    category: 'system_health',
    name: 'Backup Failure',
    subject: 'System Backup Failed',
    inAppTemplate: 'System backup failed: {{errorMessage}}',
    emailTemplate: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc3545; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">System Backup Failed</h2>
        </div>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
          <p style="margin: 0 0 16px 0;">The scheduled system backup has failed:</p>
          <div style="background: white; padding: 16px; border-radius: 6px; border-left: 4px solid #dc3545;">
            <p style="margin: 0;"><strong>Backup Type:</strong> {{backupType}}</p>
            <p style="margin: 8px 0 0 0;"><strong>Error:</strong> {{errorMessage}}</p>
            <p style="margin: 8px 0 0 0;"><strong>Scheduled Time:</strong> {{scheduledTime}}</p>
            <p style="margin: 8px 0 0 0;"><strong>Failure Time:</strong> {{timestamp}}</p>
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <a href="{{actionLink}}" style="background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Review Backup Status
            </a>
          </div>
        </div>
      </div>
    `,
    smsTemplate: 'BACKUP FAILED: {{errorMessage}}',
    variables: ['backupType', 'errorMessage', 'scheduledTime', 'timestamp', 'actionLink'],
    description: 'Alert when system backup fails'
  },
  {
    type: 'performance_degradation',
    category: 'system_health',
    name: 'Performance Degradation',
    subject: 'System Performance Degradation',
    inAppTemplate: 'System performance degraded: {{metric}} is {{value}} (threshold: {{threshold}})',
    emailTemplate: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #fd7e14; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">System Performance Degradation</h2>
        </div>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
          <p style="margin: 0 0 16px 0;">System performance metrics are below acceptable thresholds:</p>
          <div style="background: white; padding: 16px; border-radius: 6px; border-left: 4px solid #fd7e14;">
            <p style="margin: 0;"><strong>Metric:</strong> {{metric}}</p>
            <p style="margin: 8px 0 0 0;"><strong>Current Value:</strong> {{value}}</p>
            <p style="margin: 8px 0 0 0;"><strong>Threshold:</strong> {{threshold}}</p>
            <p style="margin: 8px 0 0 0;"><strong>Server:</strong> {{serverName}}</p>
            <p style="margin: 8px 0 0 0;"><strong>Time:</strong> {{timestamp}}</p>
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <a href="{{actionLink}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Performance Metrics
            </a>
          </div>
        </div>
      </div>
    `,
    smsTemplate: 'PERFORMANCE: {{metric}} is {{value}} (threshold: {{threshold}})',
    variables: ['metric', 'value', 'threshold', 'serverName', 'timestamp', 'actionLink'],
    description: 'Alert when system performance degrades'
  },
  
  // Global Notifications
  {
    type: 'global_announcement',
    category: 'global',
    name: 'Global Announcement',
    subject: '{{title}}',
    inAppTemplate: '{{message}}',
    emailTemplate: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #007bff; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">{{title}}</h2>
        </div>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
          <div style="background: white; padding: 16px; border-radius: 6px; border-left: 4px solid #007bff;">
            <p style="margin: 0;">{{message}}</p>
          </div>
          {{#if actionLink}}
          <div style="text-align: center; margin-top: 20px;">
            <a href="{{actionLink}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Details
            </a>
          </div>
          {{/if}}
        </div>
      </div>
    `,
    smsTemplate: '{{title}}: {{message}}',
    variables: ['title', 'message', 'actionLink'],
    description: 'Global system announcements'
  }
];

async function createDefaultTemplates() {
  try {
    console.log('Creating default notification templates...');
    
    for (const template of defaultTemplates) {
      // Check if template already exists
      const existing = await NotificationTemplate.findOne({
        where: { 
          type: template.type, 
          category: template.category,
          language: 'en'
        }
      });
      
      if (!existing) {
        await NotificationTemplate.create({
          ...template,
          isDefault: true,
          language: 'en'
        });
        console.log(`Created template: ${template.name}`);
      } else {
        console.log(`Template already exists: ${template.name}`);
      }
    }
    
    console.log('Default notification templates created successfully!');
  } catch (error) {
    console.error('Error creating default templates:', error);
  }
}

// Run if called directly
if (require.main === module) {
  createDefaultTemplates();
}

module.exports = { createDefaultTemplates, defaultTemplates };
