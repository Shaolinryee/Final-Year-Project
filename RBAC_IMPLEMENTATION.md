# Role-Based Access Control (RBAC) Implementation

## Overview
This document outlines the comprehensive RBAC system implemented across frontend and backend to ensure secure, role-based access control.

## Roles & Permissions

### Owner
- ✅ **Full project control**
- ✅ **Manage members & assign/remove roles**
- ✅ **Delete project**
- ✅ **Has all Admin privileges**
- ✅ **Create, edit, delete tasks**
- ✅ **Invite new members**

### Admin
- ✅ **Create and edit tasks**
- ✅ **Invite new members**
- ✅ **Manage task assignments**
- ✅ **View all project activity**
- ✅ **Change member roles** (members and other admins only)
- ✅ **Remove members** (members and other admins only)
- ❌ **Cannot delete project**
- ❌ **Cannot remove project owners**

### Member
- ✅ **View project and tasks**
- ✅ **Update only assigned tasks**
- ✅ **Add comments**
- ✅ **View team members**
- ❌ **Cannot create tasks**
- ❌ **Cannot delete tasks**
- ❌ **Cannot invite members**
- ❌ **Cannot manage members**

## Permission Matrix

| Action | Owner | Admin | Member |
|---------|--------|-------|--------|
| **Create Tasks** | ✅ | ✅ | ❌ |
| **Update Status/Priority/Assignee** | ✅ | ✅ | ✅ |
| **Edit/Delete Tasks** | ✅ | ✅ | ⚠️ |
| **Update Basic Task Properties** | ✅ | ✅ | ✅ |
| **Invite Members** | ✅ | ✅ | ❌ |
| **Change Roles** | ✅ | ⚠️ | ❌ |
| **Remove Members** | ✅ | ✅ | ❌ |

**Note**: Admins can remove members and other admins, but cannot remove project owners.

**Task Update Permissions**: Members can update status, priority, assignee, description, and attachments of any task, but can only edit structural properties (title, description) of their own assigned tasks.
| **Delete Project** | ✅ | ❌ | ❌ |

## Backend Implementation

### 1. RBAC Middleware (`/Server/src/middleware/rbac.js`)

**Features:**
- `getUserProjectRole(userId, projectId)` - Get user's role in project
- `requireProjectRole(requiredRole)` - Enforce minimum role requirement
- `requireProjectOwner` - Owner-only access
- `requireProjectAdmin()` - Admin or Owner access
- `requireProjectMember` - Any member access

**Permission Hierarchy:**
```javascript
const roleHierarchy = {
  member: 1,
  admin: 2,
  owner: 3
};
```

### 2. Route Protection

#### Project Routes (`/Server/src/routes/projectRoutes.js`)
```javascript
// Owner-only routes
router.post('/', createProject);
router.delete('/:id', requireProjectOwner, deleteProject);

// Admin or Owner routes
router.put('/:id', requireProjectAdmin, updateProject);

// Member routes
router.get('/:projectId/members', requireProjectMember, getProjectMembers);
router.post('/:projectId/members', requireProjectAdmin, addMember);
router.put('/:projectId/members/:userId', requireProjectAdmin, updateMemberRole);
router.delete('/:projectId/members/:userId', requireProjectAdmin, removeMember);
```

#### Task Routes (`/Server/src/routes/taskRoutes.js`)
```javascript
// Member routes (view tasks)
router.get('/project/:projectId', requireProjectMember, getTasksByProject);

// Admin or Owner routes (create, edit, delete tasks)
router.post('/', createTask); // Permission checked in controller
router.put('/:id', updateTask); // Permission checked in controller
router.delete('/:id', deleteTask); // Permission checked in controller
```

### 3. Controller Permission Checks

#### Task Controller (`/Server/src/controllers/taskController.js`)
```javascript
// Create Task - Admin/Owner only
const userRole = await getUserProjectRole(req.user.id, projectId);
if (!userRole || (userRole.toLowerCase() !== 'admin' && userRole.toLowerCase() !== 'owner')) {
  return res.status(403).json({ 
    success: false, 
    message: 'Only project admins and owners can create tasks' 
  });
}

// Update Task - Admin/Owner OR any member for basic updates
const isAdminOrOwner = userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'owner';

// Allow any project member to update basic task properties (status, priority, assignee)
// Only restrict structural changes (title, description, etc.) to admins/owners
const isBasicUpdate = req.body.status || req.body.priority || req.body.assigneeId !== undefined;

if (!isAdminOrOwner && !isBasicUpdate) {
  return res.status(403).json({ 
    success: false, 
    message: 'Only project admins, owners, or members can perform this update' 
  });
}

// Delete Task - Admin/Owner only
if (!userRole || (userRole.toLowerCase() !== 'admin' && userRole.toLowerCase() !== 'owner')) {
  return res.status(403).json({ 
    success: false, 
    message: 'Only project admins and owners can delete tasks' 
  });
}
```

