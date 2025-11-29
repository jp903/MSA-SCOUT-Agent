export interface RolePermissions {
  user: string[];
  admin: string[];
  superuser: string[];
}

// Define permissions for each role
export const ROLE_PERMISSIONS: RolePermissions = {
  user: [
    'read:own-properties',
    'create:own-properties',
    'update:own-properties',
    'delete:own-properties',
    'upload:roi-documents',
    'read:own-roi-documents',
    'chat:access',
    'dashboard:access'
  ],
  admin: [
    'read:own-properties',
    'create:own-properties',
    'update:own-properties',
    'delete:own-properties',
    'read:all-properties',
    'update:all-properties',
    'upload:roi-documents',
    'read:own-roi-documents',
    'read:all-roi-documents',
    'manage:users',
    'chat:access',
    'dashboard:access'
  ],
  superuser: [
    'read:own-properties',
    'create:own-properties',
    'update:own-properties',
    'delete:own-properties',
    'read:all-properties',
    'create:all-properties',
    'update:all-properties',
    'delete:all-properties',
    'upload:roi-documents',
    'read:own-roi-documents',
    'read:all-roi-documents',
    'manage:users',
    'manage:roles',
    'system:admin',
    'chat:access',
    'dashboard:access'
  ]
};

export const roleHierarchy = {
  user: 1,
  admin: 2,
  superuser: 3
};

export function hasPermission(userRole: string, requiredPermission: string): boolean {
  if (!ROLE_PERMISSIONS[userRole as keyof RolePermissions]) {
    return false;
  }
  
  const permissions = ROLE_PERMISSIONS[userRole as keyof RolePermissions];
  return permissions.includes(requiredPermission);
}

export function hasRole(userRole: string, requiredRole: string): boolean {
  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;
  return userLevel >= requiredLevel;
}

export function canAccessResource(userRole: string, resourceOwnerId: string, currentUserId: string): boolean {
  // Users can always access their own resources
  if (resourceOwnerId === currentUserId) {
    return true;
  }
  
  // Admins and superusers can access resources of others
  return userRole === 'admin' || userRole === 'superuser';
}