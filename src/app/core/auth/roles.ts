import { RoleUser } from 'src/interfaces/auth.interfaces';

export const ROLE_PERMISSIONS = {
  customer: {
    canManageAddresses: true,
    canAccessAdmin: false
  },
  admin: {
    canManageAddresses: false,
    canAccessAdmin: true
  },
  order_manager: {
    canManageAddresses: false,
    canAccessAdmin: true
  }
};