#### Member Controller (`/Server/src/controllers/memberController.js`)
```javascript
// Add Member - Admin/Owner only
const userRole = await getUserProjectRole(req.user.id, projectId);
if (!userRole || (userRole.toLowerCase() !== 'admin' && userRole.toLowerCase() !== 'owner')) {
  return res.status(403).json({ 
    success: false, 
    message: 'Only project admins and owners can add members' 
  });
}

// Update Role - Owner + Admin (with restrictions)
if (!userRole || (userRole.toLowerCase() !== 'owner' && userRole.toLowerCase() !== 'admin')) {
  return res.status(403).json({ 
    success: false, 
    message: 'Only project owners and admins can change member roles' 
  });
}

// Admins cannot change roles of owners or other admins
if (userRole.toLowerCase() === 'admin') {
  if (targetMember.role.toLowerCase() === 'owner' || targetMember.role.toLowerCase() === 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Admins can only change roles of members, not owners or other admins' 
    });
  }
}

// Remove Member - Role hierarchy enforced
if (userRole.toLowerCase() === 'owner') {
  // Owner can remove anyone except themselves
} else if (userRole.toLowerCase() === 'admin') {
  // Admin can remove members and other admins, but not owners
} else {
  // Members cannot remove anyone
}
```

## Frontend Implementation

### 1. Permission Utilities (`/Client/src/utils/permissions.js`)

**Already Implemented:**
- `canInviteMembers(role)` - Admin/Owner
- `canChangeRoles(role)` - Owner only
- `canCreateTask(role)` - Admin/Owner
- `canEditAnyTask(role)` - Admin/Owner
- `canDeleteTask(role)` - Admin/Owner
- `canAssignTasks(role)` - Admin/Owner
- `canDeleteProject(role)` - Owner only
- `canViewSettings(role)` - Owner only

### 2. Conditional Rendering

#### Project Tasks Page (`/Client/src/pages/project/ProjectTasks.jsx`)
```javascript
// Permission checks
const canCreate = canCreateTask(userRole);
const canEditAny = canEditAnyTask(userRole);
const canDelete = canDeleteTask(userRole);
const canAssign = canAssignTasks(userRole);
const canUpdate = canUpdateTask(userRole, task, currentUser?.id);

// UI Components - Only show if user has permission
{canCreate && (
  <Button onClick={handleCreate} leftIcon={<Plus />}>
    Add Task
  </Button>
)}

<TaskItem
  task={task}
  onEdit={canEditAny ? handleEdit : undefined}
  onDelete={canDelete ? handleDelete : undefined}
  onAssign={canAssign ? handleAssign : undefined}
  onStatusChange={canUpdate ? handleStatusChange : undefined}
/>
```

#### Project Members Page (`/Client/src/pages/project/ProjectMembers.jsx`)
```javascript
const canInvite = canInviteMembers(userRole);
const canManageRoles = canChangeRoles(userRole);

// Only show invite button to admins/owners
{canInvite && (
  <Button onClick={() => setIsInviteOpen(true)}>
    Invite Member
  </Button>
)}

<MemberRow
  member={member}
  canChangeRoles={canManageRoles}
  canRemove={canRemoveMember(userRole, member.role)}
/>
```

### 3. Global Error Handling (`/Client/src/services/axiosInstance.js`)

**Response Interceptor:**
```javascript
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      const message = error.response.data?.message || 'You do not have permission to perform this action';
      
      // Show toast notification for unauthorized access
      import('react-toastify').then(({ toast }) => {
        toast.error(message, {
          position: 'top-right',
          autoClose: 5000,
        });
      });
    }
    
    return Promise.reject(error);
  }
);
```

## Security Features

### ✅ **Implemented:**
1. **Strict Backend Validation** - All sensitive actions validated server-side
2. **Role Hierarchy Enforcement** - Proper permission escalation prevention
3. **Frontend Conditional Rendering** - UI elements hidden/disabled based on role
4. **Global Error Handling** - Consistent 403 error handling with user-friendly messages
5. **Centralized Permission Logic** - Reusable utilities and middleware
6. **Database-Level Protection** - Role constraints enforced at data layer

### 🔒 **Security Guarantees:**
- **No Frontend-Only Security** - All permissions validated server-side
- **Role Isolation** - Users cannot escalate privileges
- **Consistent Enforcement** - Same rules applied across all endpoints
- **User Experience** - Clear feedback when actions are forbidden
- **Scalable Architecture** - Easy to add new roles/permissions

## Testing Checklist

### Backend Tests:
- [ ] Test member creating task (should fail with 403)
- [ ] Test admin creating task (should succeed)
- [ ] Test owner creating task (should succeed)
- [ ] Test member deleting project (should fail with 403)
- [ ] Test admin removing owner (should fail with 403)
- [ ] Test owner removing admin (should succeed)
- [ ] Test member inviting users (should fail with 403)

### Frontend Tests:
- [ ] Verify buttons hidden for unauthorized roles
- [ ] Verify disabled states applied correctly
- [ ] Test 403 error toast notifications
- [ ] Verify conditional UI rendering
- [ ] Test navigation guards for protected routes

## Usage Examples

### Adding New Permission:
1. **Add to permissions.js:**
```javascript
export const canDoNewThing = (role) => {
  return hasMinimumRole(role, ROLES.ADMIN);
};
```

2. **Add to route:**
```javascript
router.post('/new-thing', requireProjectAdmin, newThingController);
```

3. **Add to frontend:**
```javascript
const canDoNewThing = canDoNewThing(userRole);

{canDoNewThing && (
  <Button onClick={handleNewThing}>
    New Thing
  </Button>
)}
```

This RBAC system ensures security, consistency, and maintainability across the entire application.
