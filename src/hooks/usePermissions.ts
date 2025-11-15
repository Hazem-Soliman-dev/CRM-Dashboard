import { useAuth } from './useAuth';

export interface Permission {
  module: string;
  action: string;
  resource?: string;
}

export const usePermissions = () => {
  const { userRole } = useAuth();

  // Map backend roles (lowercase) to frontend permission keys (capitalized)
  const mapBackendRoleToFrontend = (backendRole: string | undefined): string | null => {
    if (!backendRole) return null;
    const normalized = backendRole.toLowerCase();
    
    // Map backend roles to frontend permission keys
    const roleMap: Record<string, string> = {
      'admin': 'Admin',
      'manager': 'Admin', // Manager gets admin permissions
      'agent': 'Sales',
      'customer': 'Customer'
    };
    
    return roleMap[normalized] || null;
  };

  const rolePermissions: Record<string, Permission[]> = {
    Admin: [
      // Full access to everything
      { module: '*', action: '*' }
    ],
    Customer: [
      { module: 'dashboard', action: 'view' },
      { module: 'bookings', action: 'view' },
      { module: 'bookings', action: 'download' },
      { module: 'payments', action: 'view' },
      { module: 'support', action: 'create' },
      { module: 'support', action: 'view' },
      { module: 'support', action: 'update' },
      { module: 'profile', action: 'view' },
      { module: 'profile', action: 'update' },
      { module: 'notifications', action: 'view' }
    ],
    Sales: [
      { module: 'dashboard', action: 'view' },
      { module: 'leads', action: '*' },
      { module: 'customers', action: 'view' },
      { module: 'customers', action: 'create' },
      { module: 'customers', action: 'update' },
      { module: 'sales', action: '*' },
      { module: 'deals', action: '*' },
      { module: 'owners', action: 'view' },
      { module: 'properties', action: 'view' },
      { module: 'listings', action: 'view' },
      { module: 'reports', action: 'view', resource: 'sales' },
      { module: 'bookings', action: 'create' },
      { module: 'bookings', action: 'view', resource: 'assigned' },
      { module: 'notifications', action: 'view' }
    ],
    Reservation: [
      { module: 'dashboard', action: 'view' },
      { module: 'reservations', action: '*' },
      { module: 'customers', action: 'view' },
      { module: 'suppliers', action: '*' },
      { module: 'categories', action: 'view' },
      { module: 'operations', action: 'view' },
      { module: 'activities', action: 'view' },
      { module: 'tasks', action: 'view' },
      { module: 'listings', action: 'view' },
      { module: 'properties', action: 'view' },
      { module: 'payments', action: 'request' },
      { module: 'notifications', action: 'view' }
    ],
    Finance: [
      { module: 'dashboard', action: 'view' },
      { module: 'finance', action: '*' },
      { module: 'payments', action: '*' },
      { module: 'reports', action: 'view', resource: 'financial' },
      { module: 'customers', action: 'view' },
      { module: 'bookings', action: 'view' },
      { module: 'notifications', action: 'view' }
    ],
    Operations: [
      { module: 'dashboard', action: 'view' },
      { module: 'operations', action: '*' },
      { module: 'reservations', action: 'view' },
      { module: 'reservations', action: 'update' },
      { module: 'categories', action: '*' },
      { module: 'tasks', action: '*' },
      { module: 'calendar', action: '*' },
      { module: 'activities', action: '*' },
      { module: 'listings', action: 'view' },
      { module: 'properties', action: 'view' },
      { module: 'notifications', action: 'view' }
    ]
  };

  // Map backend role to frontend role key
  const frontendRoleKey = mapBackendRoleToFrontend(userRole);
  const roleKey = frontendRoleKey && rolePermissions[frontendRoleKey] ? frontendRoleKey : null;

  const hasPermission = (module: string, action: string, resource?: string): boolean => {
    const permissions = (roleKey && rolePermissions[roleKey]) || [];
    
    // Check for wildcard permissions
    if (permissions.some(p => p.module === '*' && p.action === '*')) {
      return true;
    }
    
    // Check for module wildcard
    if (permissions.some(p => p.module === module && p.action === '*')) {
      return true;
    }
    
    // Check for specific permission
    return permissions.some(p => 
      p.module === module && 
      p.action === action && 
      (!p.resource || !resource || p.resource === resource)
    );
  };

  const canAccessModule = (module: string): boolean => {
    return hasPermission(module, 'view') || hasPermission(module, '*');
  };

  const canPerformAction = (module: string, action: string, resource?: string): boolean => {
    return hasPermission(module, action, resource);
  };

  const getAccessibleModules = (): string[] => {
    const allModules = [
      'dashboard',
      'leads',
      'customers',
      'categories',
      'sales',
      'deals',
      'activities',
      'listings',
      'owners',
      'properties',
      'tasks',
      'reservations',
      'finance',
      'operations',
      'reports',
      'support',
      'notifications',
      'settings',
      'users',
      'attendance'
    ];
    
    return allModules.filter(module => canAccessModule(module));
  };

  return {
    hasPermission,
    canAccessModule,
    canPerformAction,
    getAccessibleModules,
    userRole: frontendRoleKey || userRole
  };
};