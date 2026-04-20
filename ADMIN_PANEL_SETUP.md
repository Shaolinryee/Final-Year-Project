# Admin Panel Setup Guide

## Overview
The Admin Panel provides comprehensive administrative capabilities for the Task Management System, including user management, system monitoring, analytics, and more.

## Features Implemented

### ✅ Phase 1: Foundation
- **Database Schema**: Admin roles, permissions, system logs, and settings tables
- **Authentication**: Admin-specific authentication middleware with role-based access
- **Permission System**: Granular permission checking with audit logging
- **Admin Layout**: Professional sidebar navigation with responsive design
- **Dashboard**: Real-time system statistics and health monitoring

### ✅ Phase 2: Core Features
- **User Management**: Complete user administration with search, filtering, and bulk operations
- **System Settings**: Global configuration management
- **Activity Logging**: Comprehensive audit trail for all admin actions

## Database Setup

### 1. Run the Seeding Script
```bash
cd Server
node src/scripts/seedAdminData.js
```

This script creates:
- Default admin permissions (17 permissions across User, Project, System, and Admin categories)
- Admin roles (Super Admin, Administrator, Support Staff, Read Only)
- Default system settings
- Default admin user: `admin@taskmanager.com` / `password`

### 2. Database Tables Created
- `admin_roles` - Role definitions with permission associations
- `admin_permissions` - Granular permissions for different resources
- `admin_role_permissions` - Many-to-many relationship table
- `system_logs` - Audit trail for all admin actions
- `system_settings` - Global system configuration

## Accessing the Admin Panel

### 1. Start Both Servers
```bash
# Terminal 1: Backend
cd Server
npm start

# Terminal 2: Frontend
cd Client
npm run dev
```

### 2. Login as Admin
- Navigate to `http://localhost:5173/login`
- Login with: `admin@taskmanager.com` / `password`
- After login, navigate to `http://localhost:5173/admin`

### 3. Admin Panel Routes
- **Dashboard**: `/admin/dashboard` - System overview and statistics
- **User Management**: `/admin/users` - User administration interface
- **Settings**: `/admin/settings` - System configuration (coming soon)
- **Analytics**: `/admin/analytics` - Reports and insights (coming soon)

## Permission System

### Role Hierarchy
1. **Super Admin** (Level 3) - Full system access
2. **Administrator** (Level 2) - Most administrative functions
3. **Support Staff** (Level 1) - Limited access for support tasks
4. **Read Only** (Level 0) - View-only access

### Permission Categories
- **User Management**: users:read, users:create, users:update, users:delete, users:suspend, users:assign_role
- **Project Management**: projects:read, projects:update, projects:delete, projects:archive
- **System Management**: system:read_logs, system:manage_settings, system:view_analytics, system:manage_storage
- **Admin Management**: admin:manage_roles, admin:manage_permissions, admin:view_audit_logs

## API Endpoints

### Authentication
All admin endpoints require:
- Valid JWT token in Authorization header
- User must have `role: 'admin'`
- Specific permissions for each action

### Dashboard
- `GET /api/admin/dashboard/stats` - System statistics
- `GET /api/admin/dashboard/health` - System health information

### User Management
- `GET /api/admin/users` - Get all users with pagination and search
- `GET /api/admin/users/admin` - Get admin users only
- `POST /api/admin/users/:id/suspend` - Suspend a user
- `POST /api/admin/users/:id/unsuspend` - Unsuspend a user
- `POST /api/admin/users/:id/role` - Assign admin role to user

### System Settings
- `GET /api/admin/settings` - Get system settings
- `PUT /api/admin/settings` - Update system setting

## Security Features

### Authentication & Authorization
- JWT-based authentication with admin role verification
- Permission-based access control for all admin actions
- Automatic audit logging for sensitive operations

### Audit Trail
All admin actions are logged with:
- User ID and action performed
- Resource type and ID
- Timestamp and IP address
- Request details and user agent

### Input Validation
- Server-side validation for all inputs
- SQL injection prevention via Sequelize ORM
- XSS protection with proper data sanitization

## Frontend Components

### Admin Layout (`/admin/components/AdminLayout.jsx`)
- Responsive sidebar navigation
- User menu with logout functionality
- Breadcrumb navigation
- Permission-based menu item visibility

### Dashboard (`/admin/pages/AdminDashboard.jsx`)
- Real-time statistics cards
- Interactive charts (user growth, project growth, task status)
- System health monitoring
- Recent activity feed

### User Management (`/admin/pages/UserManagement.jsx`)
- Searchable and filterable user table
- Bulk user operations
- User status management (suspend/unsuspend)
- Role assignment interface

## Development Notes

### File Structure
```
Server/src/
├── admin/
│   ├── controllers/adminController.js
│   ├── middleware/adminAuth.js
│   ├── middleware/adminPermissions.js
│   └── routes/adminRoutes.js
├── models/
│   ├── AdminRole.js
│   ├── AdminPermission.js
│   ├── SystemLog.js
│   └── SystemSetting.js
└── scripts/seedAdminData.js

Client/src/admin/
├── components/AdminLayout.jsx
├── pages/AdminDashboard.jsx
├── pages/UserManagement.jsx
├── services/adminApi.js
└── hooks/useAdminAuth.js
```

### Environment Variables
Make sure your `.env` file includes:
```
JWT_SECRET=your-jwt-secret-key
DATABASE_URL=your-postgres-connection-string
```

## Testing

### 1. Test Authentication
```bash
curl -X GET http://localhost:5000/api/admin/dashboard/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Test User Management
```bash
# Get users (requires authentication)
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Next Steps

### Phase 3: Advanced Features (Planned)
- Analytics & Reports with custom report builder
- Activity Logs with advanced filtering
- Storage Management with file browser
- Notification Center with email templates

### Phase 4: Professional Features (Planned)
- Two-factor authentication for admins
- Performance monitoring and alerts
- Integration capabilities (webhooks, API management)
- Comprehensive testing and documentation

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check your DATABASE_URL in .env file
   - Ensure PostgreSQL is running
   - Verify database credentials

2. **Permission Denied Errors**
   - Ensure user has admin role in database
   - Check that permissions are properly assigned
   - Verify JWT token is valid

3. **404 Errors on Admin Routes**
   - Ensure both frontend and backend servers are running
   - Check that admin routes are properly registered
   - Verify API base URL in frontend

### Logs
- Backend logs: Check server console output
- Database logs: Check PostgreSQL logs
- Frontend logs: Check browser developer console

## Support
For issues or questions about the admin panel:
1. Check this documentation
2. Review the code comments
3. Check the browser console for frontend errors
4. Check server logs for backend errors
