export const ROLE_LABELS = {
  owner: 'ওনার',
  super_admin: 'সুপার এডমিন',
  admin: 'এডমিন',
  treasurer: 'কোষাধ্যক্ষ',
  committee_member: 'কমিটি সদস্য',
  general_member: 'সাধারণ সদস্য',
  guest: 'অতিথি',
};

export const MEMBERSHIP_STATUS_LABELS = {
  pending: 'অপেক্ষমাণ',
  active: 'সক্রিয়',
  suspended: 'স্থগিত',
  rejected: 'বাতিল',
  inactive: 'নিষ্ক্রিয়',
};

// Roles allowed to see the admin section at all (individual actions are
// further gated per-endpoint by the backend and, defensively, in the UI).
export const ADMIN_ACCESS_ROLES = ['owner', 'super_admin', 'admin', 'treasurer', 'committee_member'];
export const MANAGE_ROLES = ['owner', 'super_admin', 'admin'];
export const FINANCE_ROLES = ['owner', 'super_admin', 'admin', 'treasurer'];
export const ALL_ROLES = Object.keys(ROLE_LABELS);
